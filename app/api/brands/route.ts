import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Create Supabase client
    const supabase = createClient(cookies());

    // Get all brands
    const { data, error } = await supabase
      .from("catalog_brands")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching brands:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}
