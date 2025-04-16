import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    // Obtener el cuerpo de la solicitud como texto para verificar HMAC
    const body = await request.text();
    const hmacHeader = request.headers.get("x-shopify-hmac-sha256");
    const shopDomain = request.headers.get("x-shopify-shop-domain");

    console.log("Webhook recibido (shop/redact):", {
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
    const supabase = createClient(cookies());

    // Registrar la solicitud de supresión de datos de tienda
    console.log("Solicitud de supresión de datos de tienda recibida:", {
      shop_id: data.shop_id,
      shop_domain: data.shop_domain,
    });

    // Aquí implementarías la lógica para eliminar o anonimizar todos los datos
    // relacionados con esta tienda en tu aplicación

    // Por ejemplo:

    // 1. Marcar la integración como eliminada
    // await supabase
    //   .from('shopify_integrations')
    //   .update({
    //     status: 'redacted',
    //     access_token: null,
    //     shop_name: 'redacted',
    //     shop_owner: 'redacted',
    //     shop_email: 'redacted',
    //     is_data_redacted: true,
    //     redacted_at: new Date().toISOString()
    //   })
    //   .eq('shop_domain', data.shop_domain)

    // 2. Opcionalmente, programar la eliminación completa de datos después de un período
    // de retención (por ejemplo, 30 días)

    // Para este ejemplo, simplemente respondemos con éxito
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en webhook shop/redact:", error);
    return NextResponse.json(
      { message: "Error processing webhook" },
      { status: 500 }
    );
  }
}
