import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { sendBusinessInvitationEmail } from "@/lib/emails/business-invite";

export async function POST(request: NextRequest) {
  try {
    // Get data from request body
    const { businessId, userName, userEmail, role } = await request.json();

    // Validate required data
    if (!businessId || !userName || !userEmail || !role) {
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

    // Verify the authenticated user has permission to invite to this business
    const { data: userBusiness, error: userBusinessError } = await admin
      .from("provider_business_users")
      .select("role")
      .eq("business_id", businessId)
      .eq("user_id", authUser.user.id)
      .single();

    if (userBusinessError || !userBusiness) {
      return NextResponse.json(
        { error: "No tienes permisos para este negocio" },
        { status: 403 }
      );
    }

    // Only admin and supervisor can invite users
    if (!["admin", "supervisor"].includes(userBusiness.role)) {
      return NextResponse.json(
        { error: "No tienes permisos para invitar usuarios" },
        { status: 403 }
      );
    }

    // Check if user is already a member of the business
    const { data: existingUser, error: existingUserError } = await admin
      .from("provider_business_users")
      .select("id")
      .eq("business_id", businessId)
      .eq(
        "user_id",
        (await admin.from("users").select("id").eq("email", userEmail).single())
          .data?.id
      )
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "El usuario ya es miembro de este negocio" },
        { status: 400 }
      );
    }

    // Check if there's already a pending invitation for this email
    const { data: existingInvitation, error: existingInvitationError } =
      await admin
        .from("business_invitations")
        .select("id")
        .eq("business_id", businessId)
        .eq("user_email", userEmail)
        .eq("status", "pending")
        .maybeSingle();

    if (existingInvitation) {
      return NextResponse.json(
        { error: "Ya existe una invitación pendiente para este correo" },
        { status: 400 }
      );
    }

    // Get business details
    const { data: business, error: businessError } = await admin
      .from("provider_business")
      .select("business_name")
      .eq("id", businessId)
      .single();

      console.log(business, businessError);

    if (businessError || !business) {
      return NextResponse.json(
        { error: "Negocio no encontrado" },
        { status: 404 }
      );
    }

    // Generate invitation token
    const invitationToken = nanoid(32);

    // Create invitation record
    const { data: invitation, error: invitationError } = await admin
      .from("business_invitations")
      .insert({
        business_id: businessId,
        user_email: userEmail,
        user_name: userName,
        invitation_token: invitationToken,
        role: role,
        status: "pending",
      })
      .select()
      .single();

    if (invitationError) {
      console.error("Error al crear invitación:", invitationError);
      return NextResponse.json(
        { error: `Error al crear la invitación: ${invitationError.message}` },
        { status: 500 }
      );
    }

    // Send invitation email
    const origin =
      request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "";

    const emailResult = await sendBusinessInvitationEmail({
      userName,
      userEmail,
      invitedByName:
        authUser.user.user_metadata.full_name ||
        authUser.user.email ||
        "Un administrador",
      businessName: business.business_name,
      invitationToken,
      origin,
      role,
    });

    if (!emailResult.success) {
      console.error("Error al enviar correo de invitación:", emailResult.error);
      // We don't return an error here, as the invitation was created successfully
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      message: "Invitación enviada correctamente",
      data: { id: invitation.id },
    });
  } catch (error) {
    console.error("Error en la API de invitación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
