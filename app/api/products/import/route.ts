import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const business_id = formData.get("business_id") as string;

    if (!file || !business_id) {
      return NextResponse.json(
        { error: "Missing file or business_id" },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(cookies());

    // Read the Excel file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });

    // Get the products sheet
    const productsSheet = workbook.Sheets["Productos"];
    if (!productsSheet) {
      return NextResponse.json(
        { error: "Missing 'Productos' sheet" },
        { status: 400 }
      );
    }

    // Get the variants sheet
    const variantsSheet = workbook.Sheets["Variantes"];
    if (!variantsSheet) {
      return NextResponse.json(
        { error: "Missing 'Variantes' sheet" },
        { status: 400 }
      );
    }

    // Convert sheets to JSON
    const products = XLSX.utils.sheet_to_json(productsSheet);
    const variants = XLSX.utils.sheet_to_json(variantsSheet);

    // Initialize counters
    let created = 0;
    let updated = 0;
    let errors = 0;

    // Process products
    for (const product of products) {
      try {
        const productData = product as any;

        // Parse keywords
        const keywords = productData.palabras_clave
          ? productData.palabras_clave.split(",").map((k: string) => k.trim())
          : [];

        // Parse dimensions
        const dimensions = parseDimensionsOrSpecs(productData.dimensiones);

        // Parse specifications
        const specs = parseDimensionsOrSpecs(productData.especificaciones);

        // Process and upload images
        let images: string[] = [];
        if (productData.imagenes_url) {
          const imageUrls = productData.imagenes_url
            .split(",")
            .map((img: string) => img.trim());
          images = await processAndUploadImages(
            imageUrls,
            supabase,
            productData.sku || generateSKU(productData.nombre)
          );
        }

        // Generate a product identifier for matching
        const productIdentifier = productData.sku || productData.nombre;

        // Check if product exists by name (since we don't have SKU in the products table)
        const { data: existingProduct } = await supabase
          .from("products")
          .select("id")
          .eq("name", productData.nombre)
          .eq("provider_branch_id", business_id)
          .single();

        if (existingProduct) {
          // Update existing product
          const { error } = await supabase
            .from("products")
            .update({
              name: productData.nombre,
              short_name: productData.nombre_corto,
              description: productData.descripcion,
              short_description: productData.descripcion_corta,
              brand_id: productData.marca_id || null,
              subcategory_id: productData.subcategoria_id,
              keywords,
              dimensions,
              specs,
              images_url: images,
              updated_at: new Date().toISOString(),
              status: "requires_verification"
            })
            .eq("id", existingProduct.id);

          if (error) throw error;
          updated++;

          // Process variants for this product
          await processVariants(
            variants,
            existingProduct.id,
            productIdentifier,
            supabase
          );
        } else {
          // Create new product
          const { data, error } = await supabase
            .from("products")
            .insert({
              name: productData.nombre,
              short_name: productData.nombre_corto,
              description: productData.descripcion,
              short_description: productData.descripcion_corta,
              brand_id: productData.marca_id || null,
              subcategory_id: productData.subcategoria_id,
              provider_branch_id: business_id,
              keywords,
              dimensions,
              specs,
              images_url: images,
              status: "draft",
            })
            .select()
            .single();

          if (error) throw error;
          created++;

          // Process variants for this product
          await processVariants(variants, data.id, productIdentifier, supabase);
        }
      } catch (error) {
        console.error("Error processing product:", error);
        errors++;
      }
    }

    return NextResponse.json({ success: true, created, updated, errors });
  } catch (error) {
    console.error("Error importing products:", error);
    return NextResponse.json(
      { error: "Error importing products" },
      { status: 500 }
    );
  }
}

// Helper function to parse dimensions or specifications
function parseDimensionsOrSpecs(input: string): Record<string, string> | null {
  if (!input) return null;

  const result: Record<string, string> = {};
  const pairs = input.split(",");

  for (const pair of pairs) {
    const [key, value] = pair.split(":").map((s) => s.trim());
    if (key && value) {
      result[key] = value;
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

// Helper function to generate a SKU
function generateSKU(productName: string): string {
  const prefix = productName
    .substring(0, 3)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  const randomPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}-${randomPart}`;
}

// Helper function to download and upload images to Supabase storage
async function processAndUploadImages(
  imageUrls: string[],
  supabase: any,
  productIdentifier: string
): Promise<string[]> {
  const uploadedUrls: string[] = [];

  for (const url of imageUrls) {
    try {
      // Skip empty URLs
      if (!url.trim()) continue;

      // Skip URLs that are already in our storage
      if (url.includes("product-assets")) {
        uploadedUrls.push(url);
        continue;
      }

      // Download the image
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Failed to download image from ${url}`);
        continue;
      }

      const imageBlob = await response.blob();

      // Extract filename from URL or generate one
      let filename = url.split("/").pop() || `${uuidv4()}.jpg`;

      // Ensure filename has an extension
      if (!filename.includes(".")) {
        const contentType =
          response.headers.get("content-type") || "image/jpeg";
        const ext = contentType.split("/").pop() || "jpg";
        filename = `${filename}.${ext}`;
      }

      // Create a clean filename
      filename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");

      // Path in storage
      const storagePath = `${productIdentifier}/${filename}`;

      // Convert blob to array buffer
      const arrayBuffer = await imageBlob.arrayBuffer();
      const fileBuffer = new Uint8Array(arrayBuffer);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("product-assets")
        .upload(storagePath, fileBuffer, {
          contentType: imageBlob.type,
          upsert: true,
        });

      if (error) {
        console.error("Error uploading to Supabase:", error);
        continue;
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from("product-assets")
        .getPublicUrl(storagePath);

      uploadedUrls.push(publicUrlData.publicUrl);
    } catch (error) {
      console.error(`Error processing image ${url}:`, error);
    }
  }

  return uploadedUrls;
}

// Helper function to process variants
async function processVariants(
  allVariants: any[],
  productId: number,
  productIdentifier: string,
  supabase: any
) {
  // Group variants by variant name
  const variantsByName: Record<string, any[]> = {};

  // Filter variants for this product
  const productVariants = allVariants.filter(
    (v: any) => v.producto_sku === productIdentifier
  );

  // Group by variant name
  for (const variant of productVariants) {
    const variantName = variant.variante_nombre;
    if (!variantsByName[variantName]) {
      variantsByName[variantName] = [];
    }
    variantsByName[variantName].push(variant);
  }

  // Process each variant group
  const variantNames = Object.keys(variantsByName);
  for (const variantName of variantNames) {
    const options = variantsByName[variantName];
    if (options.length === 0) continue;

    // Get display name from first option
    const displayName = options[0].variante_nombre_visualizacion || variantName;

    // Check if variant exists
    const { data: existingVariant } = await supabase
      .from("products_variants")
      .select("id")
      .eq("product_id", productId)
      .eq("name", variantName)
      .single();

    let variantId;

    if (existingVariant) {
      variantId = existingVariant.id;
    } else {
      // Create new variant
      const { data, error } = await supabase
        .from("products_variants")
        .insert({
          product_id: productId,
          name: variantName,
          display_name: displayName,
          position: 0,
        })
        .select()
        .single();

      if (error) throw error;
      variantId = data.id;
    }

    // Process options for this variant
    for (let i = 0; i < options.length; i++) {
      const option = options[i];

      // Process and upload images for this option
      let optionImages: string[] | null = null;
      if (option.imagenes_url) {
        const imageUrls = option.imagenes_url
          .split(",")
          .map((img: string) => img.trim());
        const uploadedImages = await processAndUploadImages(
          imageUrls,
          supabase,
          `${productIdentifier}/${variantId}/${option.sku || i}`
        );
        optionImages = uploadedImages.length > 0 ? uploadedImages : null;
      }

      // Check if option exists by SKU
      const { data: existingOption } = await supabase
        .from("products_variant_options")
        .select("id")
        .eq("variant_id", variantId)
        .eq("sku", option.sku)
        .single();

      if (existingOption) {
        // Update existing option
        await supabase
          .from("products_variant_options")
          .update({
            name: option.opcion_nombre,
            display_name:
              option.opcion_nombre_visualizacion || option.opcion_nombre,
            price: Number.parseFloat(option.precio) || 0,
            stock: option.stock ? Number.parseInt(option.stock) : null,
            is_default: option.es_predeterminado === "true",
            images_url: optionImages,
          })
          .eq("id", existingOption.id);
      } else {
        // Create new option
        await supabase.from("products_variant_options").insert({
          variant_id: variantId,
          name: option.opcion_nombre,
          display_name:
            option.opcion_nombre_visualizacion || option.opcion_nombre,
          price: Number.parseFloat(option.precio) || 0,
          stock: option.stock ? Number.parseInt(option.stock) : null,
          position: i,
          is_default: option.es_predeterminado === "true",
          sku: option.sku,
          images_url: optionImages,
        });
      }
    }
  }
}
