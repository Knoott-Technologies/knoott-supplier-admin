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
