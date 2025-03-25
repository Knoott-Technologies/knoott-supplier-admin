"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, CalendarIcon, X, Tag, ListTree } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Switch, SwitchTrash } from "@/components/ui/switch";

interface Brand {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
}

interface FilterBarProps {
  brands: Brand[];
  subcategories: Subcategory[];
}

export function FilterBar({ brands, subcategories }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for filters
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || ""
  );
  const [brandFilter, setBrandFilter] = useState(
    searchParams.get("brandId") || ""
  );
  const [subcategoryFilter, setSubcategoryFilter] = useState(
    searchParams.get("subcategoryId") || ""
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
  const [showTrahsh, setShowTrash] = useState(searchParams.get("showTrash") === "true" || false);

  // Update local state when URL params change
  useEffect(() => {
    setSearchValue(searchParams.get("search") || "");
    setStatusFilter(searchParams.get("status") || "");
    setBrandFilter(searchParams.get("brandId") || "");
    setSubcategoryFilter(searchParams.get("subcategoryId") || "");
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

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `${pathname}?${createQueryString({
        page: "1", // Reset to first page when searching
        search: searchValue || null,
      })}`
    );
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

  // Handle brand filter
  const handleBrandFilter = (value: string) => {
    setBrandFilter(value);
    router.push(
      `${pathname}?${createQueryString({
        page: "1", // Reset to first page when filtering
        brandId: value || null,
      })}`
    );
  };

  // Handle subcategory filter
  const handleSubcategoryFilter = (value: string) => {
    setSubcategoryFilter(value);
    router.push(
      `${pathname}?${createQueryString({
        page: "1", // Reset to first page when filtering
        subcategoryId: value || null,
      })}`
    );
  };

  const handleShowTrash = (value: boolean) => {
    setShowTrash(value);
    router.push(
      `${pathname}?${createQueryString({
        page: "1", // Reset to first page when filtering
        showTrash: value ? "true" : "false",
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
        startDate: start ? start.toISOString().split("T")[0] : null,
        endDate: end ? end.toISOString().split("T")[0] : null,
      })}`
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchValue("");
    setStatusFilter("");
    setBrandFilter("");
    setSubcategoryFilter("");
    setStartDate(undefined);
    setEndDate(undefined);

    router.push(pathname);
  };

  // Count active filters
  const activeFiltersCount = [
    searchValue,
    statusFilter,
    brandFilter,
    subcategoryFilter,
    startDate,
    endDate,
  ].filter(Boolean).length;

  return (
    <div className="w-full gap-y-4 flex flex-col">
      <div className="flex flex-col sm:flex-row gap-2 items-start justify-between">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 w-full sm:max-w-md">
          <div className="relative">
            <Input
              placeholder="Buscar productos..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-9 bg-sidebar"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <Search size={16} />
            </div>
          </div>
        </form>

        <div className="flex flex-wrap gap-2 w-full sm:w-fit">
          <div className="flex gap-2 h-9 items-center justify-start bg-sidebar px-3 border">
            <p className="text-sm font-normal">Papelera</p>
            <SwitchTrash
              className="data-[state=checked]:bg-destructive"
              checked={showTrahsh}
              onCheckedChange={handleShowTrash}
            />
          </div>
          {/* Status filter */}
          <Select
            value={statusFilter || "all"}
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="bg-sidebar w-fit gap-x-2">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Estatus</SelectItem>
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="archived">Archivado</SelectItem>
              <SelectItem value="requires_verification">En revisión</SelectItem>
            </SelectContent>
          </Select>

          {/* Brand filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-fit justify-between bg-sidebar font-normal"
              >
                {brandFilter
                  ? brands.find((brand) => brand.id.toString() === brandFilter)
                      ?.name
                  : "Marca"}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-fit min-w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Buscar marca..." />
                <CommandList>
                  <CommandEmpty>No se encontraron marcas.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => handleBrandFilter("")}
                      className="cursor-pointer"
                    >
                      Todas las marcas
                    </CommandItem>
                    {brands.map((brand) => (
                      <CommandItem
                        key={brand.id}
                        value={brand.name}
                        onSelect={() => handleBrandFilter(brand.id.toString())}
                        className="cursor-pointer"
                      >
                        {brand.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Subcategory filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-fit justify-between bg-sidebar font-normal"
              >
                {subcategoryFilter
                  ? subcategories.find(
                      (sub) => sub.id.toString() === subcategoryFilter
                    )?.name
                  : "Subcategoría"}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-fit min-w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Buscar subcategoría..." />
                <CommandList>
                  <CommandEmpty>No se encontraron subcategorías.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => handleSubcategoryFilter("")}
                      className="cursor-pointer"
                    >
                      Todas las subcategorías
                    </CommandItem>
                    {subcategories.map((subcategory) => (
                      <CommandItem
                        key={subcategory.id}
                        value={subcategory.name}
                        onSelect={() =>
                          handleSubcategoryFilter(subcategory.id.toString())
                        }
                        className="cursor-pointer"
                      >
                        {subcategory.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

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
                  "Rango de creación"
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

          {searchValue && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Búsqueda: {searchValue}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => {
                  setSearchValue("");
                  router.push(
                    `${pathname}?${createQueryString({
                      search: null,
                      page: "1",
                    })}`
                  );
                }}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Eliminar filtro</span>
              </Button>
            </Badge>
          )}

          {statusFilter && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Estatus:{" "}
              {statusFilter === "draft"
                ? "Borrador"
                : statusFilter === "active"
                ? "Activo"
                : "Archivado"}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => {
                  setStatusFilter("");
                  router.push(
                    `${pathname}?${createQueryString({
                      status: null,
                      page: "1",
                    })}`
                  );
                }}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Eliminar filtro</span>
              </Button>
            </Badge>
          )}

          {brandFilter && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Marca:{" "}
              {
                brands.find((brand) => brand.id.toString() === brandFilter)
                  ?.name
              }
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => {
                  setBrandFilter("");
                  router.push(
                    `${pathname}?${createQueryString({
                      brandId: null,
                      page: "1",
                    })}`
                  );
                }}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Eliminar filtro</span>
              </Button>
            </Badge>
          )}

          {subcategoryFilter && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Subcategoría:{" "}
              {
                subcategories.find(
                  (sub) => sub.id.toString() === subcategoryFilter
                )?.name
              }
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => {
                  setSubcategoryFilter("");
                  router.push(
                    `${pathname}?${createQueryString({
                      subcategoryId: null,
                      page: "1",
                    })}`
                  );
                }}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Eliminar filtro</span>
              </Button>
            </Badge>
          )}

          {(startDate || endDate) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Fecha:{" "}
              {startDate && format(startDate, "dd/MM/yyyy", { locale: es })}
              {endDate && ` - ${format(endDate, "dd/MM/yyyy", { locale: es })}`}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
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
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Eliminar filtro</span>
              </Button>
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
