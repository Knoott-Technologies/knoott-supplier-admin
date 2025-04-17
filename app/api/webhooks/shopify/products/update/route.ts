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

    console.log("Webhook recibido (products/update):", {
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
      const hmac = btoa(
        Array.from(new Uint8Array(signature))
          .map((byte) => String.fromCharCode(byte))
          .join("")
      );

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
        title: data.title,
        status: data.status,
        hasVariants: data.variants?.length > 0,
        variantCount: data.variants?.length,
        hasImages: data.images?.length > 0,
        imageCount: data.images?.length,
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

    console.log(
      `Integración encontrada: ${integration.id} para el negocio ${integration.business_id}`
    );

    // IMPORTANTE: En lugar de procesar en segundo plano, procesamos directamente
    // ya que estamos en Edge Runtime con un tiempo de ejecución más largo
    console.log(`Iniciando procesamiento para el producto ${data.id}`);

    try {
      await handleProductUpdate(data, integration, supabase);
      console.log(
        `Procesamiento completado exitosamente para el producto ${data.id}`
      );
      return NextResponse.json({
        success: true,
        message: "Producto procesado correctamente",
      });
    } catch (error: any) {
      console.error("Error procesando actualización de producto:", {
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
    console.error("Error general en webhook products/update:", {
      message: error.message,
      stack: error.stack,
    });
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
      `[INICIO] Procesando actualización del producto ${product.id} para la integración ${integration.id}`
    );

    // Verificar si el producto ya existe en la plataforma por shopify_product_id
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
      // El producto existe, actualizarlo
      console.log(
        `Actualizando producto existente con ID: ${existingProduct.id}`
      );

      // Obtener imágenes
      const imageUrl =
        product.images && product.images.length > 0
          ? product.images.map((img: any) => img.src)
          : [""];
      console.log(`Imágenes del producto: ${imageUrl.length} encontradas`);

      // Extraer descripción corta (primeros 150 caracteres sin HTML)
      let shortDescription = "";
      if (product.body_html) {
        shortDescription = product.body_html
          .replace(/<[^>]*>/g, "") // Eliminar etiquetas HTML
          .substring(0, 150)
          .trim();
        console.log(
          `Descripción corta generada: "${shortDescription.substring(
            0,
            30
          )}..."`
        );
      }

      // Actualizar el producto en la tabla products
      console.log(
        `Actualizando datos del producto ${existingProduct.id} en la base de datos`
      );
      const { error: updateError } = await supabase
        .from("products")
        .update({
          name: product.title,
          updated_at: product.updated_at,
          short_name: product.title.substring(0, 50),
          description: product.body_html || "",
          short_description: shortDescription,
          images_url: imageUrl,
          keywords: product.tags ? product.tags.split(", ") : [],
          status:
            product.status === "active"
              ? "active"
              : product.status === "draft"
              ? "draft"
              : "requires_verification",
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
        console.error(`Error al actualizar producto ${existingProduct.id}:`, {
          error: updateError.message,
          code: updateError.code,
          details: updateError.details,
        });
        throw new Error(`Error al actualizar producto: ${updateError.message}`);
      }
      console.log(
        `Producto ${existingProduct.id} actualizado correctamente en la tabla products`
      );

      // Actualizar variantes y opciones
      console.log(
        `Sincronizando variantes para el producto ${existingProduct.id}`
      );
      await syncProductVariants(product, existingProduct.id, supabase);

      console.log(
        `[FIN] Producto ${product.id} actualizado correctamente (ID: ${existingProduct.id})`
      );
    } else {
      // El producto no existe, crearlo
      console.log(`Creando nuevo producto desde Shopify ID: ${product.id}`);

      // Obtener imágenes
      const imageUrl =
        product.images && product.images.length > 0
          ? product.images.map((img: any) => img.src)
          : [""];
      console.log(`Imágenes del producto: ${imageUrl.length} encontradas`);

      // Extraer descripción corta (primeros 150 caracteres sin HTML)
      let shortDescription = "";
      if (product.body_html) {
        shortDescription = product.body_html
          .replace(/<[^>]*>/g, "") // Eliminar etiquetas HTML
          .substring(0, 150)
          .trim();
        console.log(
          `Descripción corta generada: "${shortDescription.substring(
            0,
            30
          )}..."`
        );
      }

      // Buscar o crear la marca
      let brandId = null;
      if (product.vendor) {
        console.log(`Buscando marca existente: "${product.vendor}"`);
        const { data: existingBrand, error: brandQueryError } = await supabase
          .from("catalog_brands")
          .select("id")
          .eq("name", product.vendor)
          .single();

        if (brandQueryError && brandQueryError.code !== "PGRST116") {
          console.error(`Error al buscar marca "${product.vendor}":`, {
            error: brandQueryError.message,
            code: brandQueryError.code,
          });
        }

        if (existingBrand) {
          brandId = existingBrand.id;
          console.log(`Marca encontrada con ID: ${brandId}`);
        } else {
          console.log(`Creando nueva marca: "${product.vendor}"`);
          const { data: newBrand, error: brandInsertError } = await supabase
            .from("catalog_brands")
            .insert({ name: product.vendor, status: "active" })
            .select("id")
            .single();

          if (brandInsertError) {
            console.error(`Error al crear marca "${product.vendor}":`, {
              error: brandInsertError.message,
              code: brandInsertError.code,
            });
          }

          if (newBrand) {
            brandId = newBrand.id;
            console.log(`Nueva marca creada con ID: ${brandId}`);
          }
        }
      }

      // Buscar o asignar categoría
      let subcategoryId = 1; // Categoría por defecto
      if (product.product_type) {
        console.log(`Buscando categoría existente: "${product.product_type}"`);
        const { data: existingCategory, error: categoryQueryError } =
          await supabase
            .from("catalog_collections")
            .select("id")
            .eq("name", product.product_type)
            .single();

        if (categoryQueryError && categoryQueryError.code !== "PGRST116") {
          console.error(
            `Error al buscar categoría "${product.product_type}":`,
            {
              error: categoryQueryError.message,
              code: categoryQueryError.code,
            }
          );
        }

        if (existingCategory) {
          subcategoryId = existingCategory.id;
          console.log(`Categoría encontrada con ID: ${subcategoryId}`);
        } else {
          console.log(`Usando categoría por defecto ID: ${subcategoryId}`);
        }
      }

      // Insertar el nuevo producto
      console.log(
        `Insertando nuevo producto en la base de datos: "${product.title}"`
      );
      const { data: newProduct, error: insertError } = await supabase
        .from("products")
        .insert({
          name: product.title,
          short_name: product.title.substring(0, 50),
          updated_at: product.updated_at,
          description: product.body_html || "",
          short_description: shortDescription,
          brand_id: brandId,
          images_url: imageUrl,
          subcategory_id: subcategoryId,
          provider_business_id: integration.business_id,
          keywords: product.tags ? product.tags.split(", ") : [],
          status: "requires_verification",
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

      if (insertError) {
        console.error("Error al insertar producto:", {
          error: insertError.message,
          code: insertError.code,
          details: insertError.details,
          product: {
            title: product.title,
            shopify_id: product.id,
            business_id: integration.business_id,
          },
        });
        throw new Error(`Error al insertar producto: ${insertError.message}`);
      }

      if (!newProduct) {
        console.error("No se pudo crear el producto: no se devolvió ID");
        throw new Error("Error al crear el producto: no se devolvió ID");
      }

      console.log(`Nuevo producto creado con ID: ${newProduct.id}`);

      // Crear variantes y opciones
      console.log(
        `Sincronizando variantes para el nuevo producto ${newProduct.id}`
      );
      await syncProductVariants(product, newProduct.id, supabase);

      console.log(
        `[FIN] Nuevo producto ${product.id} creado correctamente (ID: ${newProduct.id})`
      );
    }

    // Actualizar contador de productos en la integración
    console.log(
      `Actualizando contador de productos para la integración ${integration.id}`
    );
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

async function syncProductVariants(
  shopifyProduct: any,
  productId: number,
  supabase: any
) {
  try {
    console.log(
      `[INICIO] Sincronizando variantes para el producto ${productId}`
    );

    // Primero, obtener las variantes existentes
    console.log(
      `Obteniendo variantes existentes para el producto ${productId}`
    );
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

    console.log(
      `Variantes existentes encontradas: ${existingVariants?.length || 0}`
    );

    const existingVariantMap = new Map();
    if (existingVariants) {
      existingVariants.forEach((v: any) =>
        existingVariantMap.set(v.name, v.id)
      );
      console.log(
        `Mapa de variantes existentes creado con ${existingVariantMap.size} entradas`
      );
    }

    // Si el producto tiene opciones (como talla, color, etc.)
    if (shopifyProduct.options && shopifyProduct.options.length > 0) {
      console.log(
        `El producto tiene ${shopifyProduct.options.length} tipos de opciones`
      );

      for (const option of shopifyProduct.options) {
        console.log(
          `Procesando opción: "${option.name}" con ${option.values.length} valores`
        );
        let variantId;

        // Verificar si la variante ya existe
        if (existingVariantMap.has(option.name)) {
          variantId = existingVariantMap.get(option.name);
          console.log(
            `Variante "${option.name}" ya existe con ID: ${variantId}`
          );
        } else {
          // Crear nueva variante
          console.log(`Creando nueva variante: "${option.name}"`);
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
            console.log(`Nueva variante creada con ID: ${variantId}`);
          } else {
            console.warn(`No se pudo crear la variante "${option.name}"`);
          }
        }

        if (variantId) {
          // Obtener opciones existentes para esta variante
          console.log(
            `Obteniendo opciones existentes para la variante ${variantId}`
          );
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

          console.log(
            `Opciones existentes encontradas: ${existingOptions?.length || 0}`
          );

          const existingOptionMap = new Map();
          if (existingOptions) {
            existingOptions.forEach((o: any) =>
              existingOptionMap.set(o.name, o.id)
            );
          }

          // Sincronizar opciones de variante
          for (const value of option.values) {
            if (existingOptionMap.has(value)) {
              console.log(
                `Opción "${value}" ya existe con ID: ${existingOptionMap.get(
                  value
                )}`
              );
              // La opción ya existe, podríamos actualizarla si es necesario
            } else {
              // Crear nueva opción
              console.log(
                `Creando nueva opción: "${value}" para variante ${variantId}`
              );
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
              } else {
                console.log(`Opción "${value}" creada correctamente`);
              }
            }
          }
        }
      }
    } else {
      console.log(`El producto no tiene opciones definidas`);
    }

    // Sincronizar precios y stock desde las variantes de Shopify
    if (shopifyProduct.variants && shopifyProduct.variants.length > 0) {
      console.log(
        `Sincronizando precios y stock para ${shopifyProduct.variants.length} variantes de Shopify`
      );

      for (const variant of shopifyProduct.variants) {
        console.log(
          `Procesando variante Shopify: "${variant.title}" (ID: ${variant.id})`
        );

        // Aquí necesitarías lógica para mapear las variantes de Shopify
        // a tus opciones de variante específicas
        // Este es un ejemplo simplificado
        const optionValues = variant.title.split(" / ");
        console.log(
          `Valores de opción extraídos: ${JSON.stringify(optionValues)}`
        );

        // Buscar la opción de variante correspondiente
        // Nota: Esta lógica puede necesitar ajustes según tu estructura de datos
        for (const optionValue of optionValues) {
          console.log(`Buscando opción de variante: "${optionValue}"`);
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
            console.log(
              `Opción "${optionValue}" encontrada, actualizando precio y stock`
            );
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
            } else {
              console.log(
                `Precio y stock actualizados para opción "${optionValue}"`
              );
            }
          } else {
            console.log(
              `No se encontró la opción "${optionValue}" para actualizar`
            );
          }
        }
      }
    } else {
      console.log(`El producto no tiene variantes de Shopify`);
    }

    console.log(
      `[FIN] Sincronización de variantes completada para el producto ${productId}`
    );
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
