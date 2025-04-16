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

    console.log("Webhook recibido (products/update):", {
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
      .select("id, business_id, access_token")
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

    // Procesar la actualización del producto en segundo plano
    // Respondemos inmediatamente para cumplir con el límite de tiempo de Shopify
    const responsePromise = NextResponse.json({ success: true });

    // Procesamiento asíncrono
    handleProductUpdate(data, integration, supabase).catch((error) => {
      console.error("Error procesando actualización de producto:", error);
    });

    return responsePromise;
  } catch (error) {
    console.error("Error en webhook products/update:", error);
    return NextResponse.json(
      { message: "Error processing webhook" },
      { status: 500 }
    );
  }
}

async function handleProductUpdate(
  product: any,
  integration: { id: string; business_id: string; access_token: string },
  supabase: any
) {
  try {
    console.log(
      `Procesando actualización del producto ${product.id} para la integración ${integration.id}`
    );

    // Verificar si el producto ya existe en la plataforma por shopify_product_id
    const { data: existingProduct } = await supabase
      .from("products")
      .select("id")
      .eq("shopify_product_id", product.id.toString())
      .eq("shopify_integration_id", integration.id)
      .single();

    if (existingProduct) {
      // El producto existe, actualizarlo
      console.log(`Actualizando producto existente: ${existingProduct.id}`);

      // Obtener imágenes
      const imageUrl =
        product.images && product.images.length > 0
          ? product.images.map((img: any) => img.src)
          : [""];

      // Extraer descripción corta (primeros 150 caracteres sin HTML)
      let shortDescription = "";
      if (product.body_html) {
        shortDescription = product.body_html
          .replace(/<[^>]*>/g, "") // Eliminar etiquetas HTML
          .substring(0, 150)
          .trim();
      }

      // Actualizar el producto en la tabla products
      const { error: updateError } = await supabase
        .from("products")
        .update({
          name: product.title,
          short_name: product.title.substring(0, 50),
          description: product.body_html || "",
          short_description: shortDescription,
          images_url: imageUrl,
          status: product.published_at ? "active" : "draft",
          keywords: product.tags ? product.tags.split(", ") : [],
          specs: {
            shopify_handle: product.handle,
            shopify_tags: product.tags,
            shopify_vendor: product.vendor,
            shopify_product_type: product.product_type,
          },
          shopify_updated_at: product.updated_at,
          shopify_synced_at: new Date().toISOString(),
        })
        .eq("id", existingProduct.id);

      if (updateError) {
        throw new Error(`Error al actualizar producto: ${updateError.message}`);
      }

      // Actualizar variantes y opciones
      await syncProductVariants(product, existingProduct.id, supabase);

      console.log(`Producto ${product.id} actualizado correctamente`);
    } else {
      // El producto no existe, crearlo
      console.log(`Creando nuevo producto desde Shopify ID: ${product.id}`);

      // Obtener imágenes
      const imageUrl =
        product.images && product.images.length > 0
          ? product.images.map((img: any) => img.src)
          : [""];

      // Extraer descripción corta (primeros 150 caracteres sin HTML)
      let shortDescription = "";
      if (product.body_html) {
        shortDescription = product.body_html
          .replace(/<[^>]*>/g, "") // Eliminar etiquetas HTML
          .substring(0, 150)
          .trim();
      }

      // Buscar o crear la marca
      let brandId = null;
      if (product.vendor) {
        const { data: existingBrand } = await supabase
          .from("catalog_brands")
          .select("id")
          .eq("name", product.vendor)
          .single();

        if (existingBrand) {
          brandId = existingBrand.id;
        } else {
          const { data: newBrand } = await supabase
            .from("catalog_brands")
            .insert({ name: product.vendor, status: "active" })
            .select("id")
            .single();

          if (newBrand) {
            brandId = newBrand.id;
          }
        }
      }

      // Buscar o asignar categoría
      let subcategoryId = 1; // Categoría por defecto
      if (product.product_type) {
        const { data: existingCategory } = await supabase
          .from("catalog_collections")
          .select("id")
          .eq("name", product.product_type)
          .single();

        if (existingCategory) {
          subcategoryId = existingCategory.id;
        }
      }

      // Insertar el nuevo producto
      const { data: newProduct, error: insertError } = await supabase
        .from("products")
        .insert({
          name: product.title,
          short_name: product.title.substring(0, 50),
          description: product.body_html || "",
          short_description: shortDescription,
          brand_id: brandId,
          images_url: imageUrl,
          subcategory_id: subcategoryId,
          provider_business_id: integration.business_id,
          status: product.published_at ? "active" : "draft",
          keywords: product.tags ? product.tags.split(", ") : [],
          specs: {
            shopify_handle: product.handle,
            shopify_tags: product.tags,
            shopify_vendor: product.vendor,
            shopify_product_type: product.product_type,
          },
          shopify_product_id: product.id.toString(),
          shopify_integration_id: integration.id,
          shopify_created_at: product.created_at,
          shopify_updated_at: product.updated_at,
          shopify_synced_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (insertError || !newProduct) {
        throw new Error(`Error al insertar producto: ${insertError?.message}`);
      }

      // Crear variantes y opciones
      await syncProductVariants(product, newProduct.id, supabase);

      console.log(`Nuevo producto creado con ID: ${newProduct.id}`);
    }

    // Actualizar contador de productos en la integración
    await updateProductCount(integration.id, supabase);
  } catch (error) {
    console.error(`Error procesando producto ${product.id}:`, error);
    throw error;
  }
}

async function syncProductVariants(
  shopifyProduct: any,
  productId: number,
  supabase: any
) {
  try {
    // Primero, obtener las variantes existentes
    const { data: existingVariants } = await supabase
      .from("products_variants")
      .select("id, name")
      .eq("product_id", productId);

    const existingVariantMap = new Map();
    if (existingVariants) {
      existingVariants.forEach((v: any) =>
        existingVariantMap.set(v.name, v.id)
      );
    }

    // Si el producto tiene opciones (como talla, color, etc.)
    if (shopifyProduct.options && shopifyProduct.options.length > 0) {
      for (const option of shopifyProduct.options) {
        let variantId;

        // Verificar si la variante ya existe
        if (existingVariantMap.has(option.name)) {
          variantId = existingVariantMap.get(option.name);
        } else {
          // Crear nueva variante
          const { data: newVariant } = await supabase
            .from("products_variants")
            .insert({
              product_id: productId,
              name: option.name,
              display_name: option.name,
              position: option.position,
            })
            .select("id")
            .single();

          if (newVariant) {
            variantId = newVariant.id;
          }
        }

        if (variantId) {
          // Obtener opciones existentes para esta variante
          const { data: existingOptions } = await supabase
            .from("products_variant_options")
            .select("id, name")
            .eq("variant_id", variantId);

          const existingOptionMap = new Map();
          if (existingOptions) {
            existingOptions.forEach((o: any) =>
              existingOptionMap.set(o.name, o.id)
            );
          }

          // Sincronizar opciones de variante
          for (const value of option.values) {
            if (existingOptionMap.has(value)) {
              // La opción ya existe, podríamos actualizarla si es necesario
            } else {
              // Crear nueva opción
              await supabase.from("products_variant_options").insert({
                variant_id: variantId,
                name: value,
                display_name: value,
                position: option.values.indexOf(value),
                is_default: option.values.indexOf(value) === 0,
              });
            }
          }
        }
      }
    }

    // Sincronizar precios y stock desde las variantes de Shopify
    if (shopifyProduct.variants && shopifyProduct.variants.length > 0) {
      for (const variant of shopifyProduct.variants) {
        // Aquí necesitarías lógica para mapear las variantes de Shopify
        // a tus opciones de variante específicas
        // Este es un ejemplo simplificado
        const optionValues = variant.title.split(" / ");

        // Buscar la opción de variante correspondiente
        // Nota: Esta lógica puede necesitar ajustes según tu estructura de datos
        for (const optionValue of optionValues) {
          const { data: variantOptions } = await supabase
            .from("products_variant_options")
            .select("id")
            .eq("name", optionValue)
            .in("variant_id", Array.from(existingVariantMap.values()));

          if (variantOptions && variantOptions.length > 0) {
            // Actualizar precio y stock
            await supabase
              .from("products_variant_options")
              .update({
                price: Number.parseFloat(variant.price),
                stock: variant.inventory_quantity,
                sku: variant.sku,
              })
              .eq("id", variantOptions[0].id);
          }
        }
      }
    }
  } catch (error) {
    console.error(
      `Error sincronizando variantes para el producto ${productId}:`,
      error
    );
    throw error;
  }
}

async function updateProductCount(integrationId: string, supabase: any) {
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact" })
    .eq("shopify_integration_id", integrationId);

  await supabase
    .from("shopify_integrations")
    .update({
      product_count: count || 0,
      last_synced: new Date().toISOString(),
    })
    .eq("id", integrationId);
}
