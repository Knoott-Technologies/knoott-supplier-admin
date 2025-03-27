import { PageHeaderBackButton } from "@/components/universal/headers";
import { ApiIntegrationForm } from "./_components/api-integration-form";
import { cookies } from "next/headers";

export default async function ApiIntegrationPage({
  params,
}: {
  params: { branchId: string };
}) {
  // Obtener la configuración existente usando la API route que ya tienes
  // Esta API ya maneja la desencriptación de las claves
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/branches/${params.branchId}/api-integration`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Incluir cookies para autenticación si es necesario
        Cookie: cookies().toString(),
      },
      // Asegurar que se envían las cookies y se respeta la autenticación
      credentials: "include",
      // Evitar caché para siempre obtener datos actualizados
      cache: "no-store",
    }
  );

  if (!response.ok) {
    console.error("Error fetching API integration:", response.statusText);
  }

  const { data } = await response.json();

  // Formatear additional_params para el formulario si existe
  let configData = data;
  if (data && data.additional_params) {
    try {
      configData = {
        ...data,
        additional_params: JSON.stringify(data.additional_params, null, 2),
      };
    } catch (e) {
      console.error("Error parsing additional_params:", e);
    }
  }

  return (
    <main className="h-fit w-full md:max-w-2xl px-3 md:px-0 py-5 pb-14 lg:py-7 mx-auto no-scrollbar">
      <PageHeaderBackButton
        title="Integración de API"
        description="Configura la integración con APIs externas para sincronizar productos automáticamente"
      />
      <ApiIntegrationForm branchId={params.branchId} initialData={configData} />
    </main>
  );
}
