"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CalendarIcon, X, Circle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || ""
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    searchParams.get("startDate")
      ? new Date(searchParams.get("startDate") as string)
      : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    searchParams.get("endDate")
      ? new Date(searchParams.get("endDate") as string)
      : undefined
  );

  // Update local state when URL params change
  useEffect(() => {
    setStatusFilter(searchParams.get("status") || "");
    setStartDate(
      searchParams.get("startDate")
        ? new Date(searchParams.get("startDate") as string)
        : undefined
    );
    setEndDate(
      searchParams.get("endDate")
        ? new Date(searchParams.get("endDate") as string)
        : undefined
    );
  }, [searchParams]);

  // Create a new query string with updated parameters
  const createQueryString = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    });

    return newSearchParams.toString();
  };

  // Handle status filter
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    router.push(
      `${pathname}?${createQueryString({
        page: "1", // Reset to first page when filtering
        status: value === "all" ? null : value,
      })}`
    );
  };

  // Handle date range filter
  const handleDateFilter = (start?: Date, end?: Date) => {
    setStartDate(start);
    setEndDate(end);

    router.push(
      `${pathname}?${createQueryString({
        page: "1", // Reset to first page when filtering
        startDate: start ? start.toISOString() : null,
        endDate: end ? end.toISOString() : null,
      })}`
    );
  };

  const clearAllFilters = () => {
    setStatusFilter("");
    setStartDate(undefined);
    setEndDate(undefined);

    router.push(pathname);
  };

  // Count active filters
  const activeFiltersCount = [statusFilter, startDate, endDate].filter(
    Boolean
  ).length;

  return (
    <div className="w-full gap-y-4 flex flex-col">
      <div className="flex flex-col sm:flex-row gap-2 items-start justify-between">
        <Button
          variant={"outline"}
          size={"icon"}
          className="bg-sidebar"
          onClick={() => router.refresh()}
        >
          <RefreshCcw />
        </Button>
        <div className="flex flex-wrap gap-2 w-full sm:w-fit">
          {/* Status filter */}
          <Select
            value={statusFilter || "all"}
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="bg-sidebar w-fit gap-x-2">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">
                <span className="flex items-center justify-start gap-x-2">
                  <Circle className="!size-2 fill-muted-foreground text-muted-foreground" />
                  Creada
                </span>
              </SelectItem>
              <SelectItem value="requires_confirmation">
                <span className="flex items-center justify-start gap-x-2">
                  <Circle className="!size-2 fill-contrast text-contrast" />
                  Requiere verificación
                </span>
              </SelectItem>
              <SelectItem value="pending">
                <span className="flex items-center justify-start gap-x-2">
                  <Circle className="!size-2 fill-primary text-primary" />
                  En proceso
                </span>
              </SelectItem>
              <SelectItem value="shipped">
                <span className="flex items-center justify-start gap-x-2">
                  <Circle className="!size-2 fill-tertiary text-tertiary" />
                  En tránsito
                </span>
              </SelectItem>
              <SelectItem value="delivered">
                <span className="flex items-center justify-start gap-x-2">
                  <Circle className="!size-2 fill-success text-success" />
                  Entregado
                </span>
              </SelectItem>
              <SelectItem value="canceled">
                <span className="flex items-center justify-start gap-x-2">
                  <Circle className="!size-2 fill-destructive text-destructive" />
                  Cancelado
                </span>
              </SelectItem>
              <SelectSeparator />
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>

          {/* Date range filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("justify-start text-left font-normal bg-sidebar")}
              >
                <CalendarIcon className="!size-3.5" />
                {startDate && endDate ? (
                  <>
                    {format(startDate, "dd/MM/yyyy", { locale: es })} -{" "}
                    {format(endDate, "dd/MM/yyyy", { locale: es })}
                  </>
                ) : (
                  "Fecha de creación"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-fit min-w-[200px] p-0">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={startDate}
                selected={{
                  from: startDate,
                  to: endDate,
                }}
                onSelect={(range) => handleDateFilter(range?.from, range?.to)}
                numberOfMonths={2}
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Filtros activos:
          </span>

          {statusFilter && (
            <Badge
              onClick={() => {
                setStatusFilter("");
                router.push(
                  `${pathname}?${createQueryString({
                    status: null,
                    page: "1",
                  })}`
                );
              }}
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer pl-1"
            >
              <X className="h-3 w-3" />
              {statusFilter === "requires_confirmation" &&
                "Requiere confirmación"}
              {statusFilter === "pending" && "Pendiente"}
              {statusFilter === "delivered" && "Entregado"}
              {statusFilter === "shipped" && "En tránsito"}
              {statusFilter === "canceled" && "Cancelado"}
            </Badge>
          )}

          {(startDate || endDate) && (
            <Badge
              onClick={() => {
                setStartDate(undefined);
                setEndDate(undefined);
                router.push(
                  `${pathname}?${createQueryString({
                    startDate: null,
                    endDate: null,
                    page: "1",
                  })}`
                );
              }}
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer pl-1"
            >
              <X className="h-3 w-3" />
              {startDate && format(startDate, "dd/MM/yyyy", { locale: es })}
              {endDate && ` - ${format(endDate, "dd/MM/yyyy", { locale: es })}`}
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-xs h-7"
            onClick={clearAllFilters}
          >
            Limpiar todos
          </Button>
        </div>
      )}
    </div>
  );
}
