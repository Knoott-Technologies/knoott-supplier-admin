import { createAdminClient } from "@/utils/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { formatPrice } from "@/lib/utils";
import { sendOrderNotificationEmail } from "@/lib/email-service";

// Configurar VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Obtener datos del webhook
    const data = await req.json();
    const { record, old_record } = data;

    if (!record || !record.provider_business_id) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    // Crear cliente de Supabase con cuenta de servicio
    const supabase = createAdminClient();

    // Obtener detalles adicionales de la orden usando la estructura de consulta proporcionada
    const { data: orderDetails, error: orderError } = await supabase
      .from("wedding_product_orders")
      .select(
        `
        *, 
        address:wedding_addresses(
          id, street_address, city, state, postal_code, country, additional_notes
        ), 
        client:users!wedding_product_orders_ordered_by_fkey(
          id, first_name, last_name, email, phone_number
        ), 
        provider_shipped_user:users!wedding_product_orders_shipped_ordered_by_fkey(
          id, first_name, last_name
        ), 
        provider_user:users!wedding_product_orders_confirmed_by_fkey(
          id, first_name, last_name
        ),
        catalog_product:products!wedding_product_orders_catalog_product_id_fkey(
          id, name, short_name, description, images_url,
          brand:catalog_brands(id, name)
        ),
        catalog_variant:products_variant_options!wedding_product_orders_catalog_product_variant_id_fkey(
          id, name, display_name, price,
          variant:products_variants(id, name, display_name)
        )
      `
      )
      .eq("id", record.id)
      .single();

    if (orderError) {
      console.error("Error al obtener detalles de la orden:", orderError);
      return NextResponse.json(
        { error: "Error al procesar datos" },
        { status: 500 }
      );
    }

    // Extraer información relevante para las notificaciones
    const productName = orderDetails?.catalog_product?.name || "un producto";
    const brandName = orderDetails?.catalog_product?.brand?.name || "";

    // Solo mostrar la variante si no es "Default"
    let variantName = "";
    if (
      orderDetails?.catalog_variant?.name &&
      orderDetails.catalog_variant.name !== "Default" &&
      orderDetails.catalog_variant.variant?.name
    ) {
      variantName = `${orderDetails.catalog_variant.variant.name}: ${orderDetails.catalog_variant.name}`;
    }

    const formattedAmount = formatPrice(orderDetails?.total_amount || 0);

    // Obtener la primera imagen del producto si existe
    const productImage = orderDetails?.catalog_product?.images_url?.[0] || "";

    // Variables para la notificación
    let notificationTitle = "Actualización de orden";
    let notificationBody = "Hay una actualización en tu orden.";
    let notificationUrl = `/dashboard/${record.provider_business_id}/orders/${record.id}`;

    // Verificar si es un nuevo registro o una actualización
    const isNewRecord = !old_record;
    const statusChanged = old_record && old_record.status !== record.status;

    // Personalizar notificación según el estado de la orden
    if (isNewRecord) {
      // Nueva orden - notificar al proveedor
      notificationTitle = "¡Nueva orden recibida! 🛍️";
      notificationBody = `Has recibido un pedido de ${productName}${
        variantName ? ` (${variantName})` : ""
      }${brandName ? ` de ${brandName}` : ""} por ${formattedAmount}.`;
    } else if (statusChanged) {
      switch (record.status) {
        case "requires_confirmation":
          // Requiere confirmación - notificar al proveedor
          notificationTitle = "Orden pendiente de confirmación ⏳";
          notificationBody = `La orden #${record.id} de ${productName}${
            variantName ? ` (${variantName})` : ""
          } requiere tu confirmación para continuar con el proceso.`;
          notificationUrl = `/dashboard/${record.provider_business_id}/orders/${record.id}#confirmation`;
          break;
        case "pending":
          // Confirmada - esperando pago del administrador
          notificationTitle = "Orden confirmada ✅";
          notificationBody = `La orden #${record.id} de ${productName}${
            variantName ? ` (${variantName})` : ""
          } ha sido confirmada. Comenzaremos a procesar el pago.`;
          break;
        case "paid":
          // Pagada - lista para enviar
          notificationTitle = "Pago recibido 💰";
          notificationBody = `El pago de la orden #${record.id} de ${productName}${
            variantName ? ` (${variantName})` : ""
          } ha sido procesado. Ya puedes preparar y enviar el pedido.`;
          break;
        case "shipped":
          // Enviada
          const shippedBy = orderDetails?.provider_shipped_user
            ? `${orderDetails.provider_shipped_user.first_name} ${orderDetails.provider_shipped_user.last_name}`
            : "El proveedor";

          notificationTitle = "Orden enviada 🚚";
          notificationBody = `${shippedBy} ha enviado la orden #${
            record.id
          } de ${productName}${variantName ? ` (${variantName})` : ""}.`;
          break;
        case "delivered":
          // Entregada
          notificationTitle = "Orden entregada 📦";
          notificationBody = `La orden #${record.id} de ${productName}${
            variantName ? ` (${variantName})` : ""
          } ha sido entregada con éxito.`;
          break;
        case "canceled":
          // Cancelada
          const cancelReason = record.cancelation_reason
            ? ` Motivo: ${record.cancelation_reason}`
            : "";

          notificationTitle = "Orden cancelada ❌";
          notificationBody = `La orden #${record.id} de ${productName}${
            variantName ? ` (${variantName})` : ""
          } ha sido cancelada.${cancelReason}`;
          break;
      }
    }

    // Resultados de notificaciones
    const notificationResults = {
      push: { sent: 0, success: true },
      email: { sent: 0, success: true },
    };

    // Primero obtenemos los IDs de usuario asociados con el negocio del proveedor
    const { data: providerBusinessUsers, error: providerBusinessUsersError } =
      await supabase
        .from("provider_business_users")
        .select("user_id")
        .eq("business_id", record.provider_business_id);

    if (providerBusinessUsersError) {
      console.error(
        "Error al obtener usuarios del proveedor:",
        providerBusinessUsersError
      );
      return NextResponse.json(
        { error: "Error al procesar datos" },
        { status: 500 }
      );
    }

    // Si no hay usuarios para notificar, terminar
    if (!providerBusinessUsers || providerBusinessUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No hay usuarios para notificar",
        notificationResults,
      });
    }

    // Extraer los IDs de usuario
    const userIds = providerBusinessUsers.map((pu) => pu.user_id);

    // Luego obtenemos los detalles de esos usuarios desde la tabla users
    const { data: providerUsers, error: providerUsersError } = await supabase
      .from("users")
      .select("id, first_name, last_name, email")
      .in("id", userIds)
      .eq("status", "active"); // Solo usuarios activos

    if (providerUsersError) {
      console.error(
        "Error al obtener detalles de usuarios:",
        providerUsersError
      );
      return NextResponse.json(
        { error: "Error al procesar datos" },
        { status: 500 }
      );
    }

    // Preparar destinatarios de correo electrónico
    const emailRecipients = providerUsers
      .filter((user) => user.email)
      .map((user) => ({
        email: user.email,
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      }));

    // Enviar notificaciones por correo electrónico
    if (emailRecipients.length > 0) {
      try {
        // Preparar datos de la orden para el correo
        const emailOrderData = {
          ...orderDetails,
          product: {
            product_info: {
              name: orderDetails.catalog_product?.name,
              images_url: orderDetails.catalog_product?.images_url,
              brand: {
                name: orderDetails.catalog_product?.brand?.name,
              },
            },
            variant: {
              name: orderDetails.catalog_variant?.name,
              variant_list: {
                name: orderDetails.catalog_variant?.variant?.name,
              },
            },
          },
        };

        const emailResult = await sendOrderNotificationEmail(
          emailOrderData,
          emailRecipients,
          isNewRecord,
          old_record?.status
        );

        notificationResults.email = {
          sent: emailResult.sent || 0,
          success: emailResult.success,
        };
      } catch (emailError) {
        console.error("Error al enviar correos electrónicos:", emailError);
        notificationResults.email.success = false;
      }
    }

    // Obtener suscripciones push para estos usuarios
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .in("user_id", userIds)
      .eq("app_reference", "suppliers");

    if (subscriptionsError) {
      console.error("Error al obtener suscripciones:", subscriptionsError);
      // Continuar con el proceso aunque haya error en las suscripciones push
    }

    // Si no hay suscripciones push, terminar después de enviar correos
    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Correos enviados, no hay suscripciones push para notificar",
        notificationResults,
      });
    }

    // Enviar notificaciones push a cada suscripción
    try {
      const notificationPromises = subscriptions.map((subscription) => {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };

        const payload = JSON.stringify({
          title: notificationTitle,
          body: notificationBody,
          icon: "/icon/logo-192x192.png",
          badge: "/icon/badge-72x72.png",
          url: notificationUrl,
        });

        return webpush
          .sendNotification(pushSubscription, payload)
          .catch((error: { statusCode: number }) => {
            console.error("Error al enviar notificación push:", error);

            // Si la suscripción ya no es válida, eliminarla
            if (error.statusCode === 410) {
              return supabase
                .from("push_subscriptions")
                .delete()
                .match({ id: subscription.id });
            }
          });
      });

      await Promise.all(notificationPromises);

      notificationResults.push = {
        sent: subscriptions.length,
        success: true,
      };
    } catch (pushError) {
      console.error("Error al enviar notificaciones push:", pushError);
      notificationResults.push.success = false;
    }

    return NextResponse.json({
      success: true,
      notificationResults,
      notification: {
        title: notificationTitle,
        body: notificationBody,
      },
    });
  } catch (error) {
    console.error("Error en webhook de órdenes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
