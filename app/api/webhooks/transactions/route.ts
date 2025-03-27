// app/api/webhooks/orders/route.ts
import { createAdminClient } from "@/utils/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { formatPrice } from "@/lib/utils";

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

    if (!record || !record.provider_branch_id) {
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
        address:wedding_addresses(*), 
        client:users!wedding_product_orders_ordered_by_fkey(*), 
        provider_shipped_user:users!wedding_product_orders_shipped_ordered_by_fkey(*), 
        provider_user:users!wedding_product_orders_confirmed_by_fkey(*), 
        product:wedding_products!wedding_product_orders_product_id_fkey(
          id, 
          variant:products_variant_options(
            *, 
            variant_list:products_variants(*)
          ), 
          product_info:products(
            *, 
            brand:catalog_brands(*), 
            subcategory:catalog_collections(*)
          )
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
    const productName =
      orderDetails?.product?.product_info?.name || "un producto";
    const brandName = orderDetails?.product?.product_info?.brand?.name || "";
    const variantName =
      orderDetails?.product?.variant?.variant_list?.name || "";
    const clientName = orderDetails?.client
      ? `${orderDetails.client.first_name} ${orderDetails.client.last_name}`
      : "Un cliente";
    const formattedAmount = formatPrice(orderDetails?.total_amount || 0);

    // Variables para la notificación
    let notificationTitle = "Actualización de orden";
    let notificationBody = "Hay una actualización en tu orden.";
    let notificationUrl = `/dashboard/${record.provider_branch_id}/orders/${record.id}`;

    // Verificar si es un nuevo registro o una actualización
    const isNewRecord = !old_record;
    const statusChanged = old_record && old_record.status !== record.status;

    // Personalizar notificación según el estado de la orden
    if (isNewRecord) {
      // Nueva orden - notificar al proveedor
      notificationTitle = "¡Nueva orden recibida! 🛍️";
      notificationBody = `${clientName} ha realizado un pedido de ${productName}${
        variantName ? ` (${variantName})` : ""
      }${brandName ? ` de ${brandName}` : ""} por MXN ${formattedAmount}.`;
    } else if (statusChanged) {
      switch (record.status) {
        case "requires_confirmation":
          // Requiere confirmación - notificar al proveedor
          notificationTitle = "Orden pendiente de confirmación ⏳";
          notificationBody = `La orden #${record.id} de ${productName}${
            variantName ? ` (${variantName})` : ""
          } requiere tu confirmación para continuar con el proceso.`;
          notificationUrl = `/dashboard/${record.provider_branch_id}/orders/${record.id}#confirmation`;
          break;
        case "pending":
          // Confirmada
          notificationTitle = "Orden confirmada ✅";
          notificationBody = `La orden #${record.id} de ${productName}${
            variantName ? ` (${variantName})` : ""
          } ha sido confirmada y está siendo procesada.`;
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

    // Obtener usuarios del proveedor
    const { data: providerUsers, error: providerUsersError } = await supabase
      .from("user_provider_branches")
      .select("user_id")
      .eq("provider_branch_id", record.provider_branch_id);

    if (providerUsersError) {
      console.error(
        "Error al obtener usuarios del proveedor:",
        providerUsersError
      );
      return NextResponse.json(
        { error: "Error al procesar datos" },
        { status: 500 }
      );
    }

    // Si no hay usuarios para notificar, terminar
    if (!providerUsers || providerUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No hay usuarios para notificar",
      });
    }

    const userIds = providerUsers.map((pu) => pu.user_id);

    // Obtener suscripciones push para estos usuarios
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .in("user_id", userIds);

    if (subscriptionsError) {
      console.error("Error al obtener suscripciones:", subscriptionsError);
      return NextResponse.json(
        { error: "Error al procesar datos" },
        { status: 500 }
      );
    }

    // Si no hay suscripciones, terminar
    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No hay suscripciones para notificar",
      });
    }

    // Enviar notificaciones a cada suscripción
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

    return NextResponse.json({
      success: true,
      notified: subscriptions.length,
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
