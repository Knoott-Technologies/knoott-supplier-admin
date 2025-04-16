import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    // Obtener el cuerpo de la solicitud como texto para verificar HMAC
    const body = await request.text();
    const hmacHeader = request.headers.get("x-shopify-hmac-sha256");
    const shopDomain = request.headers.get("x-shopify-shop-domain");

    console.log("Webhook recibido (customers/data-request):", {
      shop: shopDomain,
      hmac: hmacHeader,
    });

    // Verificar la autenticidad del webhook
    if (process.env.SHOPIFY_API_SECRET) {
      const hmac = crypto
        .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
        .update(body)
        .digest("base64");

      if (hmac !== hmacHeader) {
        console.error("Webhook inválido: firma HMAC no coincide");
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
    }

    // Parsear el cuerpo JSON después de verificar HMAC
    const data = JSON.parse(body);

    // Registrar la solicitud de datos
    console.log("Solicitud de datos del cliente recibida:", {
      shop_id: data.shop_id,
      shop_domain: data.shop_domain,
      customer: data.customer,
      orders_requested: data.orders_requested,
    });

    // Aquí implementarías la lógica para recopilar los datos del cliente
    // y enviarlos de vuelta a Shopify o al cliente según corresponda

    // Por ejemplo, podrías:
    // 1. Buscar todos los datos del cliente en tu base de datos
    // 2. Generar un archivo con estos datos
    // 3. Almacenar este archivo para que el cliente pueda descargarlo
    // 4. Notificar a Shopify que los datos están listos

    // Para este ejemplo, simplemente respondemos con éxito
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en webhook customers/data-request:", error);
    return NextResponse.json(
      { message: "Error processing webhook" },
      { status: 500 }
    );
  }
}
