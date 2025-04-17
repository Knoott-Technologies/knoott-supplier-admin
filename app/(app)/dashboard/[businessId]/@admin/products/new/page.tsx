import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import ProductForm from "./_components/product-form";
import { PageHeaderBackButton } from "@/components/universal/headers";

export default async function NewProductPage({
  params,
}: {
  params: { businessId: string };
}) {
  const supabase = createClient(cookies());

  const { data: business, error: businessError } = await supabase
    .from("provider_business")
    .select("*")
    .eq("id", params.businessId)
    .single();

  // Fetch brands
  const { data: brands } = await supabase
    .from("catalog_brands")
    .select("*")
    .order("name");

  // Fetch categories
  const { data: categories } = await supabase
    .from("catalog_collections")
    .select("*")
    .order("name");

  return (
    <main className="h-fit w-full mx-auto no-scrollbar">
      <div className="w-full max-w-5xl mx-auto px-3 md:px-0 pt-5 lg:pt-7">
        <PageHeaderBackButton
          title="Nuevo producto"
          description="Agrega un nuevo producto a tu catálogo."
        />
      </div>
      <ProductForm
        business={business}
        businessId={params.businessId}
        brands={brands || []}
        categories={categories || []}
      />
    </main>
  );
}
