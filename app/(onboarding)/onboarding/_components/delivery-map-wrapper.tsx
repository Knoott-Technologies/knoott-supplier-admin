"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import type { FeatureCollection } from "geojson";

// Import types only
import type { DeliveryMapProps } from "./delivery-map";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import the map component with SSR disabled
const DeliveryMapClient = dynamic(() => import("./delivery-map"), {
  ssr: false,
  loading: () => (
    <Card className="border">
      <CardContent className="p-0 overflow-hidden">
        <Skeleton className="h-auto aspect-square w-full" />
      </CardContent>
    </Card>
  ),
});

interface City {
  name: string;
  state: string;
  value: string;
}

interface State {
  name: string;
  value: string;
}

interface DeliveryMapWrapperProps
  extends Omit<DeliveryMapProps, "geoJsonData"> {
  initialCities: City[];
  initialStates: State[];
  geoJsonData: FeatureCollection | null;
}

export function DeliveryMapWrapper({
  value,
  onChange,
  initialCities,
  initialStates,
  geoJsonData,
}: DeliveryMapWrapperProps) {
  const [selectedRegions, setSelectedRegions] = useState<string[]>(value || []);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCities, setFilteredCities] = useState<City[]>(initialCities);
  const [filteredStates, setFilteredStates] = useState<State[]>(initialStates);
  const [isDataAvailable, setIsDataAvailable] = useState(false);

  // Check if data is available
  useEffect(() => {
    setIsDataAvailable(
      initialCities.length > 0 &&
        initialStates.length > 0 &&
        geoJsonData !== null
    );
  }, [initialCities, initialStates, geoJsonData]);

  // Filter cities and states based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCities(initialCities);
      setFilteredStates(initialStates);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();

    // Filter cities
    const filteredCities = initialCities.filter(
      (city) =>
        city.name.toLowerCase().includes(lowerSearchTerm) ||
        city.state.toLowerCase().includes(lowerSearchTerm)
    );
    setFilteredCities(filteredCities);

    // Filter states
    const filteredStates = initialStates.filter((state) =>
      state.name.toLowerCase().includes(lowerSearchTerm)
    );
    setFilteredStates(filteredStates);
  }, [searchTerm, initialCities, initialStates]);

  // Update parent form when selections change
  useEffect(() => {
    if (JSON.stringify(value) !== JSON.stringify(selectedRegions)) {
      onChange(selectedRegions);
    }
  }, [selectedRegions, value, onChange]);

  // Update local state when props change
  useEffect(() => {
    if (JSON.stringify(value) !== JSON.stringify(selectedRegions)) {
      setSelectedRegions(value || []);
    }
  }, [value]);

  // Add a selected city
  const addCity = (value: string) => {
    if (!selectedRegions.includes(value)) {
      setSelectedRegions((prev) => [...prev, value]);
    }
    setOpen(false);
  };

  // Add all cities from a state
  const addEntireState = (stateName: string) => {
    // Get all cities from this state
    const stateCities = initialCities.filter(
      (city) => city.state === stateName
    );

    // Add all cities that aren't already selected
    const newRegions = [...selectedRegions];

    stateCities.forEach((city) => {
      if (!newRegions.includes(city.value)) {
        newRegions.push(city.value);
      }
    });

    setSelectedRegions(newRegions);
    setOpen(false);
  };

  // Remove a selected region
  const removeRegion = (region: string) => {
    setSelectedRegions((prev) => prev.filter((r) => r !== region));
  };

  // Remove all cities from a state
  const removeEntireState = (stateName: string) => {
    setSelectedRegions((prev) =>
      prev.filter((region) => {
        const [, state] = region.split("|");
        return state !== stateName;
      })
    );
  };

  // Check if all cities of a state are selected
  const isEntireStateSelected = (stateName: string) => {
    const stateCities = initialCities.filter(
      (city) => city.state === stateName
    );
    return stateCities.every((city) => selectedRegions.includes(city.value));
  };

  // Get count of selected cities in a state
  const getSelectedCitiesCount = (stateName: string) => {
    return selectedRegions.filter((region) => {
      const [, state] = region.split("|");
      return state === stateName;
    }).length;
  };

  // Select all cities in Mexico
  const selectAllMexico = () => {
    // Get all cities from all states
    const allCities = initialCities.map((city) => city.value);
    setSelectedRegions(allCities);
    setOpen(false);
  };

  // Handle map selection changes
  const handleMapSelectionChange = (newSelection: string[]) => {
    setSelectedRegions(newSelection);
  };

  // Group selected regions by state for display
  const groupedSelections = selectedRegions.reduce<Record<string, string[]>>(
    (acc, region) => {
      const [city, state] = region.split("|");
      if (!acc[state]) {
        acc[state] = [];
      }
      acc[state].push(region);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-4">
      {/* Search box for cities and states */}
      <Popover
        open={open && isDataAvailable}
        onOpenChange={(o) => isDataAvailable && setOpen(o)}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={!isDataAvailable}
          >
            {!isDataAvailable
              ? "Cargando datos geográficos..."
              : "Buscar ciudad o estado..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
        >
          <Command>
            <CommandInput
              placeholder="Buscar ciudad o estado..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>No se encontraron resultados.</CommandEmpty>

              {filteredStates.length > 0 && (
                <>
                  <CommandGroup heading="País">
                    <CommandItem
                      key="all-mexico"
                      value="all-mexico"
                      onSelect={selectAllMexico}
                      className="flex items-center"
                    >
                      <div className="flex items-center flex-1">
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedRegions.length === initialCities.length
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Todo México</span>
                      </div>
                      {selectedRegions.length > 0 &&
                        selectedRegions.length < initialCities.length && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            {selectedRegions.length}/{initialCities.length}{" "}
                            ciudades
                          </span>
                        )}
                    </CommandItem>
                  </CommandGroup>
                  <CommandGroup heading="Estados">
                    {filteredStates.map((state) => {
                      const stateSelected = isEntireStateSelected(state.name);
                      const selectedCount = getSelectedCitiesCount(state.name);
                      const totalCities = initialCities.filter(
                        (city) => city.state === state.name
                      ).length;

                      return (
                        <CommandItem
                          key={`state-${state.value}`}
                          value={`state-${state.value}`}
                          onSelect={() => {
                            if (stateSelected) {
                              removeEntireState(state.name);
                            } else {
                              addEntireState(state.name);
                            }
                          }}
                          className="flex items-center"
                        >
                          <div className="flex items-center flex-1">
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                stateSelected
                                  ? "opacity-100"
                                  : selectedCount > 0
                                  ? "opacity-50"
                                  : "opacity-0"
                              )}
                            />
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{state.name}</span>
                          </div>
                          {selectedCount > 0 && (
                            <span className="text-xs text-muted-foreground ml-auto">
                              {selectedCount}/{totalCities} ciudades
                            </span>
                          )}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              <CommandGroup heading="Ciudades">
                {filteredCities.slice(0, 100).map((city) => (
                  <CommandItem
                    key={city.value}
                    value={city.value}
                    onSelect={() => addCity(city.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedRegions.includes(city.value)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {city.name}, {city.state}
                  </CommandItem>
                ))}
                {filteredCities.length > 100 && (
                  <div className="py-2 px-2 text-xs text-muted-foreground">
                    Mostrando 100 de {filteredCities.length} resultados. Refina
                    tu búsqueda para ver más.
                  </div>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Interactive map */}
      {isDataAvailable ? (
        <DeliveryMapClient
          value={selectedRegions}
          onChange={handleMapSelectionChange}
          geoJsonData={geoJsonData}
        />
      ) : (
        <Card className="border">
          <CardContent className="p-0 overflow-hidden">
            <Skeleton className="h-auto aspect-square w-full" />
          </CardContent>
        </Card>
      )}

      {/* Selected regions display with horizontal scroll */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar">
        {Object.keys(groupedSelections).length > 0 ? (
          Object.entries(groupedSelections).map(([state, regions]) => (
            <Card key={state} className="w-full border-t-0">
              <CardHeader className="sticky top-0 bg-background border-t">
                <span className="w-full flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{state}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 h-fit py-1.5"
                    onClick={() => removeEntireState(state)}
                  >
                    Eliminar todas
                    <Trash2 className="ml-1 !size-3" />
                  </Button>
                </span>
              </CardHeader>
              <CardContent className="w-full bg-sidebar">
                <div className="flex flex-wrap gap-1 no-scrollbar">
                  {regions.map((region) => {
                    const [city] = region.split("|");
                    return (
                      <Button
                        key={region}
                        variant="outline"
                        size="sm"
                        className="text-xs h-fit py-1.5 flex-shrink-0"
                        onClick={() => removeRegion(region)}
                      >
                        {city}
                        <X className="ml-1 !size-3" />
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            {isDataAvailable
              ? "Busca ciudades o estados, o haz clic en las regiones del mapa para seleccionar zonas de entrega"
              : "Cargando datos geográficos..."}
          </p>
        )}
      </div>
    </div>
  );
}
