import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createClient(cookies());

  const { data, error } = await supabase
    .from("catalog_collections")
    .select("*")
    .eq("level", 2)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching catalog brands:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
