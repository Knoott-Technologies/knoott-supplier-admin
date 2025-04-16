import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { integrationId: string } }
) {
  try {
    const supabase = createClient(cookies());
    const { businessId } = await request.json();
    const integrationId = params.integrationId;

    // Verificar que el usuario tenga acceso a este negocio
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Obtener la información de la integración
    const { data: integration } = await supabase
      .from("shopify_integrations")
      .select("*")
      .eq("id", integrationId)
      .eq("business_id", businessId)
      .single();

    if (!integration) {
      return NextResponse.json(
        { message: "Integración no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar el estado de la integración a "disconnected"
    const { error } = await supabase
      .from("shopify_integrations")
      .update({
        status: "disconnected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", integrationId);

    if (error) {
      console.error("Error al desconectar la integración:", error);
      return NextResponse.json(
        { message: "Error al desconectar la integración" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Integración desconectada correctamente",
    });
  } catch (error) {
    console.error("Error al desconectar la integración:", error);
    return NextResponse.json(
      { message: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
