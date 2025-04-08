import { PageHeader } from "@/components/universal/headers";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BusinessForm } from "./_components/business-form";
import type { FeatureCollection } from "geojson";

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

interface City {
  name: string;
  state: string;
  value: string;
}

interface State {
  name: string;
  value: string;
}

const OnboardingPage = async () => {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch GeoJSON data
  let geoJsonData: FeatureCollection | null = null;
  let states: string[] = [];
  let cities: Record<string, string[]> = {};
  let sectors: string[] = [];

  try {
    // Fetch GeoJSON data
    const geoResponse = await fetch(
      "https://raw.githubusercontent.com/angelnmara/geojson/refs/heads/master/MunicipiosMexico.json"
    );
    geoJsonData = await geoResponse.json();

    // Extract states and cities from GeoJSON
    const statesMap = new Map<string, Set<string>>();

    if (geoJsonData && geoJsonData.features) {
      geoJsonData.features.forEach((feature: any) => {
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

          // Add state and city
          if (!statesMap.has(estado)) {
            statesMap.set(estado, new Set<string>());
          }
          statesMap.get(estado)?.add(municipio);
        }
      });
    }

    // Convert to arrays
    states = Array.from(statesMap.keys());
    cities = Object.fromEntries(
      Array.from(statesMap.entries()).map(([state, citiesSet]) => [
        state,
        Array.from(citiesSet),
      ])
    );

    // Fetch sectors
    const sectorsResponse = await fetch("/api/states-cities?type=sectors");
    const sectorsData = await sectorsResponse.json();
    sectors = sectorsData.sectors || [];
  } catch (error) {
    console.error("Error loading data:", error);

    // Fallback to API if GeoJSON fails
    try {
      // Fetch states
      const statesResponse = await fetch("/api/states-cities?type=states");
      const statesData = await statesResponse.json();
      states = statesData.states || [];

      // Fetch cities for each state
      for (const state of states) {
        const citiesResponse = await fetch(
          `/api/states-cities?type=cities&state=${encodeURIComponent(state)}`
        );
        const citiesData = await citiesResponse.json();
        cities[state] = citiesData.cities || [];
      }

      // Fetch sectors
      const sectorsResponse = await fetch("/api/states-cities?type=sectors");
      const sectorsData = await sectorsResponse.json();
      sectors = sectorsData.sectors || [];
    } catch (fallbackError) {
      console.error("Error in fallback data loading:", fallbackError);
    }
  }

  return (
    <main className="w-full h-fit items-center justify-start flex flex-col min-h-[calc(100dvh-56px)] py-7 lg:py-10">
      <div className="w-full h-fit items-start justify-start flex flex-col max-w-xl px-5 md:px-7 lg:px-0">
        <PageHeader
          title="Registra tu negocio"
          description="Registra tu negocio en Knoott Partners, agrega sucursales y comienza a personalizar tu tienda."
        />
        <BusinessForm
          initialStates={states}
          initialCities={cities}
          initialSectors={sectors}
          geoJsonData={geoJsonData}
        />
      </div>
    </main>
  );
};

export default OnboardingPage;
