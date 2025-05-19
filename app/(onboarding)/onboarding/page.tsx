import { PageHeader } from "@/components/universal/headers";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BusinessForm } from "./_components/business-form";
import type { FeatureCollection } from "geojson";
import { Suspense } from "react";
import { BusinessFormSkeleton } from "./_components/business-form-skeleton";
import Link from "next/link";

// Lista de sectores de negocio
const BUSINESS_SECTORS = [
  "Mueblería",
  "Tienda departamental",
  "Tienda de decoración",
  "Electrónica",
  "Ropa y accesorios",
  "Alimentos y bebidas",
  "Artículos para el hogar",
  "Ferretería",
  "Papelería",
  "Juguetería",
  "Deportes",
  "Tecnología",
  "Joyería",
  "Farmacia",
  "Librería",
  "Artesanías",
  "Mascotas",
  "Belleza y cuidado personal",
  "Floristería",
  "Otro",
];

// Componente para cargar los datos de GeoJSON
async function GeoDataLoader() {
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

  try {
    // Fetch GeoJSON data
    const geoResponse = await fetch(
      "https://raw.githubusercontent.com/angelnmara/geojson/refs/heads/master/MunicipiosMexico.json"
    );
    geoJsonData = await geoResponse.json();

    // Extract states and cities directly from GeoJSON
    const statesMap = new Map<string, Set<string>>();

    if (geoJsonData && geoJsonData.features) {
      geoJsonData.features.forEach((feature: any) => {
        if (feature.properties) {
          // Extract data using NAME_0, NAME_1, NAME_2 format
          const municipio = feature.properties.NAME_2 || "";
          const estado = feature.properties.NAME_1 || "";

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
    states = Array.from(statesMap.keys()).sort();
    cities = Object.fromEntries(
      Array.from(statesMap.entries()).map(([state, citiesSet]) => [
        state,
        Array.from(citiesSet).sort(),
      ])
    );
  } catch (error) {
    console.error("Error loading GeoJSON data:", error);
    states = [];
    cities = {};
  }

  return (
    <BusinessForm
      initialStates={states}
      initialCities={cities}
      initialSectors={BUSINESS_SECTORS}
      geoJsonData={geoJsonData}
    />
  );
}

const OnboardingPage = () => {
  return (
    <main className="w-full h-fit items-center justify-start flex flex-col min-h-[calc(100dvh-56px)] py-7 lg:py-10">
      <div className="w-full h-fit items-start justify-start flex flex-col max-w-xl px-5 md:px-7 lg:px-0">
        <PageHeader
          title="Registra tu negocio en Knoott Partners"
          description="Agrega la información de tu negocio y comienza a vender tus productos en Knoott."
        />
        <Suspense fallback={<BusinessFormSkeleton />}>
          <GeoDataLoader />
        </Suspense>
      </div>
    </main>
  );
};

export default OnboardingPage;
