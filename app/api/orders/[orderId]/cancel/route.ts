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
      .select("*, wedding_id, total_amount")
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

    // Obtener la referencia de la boda
    const { data: wedding, error: weddingError } = await supabase
      .from("weddings")
      .select("reference")
      .eq("id", order.wedding_id)
      .single();

    if (weddingError || !wedding) {
      return NextResponse.json(
        { error: "No se pudo obtener la información de la boda" },
        { status: 500 }
      );
    }

    // Contar las transacciones existentes para esta boda
    const { count, error: countError } = await supabase
      .from("wedding_transactions")
      .select("*", { count: "exact", head: true })
      .eq("wedding_id", order.wedding_id);

    if (countError) {
      return NextResponse.json(
        { error: "Error al contar las transacciones existentes" },
        { status: 500 }
      );
    }

    // Crear la nueva referencia en el formato {reference}-{count+1}
    const transactionCount = count || 0;
    const newReference = `${wedding.reference}-${transactionCount + 1}`;

    try {
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
        throw updateError;
      }

      // Crear una transacción de reembolso
      const { error: refundError } = await supabase
        .from("wedding_transactions")
        .insert({
          reference: newReference,
          amount: order.total_amount,
          description: `Reembolso por cancelación de orden: ${cancelationReason}`,
          status: "completed",
          type: "return",
          wedding_id: order.wedding_id,
          user_id: order.user_id,
        });

      if (refundError) {
        throw refundError;
      }

      return NextResponse.json({
        success: true,
        message: "Orden cancelada y reembolso procesado correctamente",
        transactionReference: newReference,
      });
    } catch (transactionError) {
      console.error("Error en la transacción:", transactionError);

      return NextResponse.json(
        { error: "Error al procesar la cancelación y reembolso" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error en la API de cancelación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
