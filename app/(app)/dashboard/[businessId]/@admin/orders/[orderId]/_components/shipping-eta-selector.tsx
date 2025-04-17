"use client";

import type React from "react";
import { useState, useEffect, useRef, useId } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { addBusinessDays, format } from "date-fns";
import { es } from "date-fns/locale";

interface ShippingETASelectorProps {
  onSelectETA: (etaFirst: Date, etaSecond: Date) => void;
}

export function ShippingETASelector({ onSelectETA }: ShippingETASelectorProps) {
  const [minDays, setMinDays] = useState<number>(5);
  const [maxDays, setMaxDays] = useState<number>(10);
  const initialRender = useRef(true);
  const id = useId();

  // Calcular fechas basadas en días hábiles
  const today = new Date();
  const etaFirst = addBusinessDays(today, minDays);
  const etaSecond = addBusinessDays(today, maxDays);

  // Formatear fechas para mostrar
  const formatDate = (date: Date) => {
    return format(date, "d 'de' MMMM, yyyy", { locale: es });
  };

  const handleMinDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setMinDays(value);
      // Asegurar que minDays no sea mayor que maxDays
      if (value > maxDays) {
        setMaxDays(value);
      }
    }
  };

  const handleMaxDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    if (!isNaN(value) && value >= minDays) {
      setMaxDays(value);
    }
  };

  // Efecto para actualizar las fechas ETA automáticamente cuando cambian los valores
  useEffect(() => {
    // Establecer los valores iniciales en el primer renderizado
    if (initialRender.current) {
      initialRender.current = false;
      onSelectETA(etaFirst, etaSecond);
      return;
    }

    // Para renderizados posteriores, solo actualizar cuando cambien los valores
    const finalEtaFirst = addBusinessDays(today, minDays);
    const finalEtaSecond = addBusinessDays(today, maxDays);
    onSelectETA(finalEtaFirst, finalEtaSecond);
  }, [minDays, maxDays]); // Eliminamos onSelectETA de las dependencias

  return (
    <div className="flex flex-col space-y-1">
      <div className="flex">
        <Input
          id={`${id}-min`}
          type="number"
          min={0}
          value={minDays}
          onChange={handleMinDaysChange}
          className="flex-1 rounded-e-none bg-sidebar [-moz-appearance:_textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
          placeholder="Mínimo"
          aria-label="Días mínimos"
        />
        <div className="size-9 items-center justify-center bg-background border-y flex">
          a
        </div>
        <Input
          id={`${id}-max`}
          type="number"
          min={minDays}
          value={maxDays}
          onChange={handleMaxDaysChange}
          className="-ms-px flex-1 rounded-s-none bg-sidebar [-moz-appearance:_textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
          placeholder="Máximo"
          aria-label="Días máximos"
        />
      </div>
      <p className="text-xs text-muted-foreground">días hábiles</p>
    </div>
  );
}
