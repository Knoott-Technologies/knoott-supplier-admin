import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Get data from request body
    const { businessId, userId, token } = await request.json();

    // Validate required data
    if (!businessId || !userId || !token) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Create Supabase clients
    const admin = createAdminClient();
    const supabase = createClient(cookies());

    // Verify user authentication
    const { data: authUser, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verify that the authenticated user matches the provided userId
    if (authUser.user.id !== userId) {
      return NextResponse.json(
        { error: "ID de usuario no coincide" },
        { status: 403 }
      );
    }

    // Verify that the invitation exists and hasn't been accepted
    const { data: invitation, error: invitationError } = await admin
      .from("business_invitations")
      .select("id, status, role, user_email")
      .eq("invitation_token", token)
      .eq("business_id", businessId)
      .single();

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: "Invitación no encontrada" },
        { status: 404 }
      );
    }

    if (invitation.status === "accepted") {
      return NextResponse.json(
        { error: "Invitación ya aceptada" },
        { status: 400 }
      );
    }

    // Verify that the authenticated user's email matches the invitation email
    if (authUser.user.email !== invitation.user_email) {
      return NextResponse.json(
        { error: "El correo electrónico no coincide con la invitación" },
        { status: 403 }
      );
    }

    // 1. Create the provider_business_users relationship with the specified role
    const { error: userBusinessError } = await admin
      .from("provider_business_users")
      .insert({
        user_id: userId,
        business_id: businessId,
        role: invitation.role,
      });

    if (userBusinessError) {
      console.error("Error al crear relación:", userBusinessError);
      return NextResponse.json(
        { error: `Error al crear la relación: ${userBusinessError.message}` },
        { status: 500 }
      );
    }

    // 2. Update the invitation status to 'accepted'
    const { error: updateError } = await admin
      .from("business_invitations")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", invitation.id);

    if (updateError) {
      console.error("Error al actualizar invitación:", updateError);
      return NextResponse.json(
        { error: `Error al actualizar la invitación: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      message: "Invitación aceptada correctamente",
    });
  } catch (error) {
    console.error("Error en la API de aceptación de invitación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
