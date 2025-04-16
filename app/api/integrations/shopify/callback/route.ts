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

  for (const webhook of webhooks) {
    try {
      const response = await fetch(
        `https://${shop}/admin/api/2023-07/webhooks.json`,
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
      } else {
        console.log(`Webhook ${webhook.topic} registrado correctamente`);
      }
    } catch (error) {
      console.error(`Error al registrar webhook ${webhook.topic}:`, error);
    }
  }
}

// Función para sincronizar productos iniciales
async function syncInitialProducts(
  shop: string,
  accessToken: string,
  integrationId: string,
  businessId: string,
  supabase: any
) {
  try {
    console.log(`Iniciando sincronización inicial de productos para ${shop}`);

    // Obtener productos de Shopify
    const products = await fetchShopifyProducts(shop, accessToken);

    // Procesar y guardar productos en la base de datos
    const syncResults = await syncProductsToDatabase(
      products,
      {
        id: integrationId,
        business_id: businessId,
        shop_domain: shop,
        access_token: accessToken,
      },
      supabase
    );

    // Actualizar la información de la última sincronización
    await supabase
      .from("shopify_integrations")
      .update({
        last_synced: new Date().toISOString(),
        product_count: syncResults.totalProducts,
      })
      .eq("id", integrationId);

    console.log(
      `Sincronización inicial completada: ${syncResults.created} productos creados, ${syncResults.updated} actualizados`
    );
    return syncResults;
  } catch (error) {
    console.error("Error en la sincronización inicial:", error);
    throw error;
  }
}

async function fetchShopifyProducts(shop: string, accessToken: string) {
  const response = await fetch(
    `https://${shop}/admin/api/2023-07/products.json?limit=250`,
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
  return data.products;
}

async function syncProductsToDatabase(
  products: any[],
  integration: any,
  supabase: any
) {
  let created = 0;
  let updated = 0;
  const skipped = 0;
  let errors = 0;

  for (const shopifyProduct of products) {
    try {
      // Verificar si el producto ya existe
      const { data: existingProduct } = await supabase
        .from("shopify_products")
        .select("id, platform_product_id")
        .eq("integration_id", integration.id)
        .eq("shopify_id", shopifyProduct.id.toString())
        .single();

      if (existingProduct && existingProduct.platform_product_id) {
        // Actualizar producto existente en la plataforma
        await updateExistingProduct(
          existingProduct.platform_product_id,
          shopifyProduct,
          integration,
          supabase
        );
        updated++;
      } else {
        // Crear nuevo producto en la plataforma
        const productId = await createNewProduct(
          shopifyProduct,
          integration,
          supabase
        );

        // Guardar o actualizar en la tabla de mapeo
        if (existingProduct) {
          await supabase
            .from("shopify_products")
            .update({
              platform_product_id: productId,
              shopify_updated_at: shopifyProduct.updated_at,
              synced_at: new Date().toISOString(),
            })
            .eq("id", existingProduct.id);
        } else {
          await supabase.from("shopify_products").insert({
            integration_id: integration.id,
            business_id: integration.business_id,
            shopify_id: shopifyProduct.id.toString(),
            shopify_product_id: shopifyProduct.id.toString(),
            title: shopifyProduct.title,
            platform_product_id: productId,
            shopify_created_at: shopifyProduct.created_at,
            shopify_updated_at: shopifyProduct.updated_at,
            synced_at: new Date().toISOString(),
          });
        }

        created++;
      }
    } catch (error) {
      console.error(
        `Error al sincronizar producto ${shopifyProduct.id}:`,
        error
      );
      errors++;
    }
  }

  return {
    totalProducts: products.length,
    created,
    updated,
    skipped,
    errors,
  };
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

  // Buscar o crear marca
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
      short_description: shopifyProduct.body_html
        ? shopifyProduct.body_html.substring(0, 150)
        : "",
      brand_id: brandId,
      images_url: imageUrl,
      subcategory_id: subcategoryId,
      provider_business_id: integration.business_id,
      status: shopifyProduct.published_at ? "active" : "draft",
      keywords: shopifyProduct.tags ? shopifyProduct.tags.split(", ") : [],
      specs: {
        shopify_id: shopifyProduct.id.toString(),
        shopify_handle: shopifyProduct.handle,
      },
    })
    .select("id")
    .single();

  if (!newProduct) {
    throw new Error("Error al crear el producto");
  }

  // Crear variantes
  if (shopifyProduct.variants && shopifyProduct.variants.length > 0) {
    // Agrupar variantes por opciones
    const optionTypes = shopifyProduct.options || [];

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

      // Crear opciones de variante
      for (let j = 0; j < option.values.length; j++) {
        const optionValue = option.values[j];

        // Encontrar variantes de Shopify que coincidan con esta opción
        const matchingVariants = shopifyProduct.variants.filter((v: any) => {
          return v[`option${i + 1}`] === optionValue;
        });

        // Usar el precio y stock de la primera variante que coincida
        const firstMatch = matchingVariants[0];

        await supabase.from("products_variant_options").insert({
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
  // Obtener imágenes
  const imageUrl =
    shopifyProduct.images && shopifyProduct.images.length > 0
      ? shopifyProduct.images.map((img: any) => img.src)
      : [""];

  // Actualizar el producto principal
  await supabase
    .from("products")
    .update({
      name: shopifyProduct.title,
      short_name: shopifyProduct.title.substring(0, 50),
      description: shopifyProduct.body_html || "",
      short_description: shopifyProduct.body_html
        ? shopifyProduct.body_html.substring(0, 150)
        : "",
      images_url: imageUrl,
      status: shopifyProduct.published_at ? "active" : "draft",
      keywords: shopifyProduct.tags ? shopifyProduct.tags.split(", ") : [],
      specs: {
        ...shopifyProduct.specs,
        shopify_id: shopifyProduct.id.toString(),
        shopify_handle: shopifyProduct.handle,
      },
    })
    .eq("id", productId);

  // Obtener variantes existentes
  const { data: existingVariants } = await supabase
    .from("products_variants")
    .select("id, name")
    .eq("product_id", productId);

  // Actualizar variantes y opciones
  if (shopifyProduct.variants && shopifyProduct.variants.length > 0) {
    const optionTypes = shopifyProduct.options || [];

    for (let i = 0; i < optionTypes.length; i++) {
      const option = optionTypes[i];

      // Buscar si ya existe esta variante
      let variantId;
      const existingVariant = existingVariants?.find(
        (v: { name: any; }) => v.name === option.name
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

        if (!newVariant) continue;
        variantId = newVariant.id;
      }

      // Obtener opciones existentes para esta variante
      const { data: existingOptions } = await supabase
        .from("products_variant_options")
        .select("id, name")
        .eq("variant_id", variantId);

      // Actualizar opciones de variante
      for (let j = 0; j < option.values.length; j++) {
        const optionValue = option.values[j];

        // Encontrar variantes de Shopify que coincidan con esta opción
        const matchingVariants = shopifyProduct.variants.filter((v: any) => {
          return v[`option${i + 1}`] === optionValue;
        });

        // Usar el precio y stock de la primera variante que coincida
        const firstMatch = matchingVariants[0];

        // Buscar si ya existe esta opción
        const existingOption = existingOptions?.find(
          (o: { name: any; }) => o.name === optionValue
        );

        if (existingOption) {
          // Actualizar opción existente
          await supabase
            .from("products_variant_options")
            .update({
              display_name: optionValue,
              price: firstMatch ? Number.parseFloat(firstMatch.price) : null,
              stock: firstMatch ? firstMatch.inventory_quantity : null,
              sku: firstMatch ? firstMatch.sku : null,
              metadata: {
                shopify_variant_id: firstMatch
                  ? firstMatch.id.toString()
                  : null,
              },
            })
            .eq("id", existingOption.id);
        } else {
          // Crear nueva opción
          await supabase.from("products_variant_options").insert({
            variant_id: variantId,
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
      }
    }
  }

  return productId;
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
    await registerShopifyWebhooks(shop, access_token);

    // Obtener información de la tienda
    const shopInfoResponse = await fetch(
      `https://${shop}/admin/api/2023-07/shop.json`,
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
      })
      .eq("id", pendingConnection.id);

    if (error) {
      console.error("Error al actualizar la conexión:", error);
      return NextResponse.redirect(
        new URL(`/error?message=Error al finalizar la conexión`, request.url)
      );
    }

    // Iniciar sincronización de productos en paralelo (sin esperar a que termine)
    syncInitialProducts(
      shop,
      access_token,
      pendingConnection.id,
      pendingConnection.business_id,
      supabase
    ).catch((syncError) => {
      console.error(
        "Error en la sincronización inicial de productos:",
        syncError
      );
    });

    // Redirigir al usuario a la página de integración con un mensaje de éxito
    return NextResponse.redirect(
      new URL(
        `/dashboard/${pendingConnection.business_id}/products/shopify/${pendingConnection.id}?success=true`,
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
