import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateBranchReference } from "@/lib/utils";

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

    // Get business reference
    const { data: business, error: businessError } = await supabase
      .from("provider_business")
      .select("reference")
      .eq("id", data.provider_business_id)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { error: "No se encontró el negocio" },
        { status: 404 }
      );
    }

    // Count existing branches for this business to generate sequential reference
    const { count, error: countError } = await supabase
      .from("provider_branches")
      .select("*", { count: "exact", head: true })
      .eq("provider_business_id", data.provider_business_id);

    if (countError) {
      console.error("Error counting branches:", countError);
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    // Generate branch reference
    const branchCount = count || 0;
    const branchReference = generateBranchReference(
      business.reference,
      branchCount
    );

    // Insert the branch into the database
    const { data: branch, error } = await supabase
      .from("provider_branches")
      .insert({
        branch_name: data.branch_name,
        provider_business_id: data.provider_business_id,
        branch_reference: branchReference,
        contact_phone_number: data.contact_phone_number,
        description: data.description || null,
        bank_account_number: data.bank_account_number
          ? parseFloat(data.bank_account_number)
          : null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating branch:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(branch);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}
