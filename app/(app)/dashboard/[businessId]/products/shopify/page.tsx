import { PageHeaderBackButton } from "@/components/universal/headers";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { ShopifyIntegrationForm } from "./_components/shopify-integration-form";
import { ShopifyConnectedStores } from "./_components/shopify-connected-stores";
import { ToastHandler } from "./_components/toast-handler";
import { ShopifySyncProducts } from "./_components/shopify-sync-products";

const ShopifyIntegration = async ({
  params,
  searchParams,
}: {
  params: { businessId: string };
  searchParams: { status?: string; message?: string };
}) => {
  const supabase = createClient(cookies());

  // Obtener las integraciones existentes
  const { data: integrations, error } = await supabase
    .from("shopify_integrations")
    .select("*")
    .eq("business_id", params.businessId)
    .neq("status", "disconnected")
    .order("created_at", { ascending: false })
    .single();

  return (
    <main className="h-fit w-full md:max-w-[95%] px-3 md:px-0 py-5 pb-14 lg:py-7 mx-auto no-scrollbar">
      {/* Toast handler component to display success/error messages */}
      <ToastHandler
        status={searchParams.status}
        message={searchParams.message}
      />

      <section className="mx-auto max-w-2xl">
        <PageHeaderBackButton
          title="Integración con Shopify"
          description="Conecta tu tienda con Shopify para sincronizar productos automáticamente."
        />

        <div className="w-full flex flex-col">
          {(integrations && (
            <div className="flex flex-col gap-y-5 lg:gap-y-7 items-center justify-center">
              <ShopifyConnectedStores
                integration={integrations}
                businessId={params.businessId}
              />
              <ShopifySyncProducts
                businessId={params.businessId}
                data={integrations}
              />
            </div>
          )) || (
            <div className="flex flex-col gap-y-5 lg:gap-y-7 items-center justify-center">
              <ShopifyIntegrationForm businessId={params.businessId} />
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default ShopifyIntegration;
