"use client";

import type React from "react";
import { useRef } from "react";
import { Input } from "@/components/ui/input";

interface AmountInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onBlur?: (value: number) => void;
}

/**
 * Input para montos monetarios con comportamiento bancario.
 * Cada dígito ingresado empuja los existentes a la izquierda.
 * Los últimos dos dígitos siempre son centavos.
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

  // Convierte el valor numerico (en centavos) a formato de visualización
  const formatAmount = (amount: number): string => {
    // Convierte a string y asegura que tenga al menos 3 caracteres (0.00)
    const valueStr = amount.toString().padStart(3, "0");

    // Separa los pesos de los centavos
    const centavos = valueStr.slice(-2);
    const pesos = valueStr.slice(0, -2) || "0";

    // Formatea los pesos con separadores de miles
    const formattedPesos = Number.parseInt(pesos).toLocaleString("es-MX");

    return `${formattedPesos}.${centavos}`;
  };

  // Maneja cada tecla para comportamiento bancario
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir navegación y borrado
    if (
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "Delete" ||
      e.key === "Tab" ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }

    if (e.key === "Backspace") {
      e.preventDefault();
      handleBackspace();
      return;
    }

    // Solo permitir dígitos
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    e.preventDefault();

    // Convertir el valor actual a centavos (solo dígitos)
    const rawStr = value.toString();

    // Agregar el nuevo dígito al final y limitar a 10 dígitos (evita overflow)
    const newRawStr = (rawStr + e.key).slice(-10);
    const newValue = Number.parseInt(newRawStr);

    // Actualizar el valor
    onChange(newValue);
  };

  // Manejar cambios directos del input (para dispositivos móviles)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Extraer solo los dígitos del valor ingresado
    const inputDigits = e.target.value.replace(/\D/g, "");

    if (!inputDigits) {
      onChange(0);
      return;
    }

    // Si hay dígitos, actualizar el valor
    const newValue = Number.parseInt(inputDigits.slice(-10));
    onChange(newValue);
  };

  // Manejar borrado
  const handleBackspace = () => {
    // Convertir a string
    const rawStr = value.toString();

    // Eliminar el último dígito
    const newRawStr = rawStr.slice(0, -1) || "0";
    const newValue = Number.parseInt(newRawStr);

    // Actualizar el valor
    onChange(newValue);
  };

  // Cuando pierde el foco, asegurarse de que el formato sea correcto
  const handleBlur = () => {
    // Si no hay valor, establecer 0
    if (value === 0 || !value) {
      onChange(0);
    }

    onBlur?.(value);
  };

  return (
    <div className="relative flex items-center flex-1">
      <Input
        ref={inputRef}
        className={`bg-white ${className}`}
        placeholder={placeholder}
        value={`$${formatAmount(value)}`}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={disabled}
        autoComplete="off"
        type="text"
        inputMode="numeric"
      />
      <span className="text-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm peer-disabled:opacity-50">
        mxn
      </span>
    </div>
  );
};
