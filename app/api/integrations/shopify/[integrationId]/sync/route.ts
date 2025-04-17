import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { integrationId: string } }
) {
  try {
    const supabase = createClient(cookies());
    const { businessId } = await request.json();
    const integrationId = params.integrationId;

    // Verificar que el usuario tenga acceso a este negocio
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Obtener la información de la integración
    const { data: integration } = await supabase
      .from("shopify_integrations")
      .select("*")
      .eq("id", integrationId)
      .eq("business_id", businessId)
      .eq("status", "active")
      .single();

    if (!integration) {
      return NextResponse.json(
        { message: "Integración no encontrada o inactiva" },
        { status: 404 }
      );
    }

    // Obtener productos de Shopify
    const products = await fetchShopifyProducts(
      integration.shop_domain,
      integration.access_token
    );

    // Procesar y guardar productos en la base de datos
    const syncResults = await syncProductsToDatabase(
      products,
      integration,
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

    return NextResponse.json({
      success: true,
      message: "Productos sincronizados correctamente",
      stats: syncResults,
    });
  } catch (error) {
    console.error("Error al sincronizar productos:", error);
    return NextResponse.json(
      { message: "Error al sincronizar productos", error: String(error) },
      { status: 500 }
    );
  }
}

async function fetchShopifyProducts(shop: string, accessToken: string) {
  const response = await fetch(
    `https://${shop}/admin/api/2025-04/products.json?limit=250`,
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
      // Verificar si el producto ya existe directamente en la tabla products
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
        updated++;
      } else {
        // Crear nuevo producto en la plataforma
        await createNewProduct(shopifyProduct, integration, supabase);
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

  // Actualizar el contador de productos activos
  const { count: activeCount } = await supabase
    .from("products")
    .select("id", { count: "exact" })
    .eq("shopify_integration_id", integration.id)
    .eq("status", "active");

  return {
    totalProducts: activeCount || 0,
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
  // Obtener imágenes
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

  // Extraer descripción corta (primeros 150 caracteres sin HTML)
  let shortDescription = "";
  if (shopifyProduct.body_html) {
    shortDescription = shopifyProduct.body_html
      .replace(/<[^>]*>/g, "") // Eliminar etiquetas HTML
      .substring(0, 150)
      .trim();
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
      status: "requires_verification",
      keywords: shopifyProduct.tags ? shopifyProduct.tags.split(", ") : [],
      specs: {
        shopify_handle: shopifyProduct.handle,
        shopify_tags: shopifyProduct.tags,
        shopify_vendor: shopifyProduct.vendor,
        shopify_product_type: shopifyProduct.product_type,
      },
      shopify_updated_at: shopifyProduct.updated_at,
      shopify_synced_at: new Date().toISOString(),
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
        (v: { name: any }) => v.name === option.name
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
          (o: { name: any }) => o.name === optionValue
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
