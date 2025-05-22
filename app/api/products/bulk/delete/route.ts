import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient(cookies());
    const { productIds, businessId } = await request.json();

    // Validate input
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "Se requiere un array de IDs de productos" },
        { status: 400 }
      );
    }

    if (!businessId) {
      return NextResponse.json(
        { error: "Se requiere un ID de negocio" },
        { status: 400 }
      );
    }

    // Soft delete products (update status to "deleted")
    const { error } = await supabase
      .from("products")
      .update({
        status: "deleted",
        updated_at: new Date().toISOString(),
      })
      .in("id", productIds)
      .eq("provider_business_id", businessId)
      .neq("status", "requires_verification"); // Skip products in review

    if (error) {
      console.error("Error deleting products:", error);
      return NextResponse.json(
        { error: "Error al eliminar los productos" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Productos eliminados correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in bulk delete:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
