"use client";

import React, { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface AmountInputProps {
  value: number; // Ahora este valor es un entero (ej: 135015 para $1,350.15)
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onBlur?: (value: number) => void;
}

/**
 * Input para montos monetarios que maneja valores como enteros.
 * Si el usuario escribe 1350.15, el componente pasa 135015 como valor.
 * Los últimos 2 dígitos representan los centavos.
 */
export const AmountInput = ({
  value,
  onChange,
  onBlur,
  placeholder = "$0.00",
  className,
  disabled = false,
}: AmountInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [displayValue, setDisplayValue] = useState<string>("");
  const [hasDecimalPoint, setHasDecimalPoint] = useState<boolean>(false);

  // Actualiza el valor de visualización cuando cambia el valor numérico
  useEffect(() => {
    // Si el usuario está editando, no sobrescribir
    if (document.activeElement === inputRef.current) return;

    // Formatea el valor entero para mostrar como decimal
    setDisplayValue(formatIntegerToDisplay(value));
  }, [value]);

  // Convierte un valor entero (ej: 135015) a formato de visualización ($1,350.15)
  const formatIntegerToDisplay = (intValue: number): string => {
    if (intValue === 0 || isNaN(intValue)) return "";

    // Convertir a string
    const strValue = intValue.toString();

    // Extraer los centavos (últimos 2 dígitos)
    let dollars, cents;

    if (strValue.length <= 2) {
      // Si es menor que 100, todo son centavos
      dollars = "0";
      cents = strValue.padStart(2, "0");
    } else {
      // Separar dólares y centavos
      dollars = strValue.slice(0, -2);
      cents = strValue.slice(-2);
    }

    // Formatear la parte entera con separadores de miles
    dollars = dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Unir con punto decimal
    return `${dollars}.${cents}`;
  };

  // Formatea para mostrar en el input con el símbolo de moneda
  const getInputDisplayValue = (): string => {
    if (!displayValue) return "";
    return `$${displayValue}`;
  };

  // Convierte un valor con formato decimal a entero
  const convertToInteger = (decimalValue: string): number => {
    // Eliminar todo excepto números y el primer punto decimal
    const cleaned = decimalValue.replace(/[^\d.]/g, "");

    if (cleaned === "") return 0;

    if (cleaned.includes(".")) {
      // Si tiene punto decimal
      const parts = cleaned.split(".");
      const dollars = parts[0] || "0";
      // Tomar solo hasta 2 decimales
      const cents = (parts[1] || "").padEnd(2, "0").substring(0, 2);

      // Combinar como entero
      return parseInt(dollars + cents, 10);
    } else {
      // Si no tiene punto decimal, multiplicar por 100
      return parseInt(cleaned, 10) * 100;
    }
  };

  // Maneja cambios en el input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Obtener el valor sin el símbolo de moneda
    const rawValue = e.target.value.replace(/^\$/, "");

    // Eliminar caracteres no válidos, pero mantener el punto decimal
    const cleaned = rawValue.replace(/[^\d.]/g, "");

    // Asegurar que solo haya un punto decimal
    let processed = cleaned;
    const decimalIndex = cleaned.indexOf(".");

    if (decimalIndex !== -1) {
      const beforeDecimal = cleaned.substring(0, decimalIndex + 1);
      const afterDecimal = cleaned
        .substring(decimalIndex + 1)
        .replace(/\./g, "");
      processed = beforeDecimal + afterDecimal;
      setHasDecimalPoint(true);
    } else {
      setHasDecimalPoint(false);
    }

    // Actualizar el valor de visualización
    setDisplayValue(processed);

    // Convertir a entero y pasar al padre
    const integerValue = convertToInteger(processed);
    onChange(integerValue);
  };

  // Cuando pierde el foco, asegurarse de que el formato sea correcto
  const handleBlur = () => {
    // Si no hay valor, establecer 0
    if (!displayValue) {
      onChange(0);
      setDisplayValue("");
    } else {
      // Convertir a entero
      const integerValue = convertToInteger(displayValue);

      // Formatear para visualización
      const formattedValue = formatIntegerToDisplay(integerValue);
      setDisplayValue(formattedValue);

      // Notificar al componente padre
      onBlur?.(integerValue);
    }
  };

  // Maneja el foco para mejorar la experiencia de usuario
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Seleccionar todo el texto para facilitar la edición
    e.target.select();
  };

  return (
    <div className="relative flex items-center flex-1">
      <Input
        ref={inputRef}
        className={`bg-white ${className}`}
        placeholder={placeholder}
        value={getInputDisplayValue()}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        disabled={disabled}
        autoComplete="off"
        type="text"
        inputMode="decimal"
      />
      <span className="text-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm peer-disabled:opacity-50">
        mxn
      </span>
    </div>
  );
};
