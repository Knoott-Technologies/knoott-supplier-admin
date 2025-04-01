import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un valor numérico como precio en formato MXN,
 * donde los dos últimos dígitos representan centavos.
 *
 * Ejemplos:
 * - 10000 => $100.00
 * - 12345 => $123.45
 * - 50 => $0.50
 *
 * @param amount - Valor numérico donde los dos últimos dígitos son centavos
 * @returns Cadena formateada con el precio
 */
export const formatPrice = (amount: number): string => {
  // Dividir por 100 para convertir los últimos dos dígitos a centavos
  const valueWithDecimals = amount / 100;

  // Usar Intl.NumberFormat para formatear con símbolo de moneda y dos decimales fijos
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valueWithDecimals);
};

export function generateReferenceFromName(name: string): string {
  // Eliminar caracteres especiales y espacios
  const cleanName = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .replace(/[^\w\s]/gi, "") // Eliminar caracteres especiales
    .replace(/\s+/g, " ") // Reemplazar múltiples espacios por uno solo
    .trim()
    .toUpperCase();

  // Tomar las primeras 4 letras de cada palabra
  const words = cleanName.split(" ");
  let reference = "";

  if (words.length === 1) {
    // Si solo hay una palabra, tomar hasta 8 caracteres
    reference = words[0].substring(0, 8);
  } else {
    // Si hay múltiples palabras, tomar las primeras letras de cada una
    for (let i = 0; i < Math.min(words.length, 4); i++) {
      if (words[i].length > 0) {
        reference += words[i].substring(0, Math.min(4, words[i].length));
      }
    }
    // Limitar a 8 caracteres en total
    reference = reference.substring(0, 8);
  }

  return reference;
}

/**
 * Genera una referencia para una sucursal basada en la referencia del negocio
 * @param businessReference Referencia del negocio
 * @param branchCount Número de sucursales existentes
 * @returns Referencia generada para la sucursal
 */
export function generateBranchReference(
  businessReference: string,
  branchCount: number
): string {
  return `${businessReference}-${branchCount + 1}`;
}
