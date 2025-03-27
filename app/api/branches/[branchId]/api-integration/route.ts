import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { encrypt, decrypt } from "@/utils/encryption";

export async function GET(
  request: Request,
  { params }: { params: { branchId: string } }
) {
  try {
    const supabase = createClient(cookies());

    // Get the API integration configuration for this branch
    const { data, error } = await supabase
      .from("api_integrations")
      .select("*")
      .eq("provider_branch_id", params.branchId)
      .single();

    if (error && error.code !== "PGSQL_ERROR_NO_ROWS") {
      console.error("Error fetching API integration:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Desencriptar las claves API si existen
    if (data) {
      if (data.api_key) {
        data.api_key = decrypt(data.api_key);
      }
      if (data.api_secret) {
        data.api_secret = decrypt(data.api_secret);
      }
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { branchId: string } }
) {
  try {
    const supabase = createClient(cookies());
    const data = await request.json();

    // Validate the branch ID
    const { data: branch, error: branchError } = await supabase
      .from("provider_branches")
      .select("id")
      .eq("id", params.branchId)
      .single();

    if (branchError) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    // Check if an integration already exists for this branch
    const { data: existingIntegration, error: existingError } = await supabase
      .from("api_integrations")
      .select("id")
      .eq("provider_branch_id", params.branchId)
      .single();

    if (existingError && existingError.code !== "PGSQL_ERROR_NO_ROWS") {
      console.error("Error checking existing integration:", existingError);
      return NextResponse.json(
        { error: existingError.message },
        { status: 500 }
      );
    }

    let result;

    // Parse additional params if provided
    let additionalParams = null;
    if (data.additional_params) {
      try {
        additionalParams = JSON.parse(data.additional_params);
      } catch (e) {
        return NextResponse.json(
          { error: "Invalid JSON in additional parameters" },
          { status: 400 }
        );
      }
    }

    // Encriptar las claves API
    const encryptedApiKey = encrypt(data.api_key);
    const encryptedApiSecret = data.api_secret
      ? encrypt(data.api_secret)
      : null;

    // Update or insert the API integration
    if (existingIntegration) {
      const { data: updatedData, error: updateError } = await supabase
        .from("api_integrations")
        .update({
          provider: data.provider,
          api_url: data.api_url,
          api_key: encryptedApiKey,
          api_secret: encryptedApiSecret,
          additional_params: additionalParams,
          auto_sync: data.auto_sync,
          sync_frequency: data.sync_frequency,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingIntegration.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating API integration:", updateError);
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }

      result = updatedData;
    } else {
      const { data: insertedData, error: insertError } = await supabase
        .from("api_integrations")
        .insert({
          provider_branch_id: params.branchId,
          provider: data.provider,
          api_url: data.api_url,
          api_key: encryptedApiKey,
          api_secret: encryptedApiSecret,
          additional_params: additionalParams,
          auto_sync: data.auto_sync,
          sync_frequency: data.sync_frequency,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error inserting API integration:", insertError);
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }

      result = insertedData;
    }

    // Desencriptar las claves para la respuesta
    if (result) {
      if (result.api_key) {
        result.api_key = decrypt(result.api_key);
      }
      if (result.api_secret) {
        result.api_secret = decrypt(result.api_secret);
      }
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}
