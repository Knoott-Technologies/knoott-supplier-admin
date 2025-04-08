"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

// Función para extraer el nombre del estado del código
const getEstadoName = (cveEnt: string): string => {
  const estados: Record<string, string> = {
    "01": "Aguascalientes",
    "02": "Baja California",
    "03": "Baja California Sur",
    "04": "Campeche",
    "05": "Coahuila",
    "06": "Colima",
    "07": "Chiapas",
    "08": "Chihuahua",
    "09": "Ciudad de México",
    "10": "Durango",
    "11": "Guanajuato",
    "12": "Guerrero",
    "13": "Hidalgo",
    "14": "Jalisco",
    "15": "Estado de México",
    "16": "Michoacán",
    "17": "Morelos",
    "18": "Nayarit",
    "19": "Nuevo León",
    "20": "Oaxaca",
    "21": "Puebla",
    "22": "Querétaro",
    "23": "Quintana Roo",
    "24": "San Luis Potosí",
    "25": "Sinaloa",
    "26": "Sonora",
    "27": "Tabasco",
    "28": "Tamaulipas",
    "29": "Tlaxcala",
    "30": "Veracruz",
    "31": "Yucatán",
    "32": "Zacatecas",
  };
  return estados[cveEnt] || cveEnt;
};

export function DeliveryMapWrapper(
  props: Omit<DeliveryMapProps, "geoJsonData">
) {
  const [selectedRegions, setSelectedRegions] = useState<string[]>(
    props.value || []
  );
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [filteredStates, setFilteredStates] = useState<State[]>([]);
  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(
    null
  );

  // Load GeoJSON data and extract cities and states
  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        setLoading(true);
        // Fetch from the GitHub URL
        const response = await fetch(
          "https://raw.githubusercontent.com/angelnmara/geojson/refs/heads/master/MunicipiosMexico.json"
        );
        const data = await response.json();
        setGeoJsonData(data);

        // Extract unique states and cities from GeoJSON
        const statesMap = new Map<string, string>();
        const citiesArray: City[] = [];

        // Process features to extract states and cities
        if (data && data.features) {
          data.features.forEach((feature: any) => {
            if (feature.properties) {
              const municipio =
                feature.properties.NAME_2 || feature.properties.NOMGEO || "";
              let estado = "";

              // Get state name
              if (feature.properties.NAME_1) {
                estado = feature.properties.NAME_1;
              } else if (feature.properties.CVE_ENT) {
                estado = getEstadoName(feature.properties.CVE_ENT);
              }

              // Skip if missing data
              if (!municipio || !estado) return;

              // Add state to map
              statesMap.set(estado, estado);

              // Add city to array
              citiesArray.push({
                name: municipio,
                state: estado,
                value: `${municipio}|${estado}`,
              });
            }
          });
        }

        // Convert states map to array
        const statesArray: State[] = Array.from(statesMap.entries()).map(
          ([name]) => ({
            name,
            value: name,
          })
        );

        setStates(statesArray);
        setFilteredStates(statesArray);
        setCities(citiesArray);
        setFilteredCities(citiesArray);
      } catch (error) {
        console.error("Error loading GeoJSON data:", error);

        // Fallback to API if GeoJSON fails
        fetchStatesAndCitiesFromAPI();
      } finally {
        setLoading(false);
      }
    };

    // Fallback method to fetch from API
    const fetchStatesAndCitiesFromAPI = async () => {
      try {
        // Fetch states
        const statesResponse = await fetch("/api/states-cities?type=states");
        const statesData = await statesResponse.json();
        const statesList = statesData.states || [];

        // Create states array
        const statesArray: State[] = statesList.map((state: string) => ({
          name: state,
          value: state,
        }));

        setStates(statesArray);
        setFilteredStates(statesArray);

        // Fetch cities for each state
        const allCities: City[] = [];
        for (const state of statesList) {
          const citiesResponse = await fetch(
            `/api/states-cities?type=cities&state=${encodeURIComponent(state)}`
          );
          const citiesData = await citiesResponse.json();
          const stateCities = citiesData.cities || [];

          // Add cities to the list
          stateCities.forEach((city: string) => {
            allCities.push({
              name: city,
              state: state,
              value: `${city}|${state}`,
            });
          });
        }

        setCities(allCities);
        setFilteredCities(allCities);
      } catch (error) {
        console.error("Error loading data from API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGeoData();
  }, []);

  // Filter cities and states based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCities(cities);
      setFilteredStates(states);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();

    // Filter cities
    const filteredCities = cities.filter(
      (city) =>
        city.name.toLowerCase().includes(lowerSearchTerm) ||
        city.state.toLowerCase().includes(lowerSearchTerm)
    );
    setFilteredCities(filteredCities);

    // Filter states
    const filteredStates = states.filter((state) =>
      state.name.toLowerCase().includes(lowerSearchTerm)
    );
    setFilteredStates(filteredStates);
  }, [searchTerm, cities, states]);

  // Update parent form when selections change
  useEffect(() => {
    if (JSON.stringify(props.value) !== JSON.stringify(selectedRegions)) {
      props.onChange(selectedRegions);
    }
  }, [selectedRegions, props]);

  // Update local state when props change
  useEffect(() => {
    if (JSON.stringify(props.value) !== JSON.stringify(selectedRegions)) {
      setSelectedRegions(props.value || []);
    }
  }, [props.value]);

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
    const stateCities = cities.filter((city) => city.state === stateName);

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
    const stateCities = cities.filter((city) => city.state === stateName);
    return stateCities.every((city) => selectedRegions.includes(city.value));
  };

  // Get count of selected cities in a state
  const getSelectedCitiesCount = (stateName: string) => {
    return selectedRegions.filter((region) => {
      const [, state] = region.split("|");
      return state === stateName;
    }).length;
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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {loading ? "Cargando datos..." : "Buscar ciudad o estado..."}
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
                  <CommandGroup heading="Estados">
                    {filteredStates.map((state) => {
                      const stateSelected = isEntireStateSelected(state.name);
                      const selectedCount = getSelectedCitiesCount(state.name);
                      const totalCities = cities.filter(
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
      <DeliveryMapClient
        value={selectedRegions}
        onChange={handleMapSelectionChange}
        geoJsonData={geoJsonData}
      />

      {/* Selected regions display */}
      <div className="space-y-4">
        {Object.entries(groupedSelections).map(([state, regions]) => (
          <div key={state} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">{state}</h4>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 h-fit py-1.5"
                onClick={() => removeEntireState(state)}
              >
                Eliminar todas
                <Trash2 className="!size-3"/>
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {regions.map((region) => {
                const [city] = region.split("|");
                return (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground h-fit py-1.5 hover:text-destructive"
                    onClick={() => removeRegion(region)}
                  >
                    {city}
                    <X className="!size-3" />
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
        {selectedRegions.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Busca ciudades o estados, o haz clic en las regiones del mapa para
            seleccionar zonas de entrega
          </p>
        )}
      </div>
    </div>
  );
}
