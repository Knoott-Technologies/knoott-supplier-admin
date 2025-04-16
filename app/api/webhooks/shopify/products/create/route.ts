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

    console.log("Webhook recibido (products/create):", {
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

    // Procesar la creación del producto en segundo plano
    // Respondemos inmediatamente para cumplir con el límite de tiempo de Shopify
    const responsePromise = NextResponse.json({ success: true });

    // Procesamiento asíncrono
    handleProductCreate(data, integration, supabase).catch((error) => {
      console.error("Error procesando creación de producto:", error);
    });

    return responsePromise;
  } catch (error) {
    console.error("Error en webhook products/create:", error);
    return NextResponse.json(
      { message: "Error processing webhook" },
      { status: 500 }
    );
  }
}

async function handleProductCreate(
  product: any,
  integration: { id: string; business_id: string; access_token: string },
  supabase: any
) {
  try {
    console.log(
      `Procesando creación del producto ${product.id} para la integración ${integration.id}`
    );

    // Verificar si el producto ya existe (podría haber sido creado manualmente)
    const { data: existingShopifyProduct } = await supabase
      .from("shopify_products")
      .select("id, platform_product_id")
      .eq("integration_id", integration.id)
      .eq("shopify_product_id", product.id.toString())
      .single();

    if (existingShopifyProduct?.platform_product_id) {
      // El producto ya existe, actualizarlo
      console.log(
        `Producto ya existe, actualizando: ${existingShopifyProduct.platform_product_id}`
      );

      // Convertir el producto de Shopify al formato de la plataforma
      const platformProduct = await convertShopifyProductToPlatformFormat(
        product,
        integration.business_id,
        supabase
      );

      // Actualizar el producto en la tabla products
      const { error: updateError } = await supabase
        .from("products")
        .update(platformProduct)
        .eq("id", existingShopifyProduct.platform_product_id);

      if (updateError) {
        throw new Error(`Error al actualizar producto: ${updateError.message}`);
      }

      // Actualizar variantes y opciones
      await syncProductVariants(
        product,
        existingShopifyProduct.platform_product_id,
        supabase
      );

      // Actualizar registro de sincronización
      await supabase
        .from("shopify_products")
        .update({
          title: product.title,
          synced_at: new Date().toISOString(),
          shopify_updated_at: product.updated_at,
        })
        .eq("id", existingShopifyProduct.id);

      console.log(`Producto ${product.id} actualizado correctamente`);
    } else {
      // Crear nuevo producto
      console.log(`Creando nuevo producto desde Shopify ID: ${product.id}`);

      // Convertir el producto de Shopify al formato de la plataforma
      const platformProduct = await convertShopifyProductToPlatformFormat(
        product,
        integration.business_id,
        supabase
      );

      // Insertar el nuevo producto
      const { data: newProduct, error: insertError } = await supabase
        .from("products")
        .insert(platformProduct)
        .select("id")
        .single();

      if (insertError || !newProduct) {
        throw new Error(`Error al insertar producto: ${insertError?.message}`);
      }

      // Crear variantes y opciones
      await syncProductVariants(product, newProduct.id, supabase);

      // Registrar producto de Shopify
      await supabase.from("shopify_products").insert({
        integration_id: integration.id,
        business_id: integration.business_id,
        shopify_id: product.id.toString(),
        shopify_product_id: product.id.toString(),
        title: product.title,
        platform_product_id: newProduct.id,
        shopify_created_at: product.created_at,
        shopify_updated_at: product.updated_at,
        synced_at: new Date().toISOString(),
      });

      console.log(`Nuevo producto creado con ID: ${newProduct.id}`);
    }

    // Actualizar contador de productos en la integración
    await updateProductCount(integration.id, supabase);
  } catch (error) {
    console.error(`Error procesando producto ${product.id}:`, error);
    throw error;
  }
}

// Reutilizar las mismas funciones auxiliares del archivo update
async function convertShopifyProductToPlatformFormat(
  shopifyProduct: any,
  businessId: string,
  supabase: any
) {
  // Obtener imágenes
  const images = shopifyProduct.images || [];
  const imagesUrl = images.map((img: any) => img.src);

  // Buscar o crear la marca
  let brandId = null;
  if (shopifyProduct.vendor) {
    const { data: existingBrand } = await supabase
      .from("catalog_brands")
      .select("id")
      .eq("name", shopifyProduct.vendor)
      .single();

    if (existingBrand) {
      brandId = existingBrand.id;
    } else {
      const { data: newBrand } = await supabase
        .from("catalog_brands")
        .insert({ name: shopifyProduct.vendor, status: "active" })
        .select("id")
        .single();

      if (newBrand) {
        brandId = newBrand.id;
      }
    }
  }

  // Buscar o asignar categoría
  let subcategoryId = 1; // Categoría por defecto
  if (shopifyProduct.product_type) {
    const { data: existingCategory } = await supabase
      .from("catalog_collections")
      .select("id")
      .eq("name", shopifyProduct.product_type)
      .single();

    if (existingCategory) {
      subcategoryId = existingCategory.id;
    }
  }

  // Extraer descripción corta (primeros 150 caracteres sin HTML)
  let shortDescription = "";
  if (shopifyProduct.body_html) {
    shortDescription = shopifyProduct.body_html
      .replace(/<[^>]*>/g, "") // Eliminar etiquetas HTML
      .substring(0, 150)
      .trim();
  }

  return {
    name: shopifyProduct.title,
    short_name: shopifyProduct.title.substring(0, 50),
    description: shopifyProduct.body_html || "",
    short_description: shortDescription,
    brand_id: brandId,
    images_url: imagesUrl.length > 0 ? imagesUrl : [""],
    subcategory_id: subcategoryId,
    provider_business_id: businessId,
    status: shopifyProduct.status === "active" ? "active" : "draft",
    specs: shopifyProduct.tags ? { tags: shopifyProduct.tags } : null,
    keywords: shopifyProduct.tags ? shopifyProduct.tags.split(", ") : null,
  };
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
