import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { parse } from "papaparse";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Read file content
    const fileBuffer = await file.arrayBuffer();
    const fileContent = new Uint8Array(fileBuffer);

    let data: any[] = [];

    // Process based on file type
    if (file.name.endsWith(".csv")) {
      // Parse CSV
      const text = new TextDecoder().decode(fileContent);
      const result = parse(text, {
        header: true,
        skipEmptyLines: true,
      });

      if (result.errors.length > 0) {
        return NextResponse.json(
          { error: "Error parsing CSV file" },
          { status: 400 }
        );
      }

      data = result.data as any[];
    } else {
      // Parse Excel
      const workbook = XLSX.read(fileContent, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(worksheet);
    }

    // Validate data
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "No data found in file" },
        { status: 400 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error parsing file:", error);
    return NextResponse.json(
      { error: "Error processing file" },
      { status: 500 }
    );
  }
}
