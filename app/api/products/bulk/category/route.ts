import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient(cookies());
    const { productIds, categoryId, businessId } = await request.json();

    // Validate input
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "Se requiere un array de IDs de productos" },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: "Se requiere un ID de colección" },
        { status: 400 }
      );
    }

    if (!businessId) {
      return NextResponse.json(
        { error: "Se requiere un ID de negocio" },
        { status: 400 }
      );
    }

    // Verify category exists
    const { data: categoryData, error: categoryError } = await supabase
      .from("catalog_collections")
      .select("id")
      .eq("id", categoryId)
      .single();

    if (categoryError || !categoryData) {
      return NextResponse.json(
        { error: "La colección especificada no existe" },
        { status: 400 }
      );
    }

    // Update products category
    const { error } = await supabase
      .from("products")
      .update({
        subcategory_id: categoryId,
        updated_at: new Date().toISOString(),
      })
      .in("id", productIds)
      .eq("provider_business_id", businessId)
      .neq("status", "requires_verification")
      .neq("status", "deleted"); // Skip products in review or deleted

    if (error) {
      console.error("Error updating products category:", error);
      return NextResponse.json(
        { error: "Error al actualizar la colección de los productos" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Colección de productos actualizada correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in bulk category update:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
