import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const businessId = params.businessId;
    const data = await request.json();

    // Create Supabase client
    const supabase = createClient(cookies());

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "No se encontró el usuario autenticado" },
        { status: 401 }
      );
    }

    // Verify user has permission to update this business
    const { data: businessUser, error: permissionError } = await supabase
      .from("provider_business_users")
      .select("*")
      .eq("business_id", businessId)
      .eq("user_id", user.id)
      .single();

    if (permissionError || !businessUser) {
      return NextResponse.json(
        { error: "No tienes permiso para actualizar este negocio" },
        { status: 403 }
      );
    }

    // Update the business in the database with all fields from the form
    const { data: updatedBusiness, error: updateError } = await supabase
      .from("provider_business")
      .update({
        // Información general
        business_name: data.business_name,
        business_logo_url: data.business_logo_url,
        business_legal_name: data.business_legal_name,
        tax_situation_url: data.tax_situation_url || null,
        main_phone_number: data.main_phone_number || null,
        contact_phone_number: data.contact_phone_number || null,
        main_email: data.main_email || null,
        business_sector: data.business_sector,
        description: data.description || null,

        // Información bancaria
        bank_account_number: data.bank_account_number || null,
        bank_name: data.bank_name || null,

        // Dirección
        street: data.street,
        external_number: data.external_number,
        internal_number: data.internal_number || null,
        neighborhood: data.neighborhood,
        postal_code: data.postal_code,
        city: data.city,
        state: data.state,
        country: data.country || "México",

        // Zonas de entrega
        delivery_zones: data.delivery_zones || null,

        // Sitio web y redes sociales
        website_url: data.website_url || null,
        social_media: data.social_media || null,

        // No actualizamos reference ni is_verified
        // No actualizamos commission_percentage a menos que sea explícitamente proporcionado
        ...(data.commission_percentage !== undefined
          ? { commission_percentage: data.commission_percentage }
          : {}),
      })
      .eq("id", businessId)

      console.log(updatedBusiness, updateError);

    if (updateError) {
      console.error("Error updating business:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Negocio actualizado correctamente",
      business: updatedBusiness,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}

// También podemos implementar un método GET para obtener la información del negocio
export async function GET(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const businessId = params.businessId;

    // Create Supabase client
    const supabase = createClient(cookies());

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "No se encontró el usuario autenticado" },
        { status: 401 }
      );
    }

    // Verify user has permission to view this business
    const { data: businessUser, error: permissionError } = await supabase
      .from("provider_business_users")
      .select("*")
      .eq("business_id", businessId)
      .eq("user_id", user.id)
      .single();

    if (permissionError || !businessUser) {
      return NextResponse.json(
        { error: "No tienes permiso para ver este negocio" },
        { status: 403 }
      );
    }

    // Get business data
    const { data: business, error: businessError } = await supabase
      .from("provider_business")
      .select("*")
      .eq("id", businessId)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { error: "No se encontró el negocio" },
        { status: 404 }
      );
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}

// Método DELETE para eliminar un negocio (opcional)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const businessId = params.businessId;

    // Create Supabase client
    const supabase = createClient(cookies());

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "No se encontró el usuario autenticado" },
        { status: 401 }
      );
    }

    // Verify user has admin permission to delete this business
    const { data: businessUser, error: permissionError } = await supabase
      .from("provider_business_users")
      .select("*")
      .eq("business_id", businessId)
      .eq("user_id", user.id)
      .eq("role", "admin") // Solo administradores pueden eliminar
      .single();

    if (permissionError || !businessUser) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar este negocio" },
        { status: 403 }
      );
    }

    // Delete business
    const { error: deleteError } = await supabase
      .from("provider_business")
      .delete()
      .eq("id", businessId);

    if (deleteError) {
      console.error("Error deleting business:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Negocio eliminado correctamente",
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
