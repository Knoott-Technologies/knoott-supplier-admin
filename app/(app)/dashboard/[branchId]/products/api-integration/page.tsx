import { PageHeader } from "@/components/universal/headers";
import { ApiIntegrationForm } from "./_components/api-integration-form";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { ProductCrawler } from "@/components/universal/product-crawler";

export default async function ApiIntegrationPage({
  params,
}: {
  params: { branchId: string };
}) {
  const supabase = createClient(cookies());

  // Obtener la configuración existente
  const { data, error } = await supabase
    .from("api_integrations")
    .select("*")
    .eq("provider_branch_id", params.branchId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching API integration:", error);
  }

  // Si hay datos, desencriptar las claves API
  let configData = data;
  if (data) {
    // Nota: La desencriptación se maneja en el servidor a través de la API
    // para mantener seguras las claves

    // Formatear additional_params para el formulario si existe
    if (data.additional_params) {
      try {
        configData = {
          ...data,
          additional_params: JSON.stringify(data.additional_params, null, 2),
        };
      } catch (e) {
        console.error("Error parsing additional_params:", e);
      }
    }
  }

  return (
    <main className="h-fit w-full md:max-w-2xl px-3 md:px-0 py-5 pb-14 lg:py-7 mx-auto no-scrollbar">
      <PageHeader
        title="Integración de API"
        description="Configura la integración con APIs externas para sincronizar productos automáticamente"
      />
      <ApiIntegrationForm branchId={params.branchId} initialData={configData} />
      <ProductCrawler />
    </main>
  );
}
