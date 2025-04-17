import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

// Estas variables de entorno deben estar configuradas en tu proyecto
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;

// Función para registrar webhooks después de la conexión exitosa
async function registerShopifyWebhooks(shop: string, accessToken: string) {
  const webhooks = [
    {
      topic: "products/create",
      address: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/shopify/products/create`,
    },
    {
      topic: "products/update",
      address: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/shopify/products/update`,
    },
    {
      topic: "products/delete",
      address: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/shopify/products/delete`,
    },
  ];

  const results = [];
  for (const webhook of webhooks) {
    try {
      const response = await fetch(
        `https://${shop}/admin/api/2025-04/webhooks.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessToken,
          },
          body: JSON.stringify({ webhook }),
        }
      );

      if (!response.ok) {
        console.error(
          `Error al registrar webhook ${webhook.topic}:`,
          await response.text()
        );
        results.push({ topic: webhook.topic, success: false });
      } else {
        console.log(`Webhook ${webhook.topic} registrado correctamente`);
        results.push({ topic: webhook.topic, success: true });
      }
    } catch (error) {
      console.error(`Error al registrar webhook ${webhook.topic}:`, error);
      results.push({ topic: webhook.topic, success: false });
    }
  }

  return results;
}

// Función para iniciar la sincronización de productos en segundo plano
async function startBackgroundSync(
  shop: string,
  accessToken: string,
  integrationId: string,
  businessId: string,
  supabase: any
) {
  try {
    console.log(`Iniciando sincronización en segundo plano para ${shop}`);

    // Actualizar el estado de la integración para indicar que la sincronización está en progreso
    await supabase
      .from("shopify_integrations")
      .update({
        sync_status: "in_progress",
        sync_started_at: new Date().toISOString(),
        sync_progress: 0,
        sync_error: null,
      })
      .eq("id", integrationId);

    // Iniciar el proceso de sincronización en segundo plano
    // Esto se ejecutará sin bloquear la respuesta al usuario
    syncProductsInBatches(
      shop,
      accessToken,
      integrationId,
      businessId,
      supabase
    ).catch((error) => {
      console.error("Error en la sincronización en segundo plano:", error);
      // Actualizar el estado en caso de error
      supabase
        .from("shopify_integrations")
        .update({
          sync_status: "error",
          sync_error: String(error),
          last_synced: new Date().toISOString(),
        })
        .eq("id", integrationId)
        .then(() => {
          console.log("Estado de sincronización actualizado a 'error'");
        });
    });

    return {
      success: true,
      message: "Sincronización iniciada en segundo plano",
    };
  } catch (error) {
    console.error(
      "Error al iniciar la sincronización en segundo plano:",
      error
    );
    throw error;
  }
}

// Función para sincronizar productos en lotes
async function syncProductsInBatches(
  shop: string,
  accessToken: string,
  integrationId: string,
  businessId: string,
  supabase: any
) {
  try {
    console.log(`Iniciando sincronización por lotes para ${shop}`);

    // Contador para estadísticas
    let totalProducts = 0;
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalErrors = 0;
    let currentPage = 1;
    let hasMoreProducts = true;
    const batchSize = 50; // Tamaño del lote

    // Procesar productos en lotes
    while (hasMoreProducts) {
      console.log(`Procesando lote ${currentPage} para ${shop}`);

      // Obtener un lote de productos
      const { products, hasMore } = await fetchProductsBatch(
        shop,
        accessToken,
        currentPage,
        batchSize
      );
      hasMoreProducts = hasMore;
      totalProducts += products.length;

      if (products.length === 0) {
        break;
      }

      // Procesar el lote actual
      const results = await processProductBatch(
        products,
        {
          id: integrationId,
          business_id: businessId,
          shop_domain: shop,
          access_token: accessToken,
        },
        supabase
      );

      // Actualizar estadísticas
      totalCreated += results.created;
      totalUpdated += results.updated;
      totalErrors += results.errors;

      // Actualizar el progreso en la base de datos
      await supabase
        .from("shopify_integrations")
        .update({
          sync_progress: Math.min(
            100,
            Math.round((currentPage * batchSize * 100) / (totalProducts + 1))
          ),
          product_count: totalProducts,
          last_synced: new Date().toISOString(),
        })
        .eq("id", integrationId);

      // Pasar al siguiente lote
      currentPage++;

      // Pequeña pausa para no sobrecargar la API ni la base de datos
      if (hasMoreProducts) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Actualizar el estado final
    await supabase
      .from("shopify_integrations")
      .update({
        sync_status: "completed",
        sync_completed_at: new Date().toISOString(),
        sync_progress: 100,
        product_count: totalProducts,
        last_synced: new Date().toISOString(),
        webhooks: {
          ...(await supabase
            .from("shopify_integrations")
            .select("webhooks")
            .eq("id", integrationId)
            .single()
            .then(
              (res: { data: { webhooks: any } }) => res.data?.webhooks || {}
            )),
          sync_stats: {
            total: totalProducts,
            created: totalCreated,
            updated: totalUpdated,
            errors: totalErrors,
            last_sync: new Date().toISOString(),
          },
        },
      })
      .eq("id", integrationId);

    console.log(
      `Sincronización completada para ${shop}: ${totalProducts} productos procesados (${totalCreated} creados, ${totalUpdated} actualizados, ${totalErrors} errores)`
    );

    return {
      success: true,
      totalProducts,
      created: totalCreated,
      updated: totalUpdated,
      errors: totalErrors,
    };
  } catch (error) {
    console.error(`Error en la sincronización por lotes para ${shop}:`, error);
    // Actualizar el estado en caso de error
    await supabase
      .from("shopify_integrations")
      .update({
        sync_status: "error",
        sync_error: String(error),
        last_synced: new Date().toISOString(),
      })
      .eq("id", integrationId);
    throw error;
  }
}

// Función para obtener un lote de productos
async function fetchProductsBatch(
  shop: string,
  accessToken: string,
  page: number,
  limit: number
) {
  try {
    const response = await fetch(
      `https://${shop}/admin/api/2025-04/products.json?limit=${limit}&page=${page}`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Error al obtener productos de Shopify: ${response.statusText}`
      );
    }

    const data = await response.json();
    const hasMore = data.products.length === limit; // Si recibimos el número máximo, probablemente hay más

    return { products: data.products, hasMore };
  } catch (error) {
    console.error(
      `Error al obtener lote de productos (página ${page}):`,
      error
    );
    throw error;
  }
}

// Función para procesar un lote de productos
async function processProductBatch(
  products: any[],
  integration: any,
  supabase: any
) {
  let created = 0;
  let updated = 0;
  let errors = 0;

  // Procesar productos en paralelo con un límite de concurrencia
  const concurrencyLimit = 5;
  const chunks = [];
  for (let i = 0; i < products.length; i += concurrencyLimit) {
    chunks.push(products.slice(i, i + concurrencyLimit));
  }

  for (const chunk of chunks) {
    // Procesar cada chunk en paralelo
    const results = await Promise.allSettled(
      chunk.map((product) => processProduct(product, integration, supabase))
    );

    // Contar resultados
    for (const result of results) {
      if (result.status === "fulfilled") {
        if (result.value.action === "created") created++;
        else if (result.value.action === "updated") updated++;
      } else {
        errors++;
        console.error(`Error al procesar producto:`, result.reason);
      }
    }
  }

  return { created, updated, errors };
}

// Función para procesar un producto individual
async function processProduct(
  shopifyProduct: any,
  integration: any,
  supabase: any
) {
  try {
    // Verificar si el producto ya existe en la tabla products por shopify_product_id
    const { data: existingProduct } = await supabase
      .from("products")
      .select("id")
      .eq("shopify_product_id", shopifyProduct.id.toString())
      .eq("shopify_integration_id", integration.id)
      .single();

    if (existingProduct) {
      // El producto existe, actualizarlo
      await updateExistingProduct(
        existingProduct.id,
        shopifyProduct,
        integration,
        supabase
      );
      return { action: "updated", id: existingProduct.id };
    } else {
      // El producto no existe, crearlo
      const productId = await createNewProduct(
        shopifyProduct,
        integration,
        supabase
      );
      return { action: "created", id: productId };
    }
  } catch (error) {
    console.error(`Error al procesar producto ${shopifyProduct.id}:`, error);
    throw error;
  }
}

async function createNewProduct(
  shopifyProduct: any,
  integration: any,
  supabase: any
) {
  // Obtener la primera imagen si existe
  const imageUrl =
    shopifyProduct.images && shopifyProduct.images.length > 0
      ? shopifyProduct.images.map((img: any) => img.src)
      : [""];

  // Extraer descripción corta (primeros 150 caracteres sin HTML)
  let shortDescription = "";
  if (shopifyProduct.body_html) {
    shortDescription = shopifyProduct.body_html
      .replace(/<[^>]*>/g, "") // Eliminar etiquetas HTML
      .substring(0, 150)
      .trim();
  }

  // Buscar o crear marca de manera optimizada
  let brandId = null;
  if (shopifyProduct.vendor) {
    // Primero intentar encontrar la marca
    const { data: existingBrand } = await supabase
      .from("catalog_brands")
      .select("id")
      .eq("name", shopifyProduct.vendor)
      .single();

    if (existingBrand) {
      brandId = existingBrand.id;
    } else {
      // Si no existe, crearla
      const { data: newBrand } = await supabase
        .from("catalog_brands")
        .insert({
          name: shopifyProduct.vendor,
          status: "active",
        })
        .select("id")
        .single();

      if (newBrand) {
        brandId = newBrand.id;
      }
    }
  }

  // Buscar subcategoría por defecto (usamos ID 1 como fallback)
  let subcategoryId = 1;
  if (shopifyProduct.product_type) {
    const { data: existingCategory } = await supabase
      .from("catalog_collections")
      .select("id")
      .eq("name", shopifyProduct.product_type)
      .is("parent_id", null)
      .single();

    if (existingCategory) {
      subcategoryId = existingCategory.id;
    }
  }

  // Crear el producto principal
  const { data: newProduct } = await supabase
    .from("products")
    .insert({
      name: shopifyProduct.title,
      short_name: shopifyProduct.title.substring(0, 50),
      description: shopifyProduct.body_html || "",
      short_description: shortDescription,
      brand_id: brandId,
      images_url: imageUrl,
      subcategory_id: subcategoryId,
      provider_business_id: integration.business_id,
      status: shopifyProduct.published_at ? "active" : "draft",
      keywords: shopifyProduct.tags ? shopifyProduct.tags.split(", ") : [],
      specs: {
        shopify_handle: shopifyProduct.handle,
        shopify_tags: shopifyProduct.tags,
        shopify_vendor: shopifyProduct.vendor,
        shopify_product_type: shopifyProduct.product_type,
      },
      // Campos específicos de Shopify
      shopify_product_id: shopifyProduct.id.toString(),
      shopify_integration_id: integration.id,
      shopify_created_at: shopifyProduct.created_at,
      shopify_updated_at: shopifyProduct.updated_at,
      shopify_synced_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (!newProduct) {
    throw new Error("Error al crear el producto");
  }

  // Crear variantes de manera optimizada
  if (shopifyProduct.variants && shopifyProduct.variants.length > 0) {
    // Agrupar variantes por opciones
    const optionTypes = shopifyProduct.options || [];

    // Procesar cada tipo de opción (color, talla, etc.)
    for (let i = 0; i < optionTypes.length; i++) {
      const option = optionTypes[i];

      // Crear la variante principal
      const { data: newVariant } = await supabase
        .from("products_variants")
        .insert({
          product_id: newProduct.id,
          name: option.name,
          display_name: option.name,
          position: i,
        })
        .select("id")
        .single();

      if (!newVariant) continue;

      // Preparar todas las opciones de variante para inserción en lote
      const variantOptions = [];
      for (let j = 0; j < option.values.length; j++) {
        const optionValue = option.values[j];

        // Encontrar variantes de Shopify que coincidan con esta opción
        const matchingVariants = shopifyProduct.variants.filter((v: any) => {
          return v[`option${i + 1}`] === optionValue;
        });

        // Usar el precio y stock de la primera variante que coincida
        const firstMatch = matchingVariants[0];

        variantOptions.push({
          variant_id: newVariant.id,
          name: optionValue,
          display_name: optionValue,
          price: firstMatch ? Number.parseFloat(firstMatch.price) : null,
          stock: firstMatch ? firstMatch.inventory_quantity : null,
          position: j,
          is_default: j === 0,
          sku: firstMatch ? firstMatch.sku : null,
          metadata: {
            shopify_variant_id: firstMatch ? firstMatch.id.toString() : null,
          },
        });
      }

      // Insertar todas las opciones de variante en un solo lote
      if (variantOptions.length > 0) {
        await supabase.from("products_variant_options").insert(variantOptions);
      }
    }
  } else {
    // Si no hay variantes, crear una variante por defecto
    const { data: defaultVariant } = await supabase
      .from("products_variants")
      .insert({
        product_id: newProduct.id,
        name: "Default",
        display_name: "Default",
        position: 0,
      })
      .select("id")
      .single();

    if (defaultVariant) {
      // Usar la primera variante de Shopify para el precio y stock
      const firstVariant = shopifyProduct.variants[0];

      await supabase.from("products_variant_options").insert({
        variant_id: defaultVariant.id,
        name: "Default",
        display_name: "Default",
        price: firstVariant ? Number.parseFloat(firstVariant.price) : null,
        stock: firstVariant ? firstVariant.inventory_quantity : null,
        position: 0,
        is_default: true,
        sku: firstVariant ? firstVariant.sku : null,
        metadata: {
          shopify_variant_id: firstVariant ? firstVariant.id.toString() : null,
        },
      });
    }
  }

  return newProduct.id;
}

async function updateExistingProduct(
  productId: number,
  shopifyProduct: any,
  integration: any,
  supabase: any
) {
  try {
    // Obtener imágenes
    const imageUrl =
      shopifyProduct.images && shopifyProduct.images.length > 0
        ? shopifyProduct.images.map((img: any) => img.src)
        : [""];

    // Extraer descripción corta (primeros 150 caracteres sin HTML)
    let shortDescription = "";
    if (shopifyProduct.body_html) {
      shortDescription = shopifyProduct.body_html
        .replace(/<[^>]*>/g, "") // Eliminar etiquetas HTML
        .substring(0, 150)
        .trim();
    }

    // Actualizar el producto principal
    await supabase
      .from("products")
      .update({
        name: shopifyProduct.title,
        short_name: shopifyProduct.title.substring(0, 50),
        description: shopifyProduct.body_html || "",
        short_description: shortDescription,
        images_url: imageUrl,
        status: shopifyProduct.published_at ? "active" : "draft",
        keywords: shopifyProduct.tags ? shopifyProduct.tags.split(", ") : [],
        specs: {
          shopify_handle: shopifyProduct.handle,
          shopify_tags: shopifyProduct.tags,
          shopify_vendor: shopifyProduct.vendor,
          shopify_product_type: shopifyProduct.product_type,
        },
        // Actualizar campos específicos de Shopify
        shopify_updated_at: shopifyProduct.updated_at,
        shopify_synced_at: new Date().toISOString(),
      })
      .eq("id", productId);

    // Actualizar variantes y opciones de manera optimizada
    if (shopifyProduct.variants && shopifyProduct.variants.length > 0) {
      // Obtener variantes existentes
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

      const optionTypes = shopifyProduct.options || [];

      // Procesar cada tipo de opción en paralelo
      await Promise.all(
        optionTypes.map(async (option: any, i: number) => {
          // Buscar si ya existe esta variante
          let variantId;
          const existingVariant = existingVariants?.find(
            (v: any) => v.name === option.name
          );

          if (existingVariant) {
            variantId = existingVariant.id;
          } else {
            // Crear nueva variante si no existe
            const { data: newVariant } = await supabase
              .from("products_variants")
              .insert({
                product_id: productId,
                name: option.name,
                display_name: option.name,
                position: i,
              })
              .select("id")
              .single();

            if (!newVariant) return;
            variantId = newVariant.id;
          }

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

          // Preparar actualizaciones e inserciones en lotes
          const optionsToUpdate = [];
          const optionsToInsert = [];

          for (let j = 0; j < option.values.length; j++) {
            const optionValue = option.values[j];

            // Encontrar variantes de Shopify que coincidan con esta opción
            const matchingVariants = shopifyProduct.variants.filter(
              (v: any) => {
                return v[`option${i + 1}`] === optionValue;
              }
            );

            // Usar el precio y stock de la primera variante que coincida
            const firstMatch = matchingVariants[0];

            // Buscar si ya existe esta opción
            const existingOption = existingOptions?.find(
              (o: any) => o.name === optionValue
            );

            if (existingOption) {
              // Añadir a la lista de actualizaciones
              optionsToUpdate.push({
                id: existingOption.id,
                display_name: optionValue,
                price: firstMatch ? Number.parseFloat(firstMatch.price) : null,
                stock: firstMatch ? firstMatch.inventory_quantity : null,
                sku: firstMatch ? firstMatch.sku : null,
                metadata: {
                  shopify_variant_id: firstMatch
                    ? firstMatch.id.toString()
                    : null,
                },
              });
            } else {
              // Añadir a la lista de inserciones
              optionsToInsert.push({
                variant_id: variantId,
                name: optionValue,
                display_name: optionValue,
                price: firstMatch ? Number.parseFloat(firstMatch.price) : null,
                stock: firstMatch ? firstMatch.inventory_quantity : null,
                position: j,
                is_default: j === 0,
                sku: firstMatch ? firstMatch.sku : null,
                metadata: {
                  shopify_variant_id: firstMatch
                    ? firstMatch.id.toString()
                    : null,
                },
              });
            }
          }

          // Realizar actualizaciones en lote
          if (optionsToUpdate.length > 0) {
            for (const option of optionsToUpdate) {
              const { id, ...updateData } = option;
              await supabase
                .from("products_variant_options")
                .update(updateData)
                .eq("id", id);
            }
          }

          // Realizar inserciones en lote
          if (optionsToInsert.length > 0) {
            await supabase
              .from("products_variant_options")
              .insert(optionsToInsert);
          }
        })
      );
    }

    return productId;
  } catch (error) {
    console.error(`Error al actualizar producto ${productId}:`, error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const shop = searchParams.get("shop");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!shop || !code || !state) {
    return NextResponse.redirect(
      new URL(
        `/error?message=Parámetros faltantes en la respuesta de Shopify`,
        request.url
      )
    );
  }

  try {
    const supabase = createClient(cookies());

    // Verificar el estado para prevenir ataques CSRF
    const { data: pendingConnection } = await supabase
      .from("shopify_integrations")
      .select("id, business_id, state")
      .eq("state", state)
      .eq("status", "pending")
      .single();

    if (!pendingConnection) {
      return NextResponse.redirect(
        new URL(
          `/error?message=Estado inválido o conexión no encontrada`,
          request.url
        )
      );
    }

    // Intercambiar el código de autorización por un token de acceso
    const accessTokenResponse = await fetch(
      `https://${shop}/admin/oauth/access_token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: SHOPIFY_API_KEY,
          client_secret: SHOPIFY_API_SECRET,
          code,
        }),
      }
    );

    if (!accessTokenResponse.ok) {
      throw new Error(
        `Error al obtener el token de acceso: ${accessTokenResponse.statusText}`
      );
    }

    const { access_token } = await accessTokenResponse.json();

    // Registrar webhooks
    const webhookResults = await registerShopifyWebhooks(shop, access_token);

    // Obtener información de la tienda
    const shopInfoResponse = await fetch(
      `https://${shop}/admin/api/2025-04/shop.json`,
      {
        headers: {
          "X-Shopify-Access-Token": access_token,
        },
      }
    );

    if (!shopInfoResponse.ok) {
      throw new Error(
        `Error al obtener información de la tienda: ${shopInfoResponse.statusText}`
      );
    }

    const { shop: shopInfo } = await shopInfoResponse.json();

    // Actualizar la conexión en la base de datos
    const { error } = await supabase
      .from("shopify_integrations")
      .update({
        access_token,
        shop_name: shopInfo.name,
        shop_owner: shopInfo.shop_owner,
        shop_email: shopInfo.email,
        shop_plan: shopInfo.plan_name,
        shop_currency: shopInfo.currency,
        shop_timezone: shopInfo.timezone,
        shop_locale: shopInfo.primary_locale,
        status: "active",
        connected_at: new Date().toISOString(),
        sync_status: "pending",
        webhooks: {
          registration: webhookResults,
        },
      })
      .eq("id", pendingConnection.id);

    if (error) {
      console.error("Error al actualizar la conexión:", error);
      return NextResponse.redirect(
        new URL(`/error?message=Error al finalizar la conexión`, request.url)
      );
    }

    // Iniciar sincronización de productos en segundo plano
    startBackgroundSync(
      shop,
      access_token,
      pendingConnection.id,
      pendingConnection.business_id,
      supabase
    ).catch((syncError) => {
      console.error(
        "Error al iniciar la sincronización en segundo plano:",
        syncError
      );
    });

    // Redirigir al usuario a la página de integración con un mensaje de éxito
    return NextResponse.redirect(
      new URL(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${pendingConnection.business_id}/products/shopify`,
        request.url
      )
    );
  } catch (error) {
    console.error("Error en el callback de Shopify:", error);
    return NextResponse.redirect(
      new URL(
        `/error?message=Error al procesar la respuesta de Shopify`,
        request.url
      )
    );
  }
}
