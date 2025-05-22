import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { parse } from "papaparse";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const businessId = formData.get("businessId") as string;

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
        transformHeader: (header) => {
          // Normalize headers by trimming whitespace and handling empty headers
          return (
            header.trim() ||
            `Column_${Math.random().toString(36).substring(2, 7)}`
          );
        },
      });

      if (result.errors.length > 0) {
        console.error("CSV parsing errors:", result.errors);
        return NextResponse.json(
          { error: "Error parsing CSV file", details: result.errors },
          { status: 400 }
        );
      }

      data = result.data as any[];
    } else {
      // Parse Excel
      const workbook = XLSX.read(fileContent, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Use raw: false to get formatted values and header: true for column headers
      data = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: "", // Default value for empty cells
      });
    }

    // Validate data
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "No data found in file" },
        { status: 400 }
      );
    }

    // Normalize data to ensure all rows have the same keys
    const allKeys = new Set<string>();

    // First pass: collect all possible keys
    data.forEach((row) => {
      Object.keys(row).forEach((key) => allKeys.add(key));
    });

    // Second pass: ensure all rows have all keys
    const normalizedData = data.map((row) => {
      const normalizedRow: Record<string, any> = {};
      allKeys.forEach((key) => {
        normalizedRow[key] = row[key] !== undefined ? row[key] : "";
      });
      return normalizedRow;
    });

    // Filter out rows that are completely empty
    const filteredData = normalizedData.filter((row) => {
      return Object.values(row).some(
        (value) => value !== undefined && value !== null && value !== ""
      );
    });

    if (filteredData.length === 0) {
      return NextResponse.json(
        { error: "No valid data found in file after filtering empty rows" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data: filteredData,
      businessId,
    });
  } catch (error) {
    console.error("Error parsing file:", error);
    return NextResponse.json(
      { error: "Error processing file", details: error },
      { status: 500 }
    );
  }
}
