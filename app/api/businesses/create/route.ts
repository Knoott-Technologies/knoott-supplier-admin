import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
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

    console.log("data", data);

    // Insert the business into the database
    const { data: business, error } = await supabase
      .from("provider_business")
      .insert({
        business_name: data.business_name,
        business_logo_url: data.business_logo_url,
        main_phone_number: data.main_phone_number || null,
        main_email: data.main_email || null,
        reference: data.reference,
        is_verified: false,
        // Campos adicionales
        business_sector: data.business_sector,
        website_url: data.website_url || null,
        social_media: data.social_media || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating business:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
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
