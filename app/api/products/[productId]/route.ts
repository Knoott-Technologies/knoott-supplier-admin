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
