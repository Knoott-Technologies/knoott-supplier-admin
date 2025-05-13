import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

// Define the schema for the processed product using Zod
const ProductVariantOptionSchema = z.object({
  name: z.string().describe("Option name (default to 'Default')"),
  display_name: z
    .string()
    .describe("Option display name (default to 'Default')"),
  price: z
    .number()
    .describe("Price in cents/centavos (e.g., $10.99 should be 1099)"),
  accorded_commision: z
    .number()
    .default(0.058)
    .describe("Accorded commission (default to 0.058)"),
  stock: z.number().describe("Stock quantity"),
  position: z.number().default(0).describe("Position (default to 0)"),
  is_default: z
    .boolean()
    .default(true)
    .describe("Is default option (default to true)"),
  sku: z.string().optional().describe("SKU code"),
  images_url: z.array(z.string()).nullable().describe("Array of image URLs"),
});

const ProductVariantSchema = z.object({
  name: z.string().describe("Variant name (default to 'Default')"),
  display_name: z
    .string()
    .describe("Variant display name (default to 'Default')"),
  position: z.number().default(0).describe("Position (default to 0)"),
  options: z.array(ProductVariantOptionSchema).describe("Variant options"),
});

// Dimensiones con nombres en español y todas opcionales
const DimensionsSchema = z
  .object({
    // Todas las propiedades son opcionales
    ancho: z.number().optional().describe("Ancho en cm (width)"),
    altura: z.number().optional().describe("Altura en cm (height)"),
    profundidad: z.number().optional().describe("Profundidad en cm (depth)"),
    peso: z.number().optional().describe("Peso en kg (weight)"),
    // Permitir propiedades adicionales para flexibilidad
  })
  .optional(); // Todo el objeto de dimensiones es opcional

const ProductSchema = z.object({
  name: z.string().describe("Product name"),
  short_name: z.string().describe("Short product name"),
  description: z.string().describe("Detailed product description"),
  short_description: z.string().describe("Short product description"),
  brand_id: z.null().describe("Brand ID (will be assigned by user)"),
  dimensions: DimensionsSchema.describe(
    "Product dimensions (optional, in Spanish)"
  ),
  specs: z
    .record(z.any())
    .optional()
    .describe("Product specifications (optional)"),
  keywords: z.array(z.string()).optional().describe("Keywords for search"),
  images_url: z.array(z.string()).describe("Array of image URLs"),
  subcategory_id: z
    .number()
    .describe("Subcategory ID (default to 1 if unknown)"),
  shipping_cost: z.number().default(0).describe("Shipping cost (default to 0)"),
  variants: z.array(ProductVariantSchema).describe("Product variants"),
});

// Type inference from the Zod schema
type ProcessedProduct = z.infer<typeof ProductSchema>;

// Helper function to download and upload an image to Supabase
async function processImageUrl(
  imageUrl: string,
  productId: string
): Promise<string | null> {
  if (!imageUrl || imageUrl.trim() === "") return null;

  try {
    // Check if the URL is already from our Supabase storage
    if (
      imageUrl.includes("supabase.co/storage/v1/object/public/product-assets")
    ) {
      return imageUrl;
    }

    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Failed to download image from ${imageUrl}`);
      return null;
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    // Generate a unique filename
    const fileExtension = contentType.split("/")[1] || "jpg";
    const filename = `${uuidv4()}.${fileExtension}`;

    // Determine the storage path
    const storagePath = `temp/${productId}/${filename}`;

    // Upload to Supabase Storage
    const supabase = createClient(cookies());
    const { data, error } = await supabase.storage
      .from("product-assets")
      .upload(storagePath, imageBuffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      console.error("Error uploading to Supabase:", error);
      return null;
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from("product-assets")
      .getPublicUrl(storagePath);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error processing image:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { product, businessId } = await request.json();

    if (!product) {
      return NextResponse.json(
        { error: "No product data provided" },
        { status: 400 }
      );
    }

    // Process the product with AI using the Zod schema
    const { object: processedProduct } = await generateObject({
      model: openai("gpt-4o"),
      schema: ProductSchema,
      prompt: `
        You are a product data processor. Your task is to transform the raw product data into a structured format 
        that matches our database schema. Here's the raw product data:
        
        ${JSON.stringify(product, null, 2)}
        
        Please transform this data into a well-structured product object according to the schema.

        Important guidelines:
        1. Generate descriptive and SEO-friendly product name, short_name, description, and short_description if they're missing or inadequate
        2. IMPORTANT: Dimensions and specs are OPTIONAL. Only include them if you can extract or infer them from the data
        3. If you include dimensions, use Spanish property names: "ancho" (width), "altura" (height), "profundidad" (depth), "peso" (weight)
        4. Generate relevant keywords for the product
        5. Set subcategory_id to 1 if you can't determine the category
        6. Create a default variant and option if they don't exist
        7. Make sure all required fields are filled with meaningful values
        8. IMPORTANT: For prices, store them as integers without decimal points. For example, $1345.60 should be stored as 134560, $10.99 should be 1099, etc.
        9. If price is missing, make a reasonable estimate based on the product type
        10. If stock is missing, default to 10
        11. Generate a SKU if it's missing
        
        The output should be a complete product object ready to be inserted into our database.
      `,
    });

    // Now processedProduct is properly typed as ProcessedProduct
    const typedProduct = processedProduct as ProcessedProduct;

    // Process any image URLs in the product
    const tempProductId = `temp-${Date.now()}`;

    // Process product images
    if (typedProduct.images_url && Array.isArray(typedProduct.images_url)) {
      const processedImages = [];
      for (const imageUrl of typedProduct.images_url) {
        if (imageUrl && imageUrl.trim() !== "") {
          const processedUrl = await processImageUrl(imageUrl, tempProductId);
          if (processedUrl) {
            processedImages.push(processedUrl);
          }
        }
      }
      typedProduct.images_url =
        processedImages.length > 0 ? processedImages : [""];
    }

    // Process variant option images
    if (typedProduct.variants && Array.isArray(typedProduct.variants)) {
      for (const variant of typedProduct.variants) {
        if (variant.options && Array.isArray(variant.options)) {
          for (const option of variant.options) {
            if (option.images_url && Array.isArray(option.images_url)) {
              const processedOptionImages = [];
              for (const imageUrl of option.images_url) {
                if (imageUrl && imageUrl.trim() !== "") {
                  const processedUrl = await processImageUrl(
                    imageUrl,
                    tempProductId
                  );
                  if (processedUrl) {
                    processedOptionImages.push(processedUrl);
                  }
                }
              }
              option.images_url =
                processedOptionImages.length > 0 ? processedOptionImages : null;
            }
          }
        }
      }
    }

    return NextResponse.json({ processedProduct: typedProduct });
  } catch (error: any) {
    console.error("Error processing product with AI:", error);

    // Manejo mejorado de errores
    let errorMessage = "Error processing product with AI";
    let errorDetails = null;

    // Si es un error de validación de Zod, proporcionar detalles
    if (
      error.name === "NoObjectGeneratedError" &&
      error.cause?.name === "ZodError"
    ) {
      errorMessage = "Validation error in generated product";
      errorDetails = error.cause.errors;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        rawResponse: error.text || null,
      },
      { status: 500 }
    );
  }
}
