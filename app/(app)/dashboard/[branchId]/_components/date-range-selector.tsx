"use client";

import { useState, useEffect } from "react";
import { format, startOfWeek, endOfWeek, parse } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const DateRangeSelector = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  // Inicializa con la semana actual
  const defaultDateRange: DateRange = {
    from: startOfWeek(new Date(), { locale: es }),
    to: endOfWeek(new Date(), { locale: es }),
  };

  // Estado local para el componente
  const [date, setDate] = useState<DateRange | undefined>(defaultDateRange);

  // Cargar fechas desde searchParams al montar el componente
  useEffect(() => {
    const fromParam = searchParams.get("fromDate");
    const toParam = searchParams.get("toDate");

    if (fromParam && toParam) {
      try {
        const from = parse(fromParam, "yyyy-MM-dd", new Date());
        const to = parse(toParam, "yyyy-MM-dd", new Date());
        setDate({ from, to });
      } catch (error) {
        console.error("Error parsing dates from URL", error);
        setDate(defaultDateRange);
      }
    } else {
      setDate(defaultDateRange);
    }
  }, [searchParams]);

  // Actualiza los searchParams cuando el usuario selecciona nuevas fechas
  const handleDateChange = (newDateRange: DateRange | undefined) => {
    setDate(newDateRange);

    if (newDateRange?.from && newDateRange?.to) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("fromDate", format(newDateRange.from, "yyyy-MM-dd"));
      params.set("toDate", format(newDateRange.to, "yyyy-MM-dd"));
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={"outline"}
          className={cn(
            "shrink-0 bg-sidebar",
            !date && "text-muted-foreground",
            
          )}
          size={isMobile ? "icon" : "default"}
        >
          <CalendarIcon className="h-4 w-4" />
          {!isMobile &&
            (date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "PP", { locale: es })} -{" "}
                  {format(date.to, "PP", { locale: es })}
                </>
              ) : (
                format(date.from, "dd/MM/yy", { locale: es })
              )
            ) : (
              <span>Selecciona un rango de fechas</span>
            ))}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={handleDateChange}
          numberOfMonths={isMobile ? 1 : 2}
          locale={es}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateRangeSelector;
