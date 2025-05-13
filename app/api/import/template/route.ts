import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Create a worksheet with headers and example data
    const ws = XLSX.utils.aoa_to_sheet([
      [
        "name",
        "short_name",
        "description",
        "short_description",
        "brand_id",
        "subcategory_id",
        "price",
        "stock",
        "accorded_commision",
        "ancho",
        "altura",
        "profundidad",
        "peso",
        "specs",
        "keywords",
        "sku",
        "images_url",
      ],
      [
        "Nombre del producto",
        "Nombre corto",
        "Descripción detallada",
        "Descripción corta",
        "ID de la marca",
        "ID de la subcategoría",
        "Precio (centavos)",
        "Stock",
        "Comisión acordada",
        "Ancho (cm)",
        "Altura (cm)",
        "Profundidad (cm)",
        "Peso (kg)",
        "Especificaciones",
        "Palabras clave (separadas por comas)",
        "SKU",
        "URLs de las imágenes (separadas por comas)",
      ],
      [
        "Ejemplo Producto",
        "Ejemplo",
        "Este es un ejemplo de producto",
        "Ejemplo corto",
        "1",
        "1",
        "109900",
        "100",
        "0.05",
        "10",
        "5",
        "2",
        "0.5",
        '{"material": "algodón", "color": "rojo"}',
        "ejemplo, producto, prueba",
        "SKU-EJEMPLO",
        "url1, url2",
      ],
    ]);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Productos");

    // Generate the Excel file as a buffer
    const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // Create a response with the Excel file
    const response = new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=plantilla_productos.xlsx",
      },
    });

    return response;
  } catch (error) {
    console.error("Error generating template:", error);
    return NextResponse.json(
      { error: "Error generating template" },
      { status: 500 }
    );
  }
}
