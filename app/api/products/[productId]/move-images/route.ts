import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    const { images } = await request.json();

    // Create Supabase client
    const supabase = createClient(cookies());

    // If no images, return success
    if (!images || images.length === 0) {
      return NextResponse.json({ success: true });
    }

    const updatedImageUrls = [];

    // Process each image
    for (const imageUrl of images) {
      // Extract the filename from the URL
      // This assumes the URL format from Supabase storage
      const urlParts = imageUrl.split("/");
      const filename = urlParts[urlParts.length - 1];

      // Check if the image is in the temp folder
      if (imageUrl.includes("/temp/")) {
        // Copy the file from temp to the product folder
        const { data, error } = await supabase.storage
          .from("product-assets")
          .copy(`temp/${filename}`, `${productId}/${filename}`);

        if (error) {
          console.error("Error copying file:", error);
          continue;
        }

        // Get the new public URL
        const { data: publicUrlData } = supabase.storage
          .from("product-assets")
          .getPublicUrl(`${productId}/${filename}`);

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

    // Update the product with the new image URLs
    if (updatedImageUrls.length > 0) {
      const { error } = await supabase
        .from("products")
        .update({ images_url: updatedImageUrls })
        .eq("id", productId);

      if (error) {
        console.error("Error updating product images:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      updatedImages: updatedImageUrls,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}
