import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient(cookies());
    const { productIds, shippingCost, businessId } = await request.json();

    // Validate input
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "Se requiere un array de IDs de productos" },
        { status: 400 }
      );
    }

    if (shippingCost === undefined || shippingCost === null) {
      return NextResponse.json(
        { error: "Se requiere un costo de envío válido" },
        { status: 400 }
      );
    }

    if (!businessId) {
      return NextResponse.json(
        { error: "Se requiere un ID de negocio" },
        { status: 400 }
      );
    }

    // Validate shipping cost is a non-negative number
    if (isNaN(shippingCost) || shippingCost < 0) {
      return NextResponse.json(
        { error: "El costo de envío debe ser un número no negativo" },
        { status: 400 }
      );
    }

    // Update products shipping cost
    const { error } = await supabase
      .from("products")
      .update({
        shipping_cost: shippingCost,
        updated_at: new Date().toISOString(),
      })
      .in("id", productIds)
      .eq("provider_business_id", businessId)
      .neq("status", "requires_verification")
      .neq("status", "deleted"); // Skip products in review or deleted

    if (error) {
      console.error("Error updating products shipping cost:", error);
      return NextResponse.json(
        { error: "Error al actualizar el costo de envío de los productos" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Costo de envío actualizado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in bulk shipping cost update:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
