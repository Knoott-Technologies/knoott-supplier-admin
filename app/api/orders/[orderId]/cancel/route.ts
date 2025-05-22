import { createAdminClient } from "@/utils/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { userId, businessId, cancelationReason } = await req.json();

    if (!userId || !businessId || !cancelationReason) {
      return NextResponse.json(
        {
          error: "Se requiere ID de usuario, sucursal y motivo de cancelación",
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verificar que la orden existe y pertenece a la sucursal
    const { data: order, error: orderError } = await supabase
      .from("wedding_product_orders")
      .select("*")
      .eq("id", params.orderId)
      .eq("provider_business_id", businessId)
      .eq("status", "requires_confirmation")
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Orden no encontrada o no puede ser cancelada" },
        { status: 404 }
      );
    }

    // Verificar que el usuario tiene permisos en esta sucursal
    const { data: userBusiness, error: userBusinessError } = await supabase
      .from("provider_business_users")
      .select("*")
      .eq("user_id", userId)
      .eq("business_id", businessId)
      .single();

    if (userBusinessError || !userBusiness) {
      return NextResponse.json(
        { error: "No tienes permisos para cancelar esta orden" },
        { status: 403 }
      );
    }

    // Actualizar la orden
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("wedding_product_orders")
      .update({
        status: "canceled",
        canceled_at: now,
        cancelation_reason: cancelationReason,
      })
      .eq("id", params.orderId);

    if (updateError) {
      console.error("Error al actualizar la orden:", updateError);
      return NextResponse.json(
        { error: "Error al cancelar la orden" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Orden cancelada correctamente",
    });
  } catch (error) {
    console.error("Error en la API de cancelación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
