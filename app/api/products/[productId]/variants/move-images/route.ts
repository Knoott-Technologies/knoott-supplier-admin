import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    const { variantOptions } = await request.json();

    // Create Supabase client
    const supabase = createClient(cookies());

    // If no variant options, return success
    if (!variantOptions || variantOptions.length === 0) {
      return NextResponse.json({ success: true });
    }

    const updatedVariantOptions = [];

    // Process each variant option
    for (const option of variantOptions) {
      const optionId = option.id;
      const images = option.images_url || [];
      const updatedImageUrls = [];

      // Process each image in the variant option
      for (const imageUrl of images) {
        // Extract the filename from the URL
        const urlParts = imageUrl.split("/");
        const filename = urlParts[urlParts.length - 1];

        // Check if the image is in the temp folder
        if (imageUrl.includes("/temp/")) {
          // Copy the file from temp to the product/variant folder
          const { data, error } = await supabase.storage
            .from("product-assets")
            .copy(
              `temp/${filename}`,
              `${productId}/variants/${optionId}/${filename}`
            );

          if (error) {
            console.error("Error copying variant image file:", error);
            continue;
          }

          // Get the new public URL
          const { data: publicUrlData } = supabase.storage
            .from("product-assets")
            .getPublicUrl(`${productId}/variants/${optionId}/${filename}`);

          updatedImageUrls.push(publicUrlData.publicUrl);

          // Delete the temp file
          await supabase.storage
            .from("product-assets")
            .remove([`temp/${filename}`]);
        } else {
          // Image is already in the correct location
          updatedImageUrls.push(imageUrl);
        }
      }

      // Update the variant option with the new image URLs
      if (updatedImageUrls.length > 0) {
        const { error } = await supabase
          .from("products_variant_options")
          .update({ images_url: updatedImageUrls })
          .eq("id", optionId);

        if (error) {
          console.error("Error updating variant option images:", error);
          continue;
        }
      }

      updatedVariantOptions.push({
        id: optionId,
        images_url: updatedImageUrls,
      });
    }

    return NextResponse.json({
      success: true,
      updatedVariantOptions,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}
