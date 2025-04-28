import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/universal/headers";
import { BusinessInfoEditForm } from "./_components/business-info-edit-form";
import { BusinessInfoSkeleton } from "./_components/business-info-skeleton";
import type { FeatureCollection } from "geojson";
import { Suspense } from "react";

// Business data loader component
async function BusinessDataLoader({ businessId }: { businessId: string }) {
  const supabase = createClient(cookies());

  const { data: business } = await supabase
    .from("provider_business")
    .select("*")
    .eq("id", businessId)
    .single();

  if (!business) {
    redirect("/");
  }

  // Fetch GeoJSON data
  let geoJsonData: FeatureCollection | null = null;
  let mapCities: any[] = [];
  let mapStates: any[] = [];
  let deliveryZonesFormatted: string[] = [];

  try {
    // Fetch GeoJSON data
    const geoResponse = await fetch(
      "https://raw.githubusercontent.com/angelnmara/geojson/refs/heads/master/MunicipiosMexico.json"
    );
    geoJsonData = await geoResponse.json();

    // Extract states and cities from GeoJSON
    const statesMap = new Map<string, string>();
    const citiesArray: any[] = [];

    if (geoJsonData && geoJsonData.features) {
      geoJsonData.features.forEach((feature: any) => {
        if (feature.properties) {
          const municipio = feature.properties.NAME_2 || "";
          const estado = feature.properties.NAME_1 || "";

          if (!municipio || !estado) return;

          statesMap.set(estado, estado);

          citiesArray.push({
            name: municipio,
            state: estado,
            value: `${municipio}|${estado}`,
          });
        }
      });
    }

    // Convert states to format for the map
    mapStates = Array.from(statesMap.entries()).map(([name]) => ({
      name,
      value: name,
    }));

    mapCities = citiesArray;

    // Format delivery zones for the map component
    if (business.delivery_zones && business.delivery_zones.length > 0) {
      deliveryZonesFormatted = business.delivery_zones.map(
        (zone: { city: string; state: string }) => `${zone.city}|${zone.state}`
      );
    }
  } catch (error) {
    console.error("Error loading GeoJSON data:", error);
  }

  return (
    <BusinessInfoEditForm
      business={business}
      geoJsonData={geoJsonData}
      mapCities={mapCities}
      mapStates={mapStates}
      deliveryZonesFormatted={deliveryZonesFormatted}
    />
  );
}

const BusinessSettings = async ({
  params,
}: {
  params: { businessId: string };
}) => {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Fetch basic business info for the header
  const { data: businessInfo } = await supabase
    .from("provider_business")
    .select("business_name")
    .eq("id", params.businessId)
    .single();

  // Fetch users associated with this business
  const { data: businessUsers, error: businessUsersError } = await supabase
    .from("provider_business_users")
    .select(
      `*,
      users:user_id (
       *
      )
    `
    )
    .eq("business_id", params.businessId);

  if (businessUsersError) {
    console.error("Error fetching business users:", businessUsersError);
  }

  return (
    <main className="h-fit w-full md:max-w-2xl px-5 md:px-0 py-5 pb-14 lg:py-7 mx-auto">
      <PageHeader
        title="Ajustes de mi negocio"
        description={`Configura tu negocio ${
          businessInfo?.business_name || ""
        }.`}
      />
      <section className="w-full h-fit items-start justify-start flex flex-col gap-y-6">
        <Suspense fallback={<BusinessInfoSkeleton />}>
          <BusinessDataLoader businessId={params.businessId} />
        </Suspense>
        {/* <DeleteTableCard user={user} business={business} /> */}
      </section>
    </main>
  );
};

export default BusinessSettings;
