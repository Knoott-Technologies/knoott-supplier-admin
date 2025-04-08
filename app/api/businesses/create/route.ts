import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Create Supabase client
    const supabase = createClient(cookies());
    const admin = createAdminClient();

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

    // Insert the business into the database with all fields from the form
    const { data: business, error } = await supabase
      .from("provider_business")
      .insert({
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

        // Otros campos
        reference: data.reference,
        is_verified: false,
        commission_percentage: 0.085, // Valor por defecto
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating business:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Crear relación entre el usuario y el negocio
    const { error: relationError } = await supabase
      .from("provider_business_users")
      .insert({
        business_id: business.id,
        user_id: user.id,
        role: "admin", // Asignar rol de propietario
      });

    if (relationError) {
      console.error(
        "Error creating business-user relationship:",
        relationError
      );
      // No devolvemos error aquí para no afectar la experiencia del usuario
      // pero registramos el error para investigación posterior
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}
