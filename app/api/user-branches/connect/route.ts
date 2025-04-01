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

    // Insert the user-branch connection into the database
    const { data: userBranch, error } = await supabase
      .from("user_provider_branches")
      .insert({
        provider_id: data.provider_id,
        user_id: user.id,
        role: data.role || "admin", // Por defecto, asignar como admin
      })
      .select()
      .single();

    if (error) {
      console.error("Error connecting user to branch:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(userBranch);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}
