import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();

    // Create example data for products
    const productExampleData = [
      {
        nombre: "Camiseta de algodón premium",
        nombre_corto: "Camiseta premium",
        descripcion: "Camiseta de algodón 100% premium con diseño exclusivo...",
        descripcion_corta: "Camiseta de algodón premium",
        marca_id: "1",
        subcategoria_id: "2",
        palabras_clave: "camiseta, algodón, premium, ropa",
        dimensiones: "Largo: 70cm, Ancho: 50cm",
        especificaciones: "Material: Algodón 100%, Peso: 180g",
        imagenes_url:
          "https://ejemplo.com/imagen1.jpg, https://ejemplo.com/imagen2.jpg",
        identificador: "CAM-PREM-001", // Identificador para relacionar con variantes
      },
      {
        nombre: "Pantalón vaquero slim fit",
        nombre_corto: "Vaquero slim",
        descripcion: "Pantalón vaquero de corte slim con acabado premium...",
        descripcion_corta: "Vaquero de corte slim",
        marca_id: "2",
        subcategoria_id: "3",
        palabras_clave: "pantalón, vaquero, slim, jeans",
        dimensiones: "Largo: 100cm, Cintura: 80cm",
        especificaciones: "Material: 98% Algodón, 2% Elastano, Peso: 400g",
        imagenes_url: "https://ejemplo.com/imagen3.jpg",
        identificador: "PAN-SLIM-001", // Identificador para relacionar con variantes
      },
    ];

    // Create example data for variants
    const variantExampleData = [
      {
        producto_sku: "CAM-PREM-001", // Debe coincidir con el identificador del producto
        variante_nombre: "Color",
        variante_nombre_visualizacion: "Selecciona un color",
        opcion_nombre: "Rojo",
        opcion_nombre_visualizacion: "Color Rojo",
        precio: "299.99",
        stock: "50",
        es_predeterminado: "true",
        sku: "CAM-PREM-001-R", // SKU único para la opción de variante
        imagenes_url: "https://ejemplo.com/imagen1-rojo.jpg",
      },
      {
        producto_sku: "CAM-PREM-001",
        variante_nombre: "Color",
        variante_nombre_visualizacion: "Selecciona un color",
        opcion_nombre: "Azul",
        opcion_nombre_visualizacion: "Color Azul",
        precio: "299.99",
        stock: "30",
        es_predeterminado: "false",
        sku: "CAM-PREM-001-A",
        imagenes_url: "https://ejemplo.com/imagen1-azul.jpg",
      },
      {
        producto_sku: "CAM-PREM-001",
        variante_nombre: "Talla",
        variante_nombre_visualizacion: "Selecciona una talla",
        opcion_nombre: "M",
        opcion_nombre_visualizacion: "Talla M",
        precio: "299.99",
        stock: "20",
        es_predeterminado: "true",
        sku: "CAM-PREM-001-M",
        imagenes_url: "",
      },
    ];

    // Create instructions sheet
    const instructionsData = [
      ["Instrucciones para importar productos"],
      [""],
      ["1. La plantilla contiene dos hojas: 'Productos' y 'Variantes'"],
      [
        "2. En la hoja 'Productos', ingresa la información básica de cada producto",
      ],
      [
        "3. En la hoja 'Variantes', ingresa las variantes y opciones de cada producto",
      ],
      [
        "4. Para relacionar variantes con productos, usa el mismo valor en 'identificador' del producto y 'producto_sku' de la variante",
      ],
      ["5. Si un producto con el mismo nombre ya existe, será actualizado"],
      [
        "6. Para múltiples valores en campos como 'palabras_clave' o 'imagenes_url', sepáralos con comas",
      ],
      [
        "7. Para dimensiones y especificaciones, usa el formato 'Etiqueta: Valor, Etiqueta2: Valor2'",
      ],
      [""],
      ["Campos obligatorios en Productos:"],
      ["- nombre"],
      ["- nombre_corto"],
      ["- descripcion"],
      ["- descripcion_corta"],
      ["- subcategoria_id"],
      ["- identificador (para relacionar con variantes)"],
      [""],
      ["Campos obligatorios en Variantes:"],
      ["- producto_sku (debe coincidir con el identificador del producto)"],
      ["- variante_nombre"],
      ["- opcion_nombre"],
      ["- precio"],
      ["- sku (para la opción de variante)"],
    ];

    // Create worksheets
    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
    const productSheet = XLSX.utils.json_to_sheet(productExampleData);
    const variantSheet = XLSX.utils.json_to_sheet(variantExampleData);

    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instrucciones");
    XLSX.utils.book_append_sheet(workbook, productSheet, "Productos");
    XLSX.utils.book_append_sheet(workbook, variantSheet, "Variantes");

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Return the Excel file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=plantilla-productos.xlsx",
      },
    });
  } catch (error) {
    console.error("Error generating template:", error);
    return NextResponse.json(
      { error: "Error generating template" },
      { status: 500 }
    );
  }
}
