import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

// Configurar como Edge Function con un tiempo de ejecución más largo
export const runtime = "edge";
export const preferredRegion = "auto"; // Opcional: puedes especificar regiones específicas

export async function POST(request: NextRequest) {
  try {
    // Obtener el cuerpo de la solicitud como texto para verificar HMAC
    const body = await request.text();
    const hmacHeader = request.headers.get("x-shopify-hmac-sha256");
    const shopDomain = request.headers.get("x-shopify-shop-domain");

    console.log("Webhook recibido (products/delete):", {
      shop: shopDomain,
      hmac: hmacHeader?.substring(0, 10) + "...", // Truncar para seguridad
      webhookId: request.headers.get("x-shopify-webhook-id"),
      eventId: request.headers.get("x-shopify-event-id"),
      contentType: request.headers.get("content-type"),
      bodyLength: body.length,
    });

    // Verificar la autenticidad del webhook
    if (process.env.SHOPIFY_API_SECRET) {
      // Usar Web Crypto API en lugar de Node.js crypto
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(process.env.SHOPIFY_API_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(body)
      );

      // Convertir el ArrayBuffer a Base64
      const hmac = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(signature))));

      if (hmac !== hmacHeader) {
        console.error("Webhook inválido: firma HMAC no coincide", {
          calculatedHmac: hmac?.substring(0, 10) + "...",
          receivedHmac: hmacHeader?.substring(0, 10) + "...",
        });
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      console.log("Verificación HMAC exitosa");
    } else {
      console.warn(
        "SHOPIFY_API_SECRET no está configurado, omitiendo verificación HMAC"
      );
    }

    // Parsear el cuerpo JSON después de verificar HMAC
    let data;
    try {
      data = JSON.parse(body);
      console.log("Datos del producto recibidos:", {
        id: data.id,
        title: data.title || "Sin título", // Puede no tener título en eliminación
      });
    } catch (parseError) {
      console.error("Error al parsear el cuerpo JSON:", parseError);
      console.log(
        "Primeros 200 caracteres del cuerpo:",
        body.substring(0, 200)
      );
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    console.log("Cliente Supabase Admin creado");

    // Obtener la integración correspondiente a esta tienda
    console.log(`Buscando integración para la tienda ${shopDomain}`);
    const { data: integration, error: integrationError } = await supabase
      .from("shopify_integrations")
      .select("id, business_id")
      .eq("shop_domain", shopDomain)
      .eq("status", "active")
      .single();

    if (integrationError || !integration) {
      console.error(
        `No se encontró integración para la tienda ${shopDomain}:`,
        {
          error: integrationError?.message,
          code: integrationError?.code,
          details: integrationError?.details,
        }
      );
      return NextResponse.json(
        { message: "Integration not found" },
        { status: 404 }
      );
    }

    console.log(
      `Integración encontrada: ${integration.id} para el negocio ${integration.business_id}`
    );

    // IMPORTANTE: En lugar de procesar en segundo plano, procesamos directamente
    // ya que estamos en Edge Runtime con un tiempo de ejecución más largo
    console.log(`Iniciando procesamiento para el producto ${data.id}`);

    try {
      await handleProductDelete(data, integration, supabase);
      console.log(
        `Procesamiento completado exitosamente para el producto ${data.id}`
      );
      return NextResponse.json({
        success: true,
        message: "Producto procesado correctamente",
      });
    } catch (error: any) {
      console.error("Error procesando eliminación de producto:", {
        productId: data.id,
        error: error.message,
        stack: error.stack,
      });
      // Aún así devolvemos 200 para que Shopify no reintente
      return NextResponse.json({
        success: false,
        message: "Error procesando producto, pero recibido correctamente",
        error: error.message,
      });
    }
  } catch (error: any) {
    console.error("Error general en webhook products/delete:", {
      message: error.message,
      stack: error.stack,
    });
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
      `[INICIO] Procesando eliminación del producto ${product.id} para la integración ${integration.id}`
    );

    // Buscar el producto directamente en la tabla products por shopify_product_id
    console.log(
      `Buscando producto existente con shopify_product_id=${product.id}`
    );
    const { data: existingProduct, error: queryError } = await supabase
      .from("products")
      .select("id")
      .eq("shopify_product_id", product.id.toString())
      .eq("shopify_integration_id", integration.id)
      .single();

    if (queryError && queryError.code !== "PGRST116") {
      // PGRST116 es el código para "no se encontraron resultados"
      console.error("Error al buscar producto existente:", {
        error: queryError.message,
        code: queryError.code,
        details: queryError.details,
      });
    }

    console.log("Resultado de búsqueda de producto existente:", {
      encontrado: !!existingProduct,
      id: existingProduct?.id,
      error: queryError
        ? { code: queryError.code, message: queryError.message }
        : null,
    });

    if (existingProduct) {
      console.log(
        `Producto encontrado, ID en plataforma: ${existingProduct.id}`
      );

      // Marcar el producto como inactivo
      const { error: updateError } = await supabase
        .from("products")
        .update({
          status: "inactive",
          shopify_synced_at: new Date().toISOString(),
        })
        .eq("id", existingProduct.id);

      if (updateError) {
        console.error(`Error al marcar producto como inactivo:`, {
          error: updateError.message,
          code: updateError.code,
          details: updateError.details,
        });
        throw new Error(
          `Error al marcar producto como inactivo: ${updateError.message}`
        );
      }

      console.log(`Producto ${product.id} marcado como inactivo correctamente`);
    } else {
      console.log(`No se encontró el producto ${product.id} en la plataforma`);
    }

    // Actualizar contador de productos
    console.log(
      `Actualizando contador de productos para la integración ${integration.id}`
    );
    await updateProductCount(integration.id, supabase);

    console.log(
      `[FIN] Procesamiento de eliminación completado para el producto ${product.id}`
    );
  } catch (error: any) {
    console.error(`Error procesando eliminación del producto ${product.id}:`, {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

async function updateProductCount(integrationId: string, supabase: any) {
  try {
    console.log(
      `[INICIO] Actualizando contador de productos para integración ${integrationId}`
    );

    const { count, error: countError } = await supabase
      .from("products")
      .select("id", { count: "exact" })
      .eq("shopify_integration_id", integrationId)
      .eq("status", "active");

    if (countError) {
      console.error(
        `Error al contar productos para integración ${integrationId}:`,
        {
          error: countError.message,
          code: countError.code,
        }
      );
    }

    console.log(`Productos activos encontrados: ${count || 0}`);

    const { error: updateError } = await supabase
      .from("shopify_integrations")
      .update({
        product_count: count || 0,
        last_synced: new Date().toISOString(),
      })
      .eq("id", integrationId);

    if (updateError) {
      console.error(
        `Error al actualizar contador de productos para integración ${integrationId}:`,
        {
          error: updateError.message,
          code: updateError.code,
        }
      );
    } else {
      console.log(
        `Contador de productos actualizado a ${
          count || 0
        } para integración ${integrationId}`
      );
    }

    console.log(`[FIN] Actualización de contador completada`);
  } catch (error: any) {
    console.error(`Error al actualizar contador de productos:`, {
      message: error.message,
      stack: error.stack,
      integrationId,
    });
    throw error;
  }
}
