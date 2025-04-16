import { PageHeaderBackButton } from "@/components/universal/headers";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ShopifyIntegrationForm } from "./_components/shopify-integration-form";
import { ShopifyConnectedStores } from "./_components/shopify-connected-stores";

const ShopifyIntegration = async ({
  params,
}: {
  params: { businessId: string };
}) => {
  const supabase = createClient(cookies());

  // Obtener las integraciones existentes
  const { data: integrations } = await supabase
    .from("shopify_integrations")
    .select("*")
    .eq("business_id", params.businessId)
    .neq("status", "disconnected")
    .order("created_at", { ascending: false });

  return (
    <main className="h-fit w-full md:max-w-[95%] px-3 md:px-0 py-5 pb-14 lg:py-7 mx-auto no-scrollbar">
      <section className="mx-auto max-w-2xl">
        <PageHeaderBackButton
          title="Integración con Shopify"
          description="Conecta tu tienda con Shopify para sincronizar productos automáticamente."
        />

        <div className="mt-8 space-y-8">
          <div className="flex flex-col gap-y-2 items-center justify-center">
            <ShopifyIntegrationForm businessId={params.businessId} />
            <p className="text-xs text-muted-foreground max-w-md mx-auto text-center">
              Al conectar tu tienda, podrás sincronizar automáticamente tus
              productos de Shopify con nuestra plataforma.
            </p>
          </div>

          {integrations && integrations.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Tiendas conectadas</h2>
              <ShopifyConnectedStores
                integrations={integrations}
                businessId={params.businessId}
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default ShopifyIntegration;
