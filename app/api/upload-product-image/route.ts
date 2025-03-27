import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const productId = formData.get("productId") as string;
    const variantOptionId = formData.get("variantOptionId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Create Supabase client
    const supabase = createClient(cookies());

    // Generate a unique filename
    const filename = `${uuidv4()}-${file.name.replace(/\s+/g, "-")}`;

    // Determine the storage path based on whether it's a product image or variant option image
    let storagePath;
    if (variantOptionId && productId) {
      storagePath = `${productId}/images/${variantOptionId}/${filename}`;
    } else if (productId) {
      storagePath = `${productId}/${filename}`;
    } else {
      storagePath = `temp/${filename}`;
    }

    // Convert the file to an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("product-assets")
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Error uploading to Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from("product-assets")
      .getPublicUrl(storagePath);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Error uploading image" },
      { status: 500 }
    );
  }
}
