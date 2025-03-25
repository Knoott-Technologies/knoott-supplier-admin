import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// Ruta para actualizar el estado de un producto
export async function PATCH(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    const { status } = await request.json();
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
        { error: "No se puede modificar un producto en revisión" },
        { status: 403 }
      );
    }

    // Validar el estado
    const validStatuses = [
      "draft",
      "active",
      "archived",
      "requires_verification",
      "deleted",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Estado no válido" }, { status: 400 });
    }

    // Actualizar el estado del producto
    const { error } = await supabase
      .from("products")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", productId);

    if (error) {
      return NextResponse.json(
        { error: "Error al actualizar el estado del producto" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating product status:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
