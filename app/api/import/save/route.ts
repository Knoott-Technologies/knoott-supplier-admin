import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";

export async function POST(request: NextRequest) {
  try {
    const { products, businessId } = await request.json();

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: "No products provided" },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(cookies());

    // Process and save each product
    const results = await Promise.all(
      products.map(async (product) => {
        try {
          // Generate embedding for the product
          const embeddingText = generateProductText(product);

          // Generate the embedding using the AI SDK of Vercel
          const { embedding } = await embed({
            model: openai.embedding("text-embedding-3-small", {
              dimensions: 1536,
            }),
            value: embeddingText,
          });

          // 1. Insert the product with embedding
          const { data: productData, error: productError } = await supabase
            .from("products")
            .insert({
              name: product.name,
              short_name: product.short_name,
              description: product.description,
              short_description: product.short_description,
              brand_id: product.brand_id,
              dimensions: product.dimensions,
              specs: product.specs,
              keywords: product.keywords,
              images_url: product.images_url,
              subcategory_id: product.subcategory_id || 1,
              presence_in_gifts: product.presence_in_gifts || 0,
              status: "requires_verification",
              provider_business_id: businessId,
              shipping_cost: product.shipping_cost,
              embedding: embedding, // Add the embedding here
            })
            .select("id")
            .single();

          if (productError) {
            throw new Error(`Error inserting product: ${productError.message}`);
          }

          const productId = productData.id;

          // 2. Process variants and options
          if (product.variants && product.variants.length > 0) {
            for (const variant of product.variants) {
              // Insert variant
              const { data: variantData, error: variantError } = await supabase
                .from("products_variants")
                .insert({
                  product_id: productId,
                  name: variant.name,
                  display_name: variant.display_name,
                  position: variant.position,
                })
                .select("id")
                .single();

              if (variantError) {
                throw new Error(
                  `Error inserting variant: ${variantError.message}`
                );
              }

              const variantId = variantData.id;

              // Insert options if they exist
              if (variant.options && variant.options.length > 0) {
                for (const option of variant.options) {
                  // Process option images if they exist
                  let processedOptionImages = option.images_url;
                  if (option.images_url && Array.isArray(option.images_url)) {
                    processedOptionImages = await moveImagesToProductFolder(
                      option.images_url,
                      productId,
                      supabase
                    );
                  }

                  const { error: optionError } = await supabase
                    .from("products_variant_options")
                    .insert({
                      variant_id: variantId,
                      name: option.name,
                      display_name: option.display_name,
                      price: option.price,
                      accorded_commision: option.accorded_commision,
                      stock: option.stock,
                      position: option.position,
                      is_default: option.is_default,
                      metadata: option.metadata,
                      sku: option.sku,
                      images_url: processedOptionImages,
                    });

                  if (optionError) {
                    throw new Error(
                      `Error inserting option: ${optionError.message}`
                    );
                  }
                }
              }
            }
          } else {
            // Create default variant and option if none provided
            const { data: variantData, error: variantError } = await supabase
              .from("products_variants")
              .insert({
                product_id: productId,
                name: "Default",
                display_name: "Default",
                position: 0,
              })
              .select("id")
              .single();

            if (variantError) {
              throw new Error(
                `Error inserting default variant: ${variantError.message}`
              );
            }

            const variantId = variantData.id;

            // Process product images for the default option
            const processedImages = await moveImagesToProductFolder(
              product.images_url,
              productId,
              supabase
            );

            const { error: optionError } = await supabase
              .from("products_variant_options")
              .insert({
                variant_id: variantId,
                name: "Default",
                display_name: "Default",
                price: null,
                accorded_commision: 0,
                stock: null,
                position: 0,
                is_default: true,
                metadata: null,
                sku: null,
                images_url: processedImages,
              });

            if (optionError) {
              throw new Error(
                `Error inserting default option: ${optionError.message}`
              );
            }
          }

          // 3. Process product images and update the product
          const processedProductImages = await moveImagesToProductFolder(
            product.images_url,
            productId,
            supabase
          );

          // Update the product with the processed images
          const { error: updateError } = await supabase
            .from("products")
            .update({ images_url: processedProductImages })
            .eq("id", productId);

          if (updateError) {
            throw new Error(
              `Error updating product images: ${updateError.message}`
            );
          }

          return { success: true, productId, images: processedProductImages };
        } catch (error) {
          console.error("Error processing product:", error);
          return { success: false, error: error };
        }
      })
    );

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${successCount} products. Failed: ${failureCount}`,
      results,
    });
  } catch (error) {
    console.error("Error saving products:", error);
    return NextResponse.json(
      { error: "Error saving products" },
      { status: 500 }
    );
  }
}

/**
 * Genera un texto completo con todos los datos relevantes del producto
 * para crear un embedding de alta calidad
 */
function generateProductText(product: any): string {
  const parts: string[] = [];

  // Información básica del producto
  parts.push(`Nombre: ${product.name}`);
  parts.push(`Nombre corto: ${product.short_name}`);
  parts.push(`Descripción: ${product.description}`);
  parts.push(`Descripción corta: ${product.short_description}`);

  // Palabras clave
  if (product.keywords && product.keywords.length > 0) {
    parts.push(`Palabras clave: ${product.keywords.join(", ")}`);
  }

  // Dimensiones
  if (product.dimensions && typeof product.dimensions === "object") {
    const dimensionsText = Object.entries(product.dimensions)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    parts.push(`Dimensiones: ${dimensionsText}`);
  }

  // Especificaciones
  if (product.specs && typeof product.specs === "object") {
    const specsText = Object.entries(product.specs)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    parts.push(`Especificaciones: ${specsText}`);
  }

  // Información de envío
  if (product.shipping_cost !== undefined) {
    parts.push(`Costo de envío: ${product.shipping_cost}`);
  }

  // Variantes
  if (product.variants && product.variants.length > 0) {
    const variantsText = product.variants
      .map((variant: any) => {
        if (!variant.options || !Array.isArray(variant.options)) {
          return `${variant.name}: sin opciones`;
        }

        const optionsText = variant.options
          .map(
            (option: any) =>
              `${option.name} (${option.price !== null ? option.price : "Sin precio"} ${option.stock !== null ? `- Stock: ${option.stock}` : ""})`
          )
          .join(", ");
        return `${variant.name}: ${optionsText}`;
      })
      .join("; ");
    parts.push(`Variantes: ${variantsText}`);
  }

  // Unir todas las partes con saltos de línea
  return parts.join("\n");
}

// Helper function to move images from temp folder to product folder
async function moveImagesToProductFolder(
  imageUrls: string[],
  productId: string,
  supabase: any
): Promise<string[]> {
  if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    return [];
  }

  const processedUrls = [];

  for (const imageUrl of imageUrls) {
    if (!imageUrl || typeof imageUrl !== "string") continue;

    // Check if the image is in the temp folder
    if (imageUrl.includes("/temp/")) {
      try {
        // Extract the path parts
        const urlParts = imageUrl.split("/");
        const filename = urlParts[urlParts.length - 1];

        // Extract the temp folder path from the URL
        // This handles nested temp folders like temp/123456/image.jpg
        const tempPathRegex = /\/temp\/.*?\//;
        const match = imageUrl.match(tempPathRegex);

        if (!match) continue;

        const tempPath = match[0].substring(1); // Remove leading slash
        const sourcePath = `${tempPath}${filename}`;
        const destinationPath = `${productId}/${filename}`;

        // Copy the file from temp to product folder
        const { data, error } = await supabase.storage
          .from("product-assets")
          .copy(sourcePath, destinationPath);

        if (error) {
          console.error(`Error copying file ${sourcePath}:`, error);
          processedUrls.push(imageUrl); // Keep original URL if copy fails
          continue;
        }

        // Get the new public URL
        const { data: publicUrlData } = supabase.storage
          .from("product-assets")
          .getPublicUrl(destinationPath);

        processedUrls.push(publicUrlData.publicUrl);

        // Delete the temp file (don't wait for this to complete)
        supabase.storage.from("product-assets").remove([sourcePath]);
      } catch (error) {
        console.error(`Error processing image ${imageUrl}:`, error);
        processedUrls.push(imageUrl); // Keep original URL if processing fails
      }
    } else {
      // Image is not in temp folder, keep as is
      processedUrls.push(imageUrl);
    }
  }

  return processedUrls.length > 0 ? processedUrls : [""];
}
