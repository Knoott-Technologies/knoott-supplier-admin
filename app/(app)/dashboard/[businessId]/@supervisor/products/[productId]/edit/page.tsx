import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { PageHeaderBackButton } from "@/components/universal/headers";
import ProductFormEdit from "./_components/product-form-edit";

export default async function ProductEditPage({
  params,
}: {
  params: { productId: string; businessId: string };
}) {
  const supabase = createClient(cookies());

  // Fetch the product data
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.productId)
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    // You might want to handle this error differently
  }

  // Fetch brands
  const { data: brands } = await supabase
    .from("catalog_brands")
    .select("*")
    .order("name")
    .eq("status", "active");

  // Fetch categories
  const { data: categories } = await supabase
    .from("catalog_collections")
    .select("*")
    .order("name")
    .eq("status", "active");

  // Fetch product variants - Corregido el nombre de la tabla
  const { data: variants } = await supabase
    .from("products_variants") // Corregido: product_variants → products_variants
    .select("*")
    .eq("product_id", params.productId);

  // Fetch variant options - Corregido el nombre de la tabla y la consulta
  const { data: variantOptions } = await supabase
    .from("products_variant_options") // Corregido: product_variant_options → products_variant_options
    .select("*")
    .in("variant_id", variants?.map((v) => v.id) || []); // Corregido: consulta por variant_id en lugar de product_id

  const { data: commision } = await supabase
    .from("provider_business")
    .select("accorded_commission")
    .eq("id", params.businessId)
    .single();

  return (
    <main className="h-fit w-full mx-auto no-scrollbar">
      <div className="w-full max-w-5xl mx-auto px-3 md:px-0 pt-5 lg:pt-7">
        <PageHeaderBackButton
          title="Editar producto"
          description="Actualiza la información de tu producto."
        />
      </div>
      <ProductFormEdit
        commision={commision?.accorded_commission || 0.058}
        product={product}
        variants={variants || []}
        variantOptions={variantOptions || []}
        brands={brands || []}
        categories={categories || []}
      />
    </main>
  );
}
