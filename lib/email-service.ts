import { Resend } from "resend";
import OrderNotificationEmail from "@/components/emails/order-notification-email";
import { formatPrice } from "@/lib/utils";

// Inicializar Resend con la API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Interfaz para los datos de la orden
interface OrderData {
  id: string;
  status: string;
  total_amount: number;
  cancelation_reason?: string;
  provider_business_id?: string;
  address?: {
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    country?: string;
    additional_notes?: string;
  };
  client?: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
  };
  provider_shipped_user?: {
    first_name: string;
    last_name: string;
  };
  provider_user?: {
    first_name: string;
    last_name: string;
  };
  catalog_product_id?: number;
  catalog_product_variant_id?: number;
  product?: {
    product_info?: {
      name: string;
      images_url?: string[];
      brand?: {
        name: string;
      };
    };
    variant?: {
      name: string;
      variant_list?: {
        name: string;
      };
    };
  };
}

// Interfaz para los destinatarios del correo
interface EmailRecipient {
  email: string;
  name?: string;
}

// Función para formatear la dirección
function formatAddress(address: any) {
  if (!address) return "";

  let formattedAddress = address.street_address;
  if (address.city) formattedAddress += `, ${address.city}`;
  if (address.state) formattedAddress += `, ${address.state}`;
  if (address.postal_code) formattedAddress += `, ${address.postal_code}`;
  if (address.country && address.country !== "México")
    formattedAddress += `, ${address.country}`;

  return formattedAddress;
}

// Función para enviar correo electrónico de notificación de orden
export async function sendOrderNotificationEmail(
  orderDetails: OrderData,
  recipients: EmailRecipient[],
  isNewRecord: boolean,
  oldStatus?: string
) {
  if (!orderDetails || !recipients || recipients.length === 0) {
    console.error("Datos insuficientes para enviar correo electrónico");
    return { success: false, error: "Datos insuficientes", sent: 0, total: 0 };
  }

  try {
    // Extraer información relevante
    const productName =
      orderDetails.product?.product_info?.name || "un producto";
    const brandName = orderDetails.product?.product_info?.brand?.name || "";

    // Solo mostrar la variante si no es "Default"
    let variantName = "";
    if (
      orderDetails.product?.variant?.name &&
      orderDetails.product.variant.name !== "Default" &&
      orderDetails.product.variant.variant_list?.name
    ) {
      variantName = `${orderDetails.product.variant.variant_list.name}: ${orderDetails.product.variant.name}`;
    }

    const formattedAmount = formatPrice(orderDetails.total_amount);
    const formattedAddress = formatAddress(orderDetails.address);

    // Obtener la primera imagen del producto si existe
    const productImage =
      orderDetails.product?.product_info?.images_url?.[0] || "";

    // Información del cliente
    const clientName = orderDetails.client
      ? `${orderDetails.client.first_name} ${orderDetails.client.last_name}`
      : "";
    const clientEmail = orderDetails.client?.email || "";

    // Variables para el correo
    let emailStatus = "";
    let statusMessage = "";
    let additionalInfo = "";
    let shippedBy = "";

    // Personalizar correo según el estado de la orden
    if (isNewRecord) {
      emailStatus = "new";
      statusMessage = `Has recibido un nuevo pedido.`;
      additionalInfo =
        "Por favor, revisa y confirma esta orden lo antes posible.";
    } else {
      emailStatus = orderDetails.status;

      switch (orderDetails.status) {
        case "requires_confirmation":
          statusMessage = `La orden #${orderDetails.id} requiere tu confirmación para continuar con el proceso.`;
          additionalInfo =
            "Por favor, revisa y confirma esta orden lo antes posible.";
          break;
        case "pending":
          statusMessage = `La orden #${orderDetails.id} ha sido confirmada. Comenzaremos a procesar el pago.`;
          additionalInfo =
            "Te notificaremos cuando el pago haya sido procesado.";
          break;
        case "paid":
          statusMessage = `El pago de la orden #${orderDetails.id} ha sido procesado.`;
          additionalInfo = "Ya puedes preparar y enviar el pedido.";
          break;
        case "shipped":
          shippedBy = orderDetails.provider_shipped_user
            ? `${orderDetails.provider_shipped_user.first_name} ${orderDetails.provider_shipped_user.last_name}`
            : "El proveedor";
          statusMessage = `${shippedBy} ha enviado la orden #${orderDetails.id}.`;
          additionalInfo =
            "Te notificaremos cuando la orden haya sido entregada.";
          break;
        case "delivered":
          statusMessage = `La orden #${orderDetails.id} ha sido entregada con éxito.`;
          break;
        case "canceled":
          statusMessage = `La orden #${orderDetails.id} ha sido cancelada.`;
          break;
      }
    }

    // Enviar correo a cada destinatario
    const emailPromises = recipients.map(async (recipient) => {
      if (!recipient.email) {
        console.error("Destinatario sin correo electrónico:", recipient);
        return null;
      }

      try {
        // Determinar el asunto del correo según el estado
        let subject = "Actualización de orden";
        switch (emailStatus) {
          case "new":
            subject = `¡Nueva orden recibida! - #${orderDetails.id}`;
            break;
          case "requires_confirmation":
            subject = `Orden pendiente de confirmación - #${orderDetails.id}`;
            break;
          case "pending":
            subject = `Orden confirmada - #${orderDetails.id}`;
            break;
          case "paid":
            subject = `Pago recibido - Orden #${orderDetails.id}`;
            break;
          case "shipped":
            subject = `Orden enviada - #${orderDetails.id}`;
            break;
          case "delivered":
            subject = `Orden entregada - #${orderDetails.id}`;
            break;
          case "canceled":
            subject = `Orden cancelada - #${orderDetails.id}`;
            break;
        }

        // Enviar correo con Resend
        return resend.emails.send({
          from: "Knoott <soporte@knoott.com>",
          to: recipient.email,
          subject,
          react: OrderNotificationEmail({
            firstName: recipient.name?.split(" ")[0] || "Usuario",
            productName,
            productImage,
            variantName,
            brandName,
            amount: formattedAmount,
            orderId: orderDetails.id,
            status: emailStatus,
            statusMessage,
            additionalInfo,
            address: formattedAddress,
            shippedBy,
            cancelReason: orderDetails.cancelation_reason,
            clientName,
            clientEmail,
            providerBusinessId: orderDetails.provider_business_id,
          }),
        });
      } catch (error) {
        console.error(`Error al enviar correo a ${recipient.email}:`, error);
        return null;
      }
    });

    // Esperar a que todos los correos se envíen
    const results = await Promise.all(emailPromises);
    const validResults = results.filter(Boolean);

    return {
      success: validResults.length > 0,
      results: validResults,
      sent: validResults.length,
      total: recipients.length,
    };
  } catch (error) {
    console.error("Error al enviar correo electrónico:", error);
    return {
      success: false,
      error,
      sent: 0,
      total: recipients.length,
    };
  }
}
