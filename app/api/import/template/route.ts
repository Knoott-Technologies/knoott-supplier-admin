import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Create a worksheet with only the header row
    const ws = XLSX.utils.aoa_to_sheet([
      [
        "name",
        "short_name",
        "description",
        "short_description",
        "brand",
        "category",
        "price",
        "stock",
        "shipping_cost",
        "dimensions",
        "specs",
        "keywords",
        "sku",
        "images_url",
      ],
    ]);

    // Set column widths for better readability
    const colWidths = [
      { wch: 20 }, // name
      { wch: 15 }, // short_name
      { wch: 40 }, // description
      { wch: 30 }, // short_description
      { wch: 20 }, // brand
      { wch: 20 }, // category
      { wch: 15 }, // price
      { wch: 10 }, // stock
      { wch: 15 }, // shipping_cost
      { wch: 50 }, // dimensions
      { wch: 50 }, // specs
      { wch: 30 }, // keywords
      { wch: 15 }, // sku
      { wch: 40 }, // images_url
    ];
    ws["!cols"] = colWidths;

    // Descriptions and examples for each column
    const columnInfo = [
      { desc: "Nombre del producto", example: "Ejemplo: Camiseta de algodón" },
      { desc: "Nombre corto", example: "Ejemplo: Camiseta" },
      {
        desc: "Descripción detallada",
        example: "Ejemplo: Camiseta de algodón 100% con diseño exclusivo...",
      },
      {
        desc: "Descripción corta",
        example: "Ejemplo: Camiseta de algodón premium",
      },
      { desc: "Nombre de la marca", example: "Ejemplo: Marca Ejemplo" },
      { desc: "Nombre de la categoría", example: "Ejemplo: Ropa > Camisetas" },
      {
        desc: "Precio",
        example: "Ejemplo en entero: 1099, en decimal: 1099.50",
      },
      { desc: "Stock", example: "Ejemplo: 100" },
      {
        desc: "Costo de envío (centavos)",
        example: "Ejemplo: 5000 (equivale a $50.00)",
      },
      {
        desc: "Dimensiones",
        example: "Ejemplo: ancho: 10, altura: 5, profundidad: 2, peso: 0.5",
      },
      {
        desc: "Especificaciones",
        example:
          "Ejemplo: material: algodón, color: rojo, talla: M, estilo: casual",
      },
      {
        desc: "Palabras clave (separadas por comas)",
        example: "Ejemplo: camiseta, algodón, premium",
      },
      { desc: "SKU", example: "Ejemplo: CAM-ALG-001" },
      {
        desc: "URLs de las imágenes (separadas por comas)",
        example: "Ejemplo: url1, url2",
      },
    ];

    // Add comments to the header cells
    const comments: Record<string, { t: string; a: string }> = {};

    // Add comments to each header cell
    for (let col = 0; col < columnInfo.length; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
      const info = columnInfo[col];

      comments[cellRef] = {
        t: `${info.desc}\n\n${info.example}`,
        a: "Sistema",
      };
    }

    ws["!comments"] = comments;

    // Add some empty rows for data entry (10 rows)
    // This helps Excel recognize the data range
    for (let row = 1; row <= 10; row++) {
      for (let col = 0; col < columnInfo.length; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        ws[cellRef] = { t: "s", v: "" };
      }
    }

    // Set header row style with background color and bold font
    for (let col = 0; col < columnInfo.length; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });

      // Initialize style object if needed
      if (!ws[cellRef].s) ws[cellRef].s = {};

      // Add background color and bold font to header
      ws[cellRef].s.fill = {
        patternType: "solid",
        fgColor: { rgb: "DDEBF7" }, // Light blue background
      };
      ws[cellRef].s.font = {
        bold: true,
      };
    }

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Productos");

    // Add an instructions sheet
    const instructionsWs = XLSX.utils.aoa_to_sheet([
      ["INSTRUCCIONES PARA COMPLETAR LA PLANTILLA DE PRODUCTOS"],
      [""],
      ["1. No modifique la primera fila (encabezados)."],
      ["2. Complete todas las columnas con la información de sus productos."],
      [
        "3. Para las dimensiones, use el formato: ancho: valor, altura: valor, profundidad: valor, peso: valor",
      ],
      [
        "4. Para las especificaciones, use el formato: nombre: valor, nombre: valor, ...",
      ],
      ["5. Los precios deben ingresarse en enteros (ej. 1099), en caso de tener decimales, use el formato decimal (ej. 1099.50)"],
      ["6. El costo de envío también debe ingresarse en centavos"],
      ["7. Las palabras clave deben separarse por comas"],
      ["8. Las URLs de imágenes deben separarse por comas"],
      [
        "9. Pase el cursor sobre los encabezados de columna para ver descripciones y ejemplos",
      ],
      [""],
      ["Campos obligatorios:"],
      ["- Nombre del producto (name)"],
      ["- Nombre corto (short_name)"],
      ["- Descripción (description)"],
      ["- Descripción corta (short_description)"],
      ["- Precio (price)"],
      ["- Stock (stock)"],
      [""],
      ["Si tiene dudas, contacte al soporte técnico."],
    ]);

    // Set column width for instructions
    instructionsWs["!cols"] = [{ wch: 100 }];

    // Add the instructions worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, instructionsWs, "Instrucciones");

    // Generate the Excel file as a buffer
    const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // Create a response with the Excel file
    const response = new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=Plantilla_de_Importación_de_Inventario_Knoott.xlsx",
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
