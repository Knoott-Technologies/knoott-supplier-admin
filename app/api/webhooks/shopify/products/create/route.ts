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
      const hmac = btoa(
        String.fromCharCode(...Array.from(new Uint8Array(signature)))
      );

      if (hmac !== hmacHeader) {
        console.error("Webhook inválido: firma HMAC no coincide", {
          calculatedHmac: hmac?.substring(0, 10) + "...",
          receivedHmac: hmacHeader?.substring(0, 10) + "...",
        });
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
    } else {
      console.warn(
        "SHOPIFY_API_SECRET no está configurado, omitiendo verificación HMAC"
      );
    }

    // Parsear el cuerpo JSON después de verificar HMAC
    let data;
    try {
      data = JSON.parse(body);
    } catch (parseError) {
      console.error("Error al parsear el cuerpo JSON:", parseError);
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

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

    try {
      await handleProductCreate(data, integration, supabase);
      return NextResponse.json({
        success: true,
        message: "Producto procesado correctamente",
      });
    } catch (error: any) {
      console.error("Error procesando creación de producto:", {
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
    console.error("Error general en webhook products/create:", {
      message: error.message,
      stack: error.stack,
    });
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
    const { data: existingProduct, error: queryError } = await supabase
      .from("products")
      .select("id, status")
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

    if (existingProduct) {
      // Convertir el producto de Shopify al formato de la plataforma
      const platformProduct = await convertShopifyProductToPlatformFormat(
        product,
        integration,
        supabase
      );

      // IMPORTANTE: Mantener el estado actual del producto para evitar duplicados con diferentes estados
      // Esto evita que se creen duplicados con diferentes estados
      platformProduct.status = existingProduct.status;

      // Actualizar el producto en la tabla products
      const { error: updateError } = await supabase
        .from("products")
        .update(platformProduct)
        .eq("id", existingProduct.id);

      if (updateError) {
        throw new Error(`Error al actualizar producto: ${updateError.message}`);
      }

      // Actualizar variantes y opciones
      await syncProductVariants(product, existingProduct.id, supabase);
    } else {
      // Convertir el producto de Shopify al formato de la plataforma
      const platformProduct = await convertShopifyProductToPlatformFormat(
        product,
        integration,
        supabase
      );

      // Asegurar que el estado sea "requires_verification" para nuevos productos
      platformProduct.status = "requires_verification";

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
    }

    // Actualizar contador de productos en la integración
    await updateProductCount(integration.id, supabase);
  } catch (error: any) {
    console.error(`Error procesando producto ${product.id}:`, {
      message: error.message,
      stack: error.stack,
      productId: product.id,
      integrationId: integration.id,
    });
    throw error;
  }
}

async function convertShopifyProductToPlatformFormat(
  shopifyProduct: any,
  integration: { id: string; business_id: string },
  supabase: any
) {
  // Obtener imágenes
  const images = shopifyProduct.images || [];
  const imagesUrl = images.map((img: any) => img.src);

  // Buscar o crear la marca
  let brandId = null;
  if (shopifyProduct.vendor) {
    const { data: existingBrand, error: brandQueryError } = await supabase
      .from("catalog_brands")
      .select("id")
      .eq("name", shopifyProduct.vendor)
      .single();

    if (brandQueryError && brandQueryError.code !== "PGRST116") {
      console.error(`Error al buscar marca "${shopifyProduct.vendor}":`, {
        error: brandQueryError.message,
        code: brandQueryError.code,
      });
    }

    if (existingBrand) {
      brandId = existingBrand.id;
    } else {
      const { data: newBrand, error: brandInsertError } = await supabase
        .from("catalog_brands")
        .insert({ name: shopifyProduct.vendor, status: "on_revision" }) // Siempre "on_revision" para nuevas marcas
        .select("id")
        .single();

      if (brandInsertError) {
        console.error(`Error al crear marca "${shopifyProduct.vendor}":`, {
          error: brandInsertError.message,
          code: brandInsertError.code,
        });
      }

      if (newBrand) {
        brandId = newBrand.id;
      }
    }
  }

  // Buscar o asignar categoría
  let subcategoryId = 1; // Categoría por defecto
  if (shopifyProduct.product_type) {
    const { data: existingCategory, error: categoryQueryError } = await supabase
      .from("catalog_collections")
      .select("id")
      .eq("name", shopifyProduct.product_type)
      .single();

    if (categoryQueryError && categoryQueryError.code !== "PGRST116") {
      console.error(
        `Error al buscar categoría "${shopifyProduct.product_type}":`,
        {
          error: categoryQueryError.message,
          code: categoryQueryError.code,
        }
      );
    }

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

  // Determinar el estado del producto - siempre "requires_verification" para nuevos productos
  const productStatus = "requires_verification";

  return {
    name: shopifyProduct.title,
    short_name: shopifyProduct.title.substring(0, 50),
    description: shopifyProduct.body_html || "",
    short_description: shortDescription,
    brand_id: brandId,
    images_url: imagesUrl.length > 0 ? imagesUrl : [""],
    subcategory_id: subcategoryId,
    provider_business_id: integration.business_id,
    status: productStatus, // Siempre "requires_verification" para nuevos productos
    specs: {
      shopify_handle: shopifyProduct.handle,
      shopify_tags: shopifyProduct.tags,
      shopify_vendor: shopifyProduct.vendor,
      shopify_product_type: shopifyProduct.product_type,
      shopify_status: shopifyProduct.status, // Guardar el estado original de Shopify
    },
    keywords: shopifyProduct.tags ? shopifyProduct.tags.split(", ") : null,
    // Campos específicos de Shopify
    shopify_product_id: shopifyProduct.id.toString(),
    shopify_integration_id: integration.id,
    shopify_created_at: shopifyProduct.created_at,
    shopify_updated_at: shopifyProduct.updated_at,
    shopify_synced_at: new Date().toISOString(),
  };
}

async function syncProductVariants(
  shopifyProduct: any,
  productId: number,
  supabase: any
) {
  try {
    const { data: existingVariants, error: variantsQueryError } = await supabase
      .from("products_variants")
      .select("id, name")
      .eq("product_id", productId);

    if (variantsQueryError) {
      console.error(
        `Error al obtener variantes existentes para el producto ${productId}:`,
        {
          error: variantsQueryError.message,
          code: variantsQueryError.code,
        }
      );
    }

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
          const { data: newVariant, error: variantInsertError } = await supabase
            .from("products_variants")
            .insert({
              product_id: productId,
              name: option.name,
              display_name: option.name,
              position: option.position,
            })
            .select("id")
            .single();

          if (variantInsertError) {
            console.error(`Error al crear variante "${option.name}":`, {
              error: variantInsertError.message,
              code: variantInsertError.code,
            });
          }

          if (newVariant) {
            variantId = newVariant.id;
          } else {
            console.warn(`No se pudo crear la variante "${option.name}"`);
          }
        }

        if (variantId) {
          // Obtener opciones existentes para esta variante
          const { data: existingOptions, error: optionsQueryError } =
            await supabase
              .from("products_variant_options")
              .select("id, name")
              .eq("variant_id", variantId);

          if (optionsQueryError) {
            console.error(
              `Error al obtener opciones para la variante ${variantId}:`,
              {
                error: optionsQueryError.message,
                code: optionsQueryError.code,
              }
            );
          }

          const existingOptionMap = new Map();
          if (existingOptions) {
            existingOptions.forEach((o: any) =>
              existingOptionMap.set(o.name, o.id)
            );
          }

          // Sincronizar opciones de variante
          for (const value of option.values) {
            if (existingOptionMap.has(value)) {
              const { error: optionInsertError } = await supabase
                .from("products_variant_options")
                .insert({
                  variant_id: variantId,
                  name: value,
                  display_name: value,
                  position: option.values.indexOf(value),
                  is_default: option.values.indexOf(value) === 0,
                });

              if (optionInsertError) {
                console.error(`Error al crear opción "${value}":`, {
                  error: optionInsertError.message,
                  code: optionInsertError.code,
                });
              }
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
          const { data: variantOptions, error: optionsQueryError } =
            await supabase
              .from("products_variant_options")
              .select("id")
              .eq("name", optionValue)
              .in("variant_id", Array.from(existingVariantMap.values()));

          if (optionsQueryError) {
            console.error(`Error al buscar opción "${optionValue}":`, {
              error: optionsQueryError.message,
              code: optionsQueryError.code,
            });
          }

          if (variantOptions && variantOptions.length > 0) {
            // Actualizar precio y stock
            const { error: updateError } = await supabase
              .from("products_variant_options")
              .update({
                price: Number.parseFloat(variant.price) * 100,
                stock: variant.inventory_quantity,
                sku: variant.sku,
              })
              .eq("id", variantOptions[0].id);

            if (updateError) {
              console.error(`Error al actualizar opción "${optionValue}":`, {
                error: updateError.message,
                code: updateError.code,
              });
            }
          }
        }
      }
    }
  } catch (error: any) {
    console.error(
      `Error sincronizando variantes para el producto ${productId}:`,
      {
        message: error.message,
        stack: error.stack,
      }
    );
    throw error;
  }
}

async function updateProductCount(integrationId: string, supabase: any) {
  try {
    // Contar solo productos activos y en revisión, no duplicados
    const { count, error: countError } = await supabase
      .from("products")
      .select("id", { count: "exact" })
      .eq("shopify_integration_id", integrationId)
      .in("status", ["active", "requires_verification"]); // Solo contar productos activos o en revisión

    if (countError) {
      console.error(
        `Error al contar productos para integración ${integrationId}:`,
        {
          error: countError.message,
          code: countError.code,
        }
      );
    }

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
    }
  } catch (error: any) {
    console.error(`Error al actualizar contador de productos:`, {
      message: error.message,
      stack: error.stack,
      integrationId,
    });
    throw error;
  }
}
