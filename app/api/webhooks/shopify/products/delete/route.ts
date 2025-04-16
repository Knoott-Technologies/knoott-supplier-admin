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

    console.log("Webhook recibido (products/delete):", {
      shop: shopDomain,
      hmac: hmacHeader,
      webhookId: request.headers.get("x-shopify-webhook-id"),
      eventId: request.headers.get("x-shopify-event-id"),
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

    // Obtener la integración correspondiente a esta tienda
    const { data: integration, error: integrationError } = await supabase
      .from("shopify_integrations")
      .select("id, business_id")
      .eq("shop_domain", shopDomain)
      .eq("status", "active")
      .single();

    if (integrationError || !integration) {
      console.error(
        `No se encontró integración para la tienda ${shopDomain}:`,
        integrationError
      );
      return NextResponse.json(
        { message: "Integration not found" },
        { status: 404 }
      );
    }

    // Procesar la eliminación del producto en segundo plano
    // Respondemos inmediatamente para cumplir con el límite de tiempo de Shopify
    const responsePromise = NextResponse.json({ success: true });

    // Procesamiento asíncrono
    handleProductDelete(data, integration, supabase).catch((error) => {
      console.error("Error procesando eliminación de producto:", error);
    });

    return responsePromise;
  } catch (error) {
    console.error("Error en webhook products/delete:", error);
    return NextResponse.json(
      { message: "Error processing webhook" },
      { status: 500 }
    );
  }
}

async function handleProductDelete(
  product: any,
  integration: { id: string; business_id: string },
  supabase: any
) {
  try {
    console.log(
      `Procesando eliminación del producto ${product.id} para la integración ${integration.id}`
    );

    // Buscar el producto en la tabla de mapeo
    const { data: shopifyProduct } = await supabase
      .from("shopify_products")
      .select("id, platform_product_id")
      .eq("integration_id", integration.id)
      .eq("shopify_product_id", product.id.toString())
      .single();

    if (shopifyProduct?.platform_product_id) {
      console.log(
        `Producto encontrado, ID en plataforma: ${shopifyProduct.platform_product_id}`
      );

      // Opción 1: Eliminar el producto completamente
      // const { error: deleteError } = await supabase
      //   .from("products")
      //   .delete()
      //   .eq("id", shopifyProduct.platform_product_id);

      // Opción 2: Marcar el producto como inactivo (recomendado)
      const { error: updateError } = await supabase
        .from("products")
        .update({ status: "inactive" })
        .eq("id", shopifyProduct.platform_product_id);

      if (updateError) {
        throw new Error(
          `Error al marcar producto como inactivo: ${updateError.message}`
        );
      }

      // Eliminar el registro de mapeo
      const { error: deleteMapError } = await supabase
        .from("shopify_products")
        .delete()
        .eq("id", shopifyProduct.id);

      if (deleteMapError) {
        throw new Error(
          `Error al eliminar mapeo de producto: ${deleteMapError.message}`
        );
      }

      console.log(`Producto ${product.id} marcado como inactivo correctamente`);
    } else {
      console.log(`No se encontró el producto ${product.id} en la plataforma`);
    }

    // Actualizar contador de productos
    await updateProductCount(integration.id, supabase);
  } catch (error) {
    console.error(
      `Error procesando eliminación del producto ${product.id}:`,
      error
    );
    throw error;
  }
}

async function updateProductCount(integrationId: string, supabase: any) {
  const { count } = await supabase
    .from("shopify_products")
    .select("id", { count: "exact" })
    .eq("integration_id", integrationId);

  await supabase
    .from("shopify_integrations")
    .update({
      product_count: count || 0,
      last_synced: new Date().toISOString(),
    })
    .eq("id", integrationId);
}
