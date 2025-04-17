import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    // Obtener el cuerpo de la solicitud como texto para verificar HMAC
    const body = await request.text();
    const hmacHeader = request.headers.get("x-shopify-hmac-sha256");

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


    // Aquí implementarías la lógica para eliminar los datos del cliente
    // Por ejemplo:

    // 1. Buscar todos los datos del cliente en tu base de datos
    // const customerId = data.customer.id
    // const shopId = data.shop_id

    // 2. Anonimizar o eliminar estos datos
    // await supabase
    //   .from('customer_data')
    //   .update({
    //     email: 'redacted',
    //     name: 'redacted',
    //     phone: 'redacted',
    //     address: 'redacted',
    //     is_redacted: true
    //   })
    //   .eq('shopify_customer_id', customerId)
    //   .eq('shopify_shop_id', shopId)

    // Para este ejemplo, simplemente respondemos con éxito
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en webhook customers/data-erasure:", error);
    return NextResponse.json(
      { message: "Error processing webhook" },
      { status: 500 }
    );
  }
}
