import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    const supabase = createClient(cookies());

    // Verificar si el producto está en revisión
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("status")
      .eq("id", productId)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: "Error al obtener el producto" },
        { status: 500 }
      );
    }

    if (product.status === "requires_verification") {
      return NextResponse.json(
        { error: "No se puede eliminar un producto en revisión" },
        { status: 403 }
      );
    }

    // Implementar soft-delete cambiando el status a "deleted"
    const { error } = await supabase
      .from("products")
      .update({
        status: "deleted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (error) {
      return NextResponse.json(
        { error: "Error al eliminar el producto" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const product = await request.json();
    const productId = params.productId;

    // Create Supabase client
    const supabase = createClient(cookies());

    // Transform dimensions and specs from array to object format
    const dimensionsObject =
      product.dimensions?.length > 0
        ? product.dimensions.reduce(
            (
              acc: Record<string, string>,
              curr: { label: string; value: string }
            ) => {
              acc[curr.label] = curr.value;
              return acc;
            },
            {}
          )
        : null;

    const specsObject =
      product.specs?.length > 0
        ? product.specs.reduce(
            (
              acc: Record<string, string>,
              curr: { label: string; value: string }
            ) => {
              acc[curr.label] = curr.value;
              return acc;
            },
            {}
          )
        : null;

    // Update the product in the database
    const { data, error } = await supabase
      .from("products")
      .update({
        name: product.name,
        short_name: product.short_name,
        description: product.description,
        short_description: product.short_description,
        brand_id: product.brand_id,
        subcategory_id: product.subcategory_id,
        images_url: product.images_url,
        dimensions: dimensionsObject,
        specs: specsObject,
        keywords: product.keywords || [],
        // Don't update status or provider_branch_id
      })
      .eq("id", productId)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId;

    // Create Supabase client
    const supabase = createClient(cookies());

    // Get the product from the database
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}
