import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { PageHeaderBackButton } from "@/components/universal/headers";
import ProductFormEdit from "../../../../@admin/products/[productId]/edit/_components/product-form-edit";

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

  // Fetch product variants
  const { data: variants } = await supabase
    .from("products_variants")
    .select("*")
    .eq("product_id", params.productId);

  // Fetch variant options only if we have variants
  let variantOptions: any[] = [];
  if (variants && variants.length > 0) {
    const { data: options } = await supabase
      .from("products_variant_options")
      .select("*")
      .in(
        "variant_id",
        variants.map((v) => v.id)
      );
    variantOptions = options || [];
  }

  const { data: commission } = await supabase
    .from("provider_business")
    .select("accorded_commission")
    .eq("id", params.businessId)
    .single();

  // Determine if product has real variants (not just default)
  const hasRealVariants =
    variants &&
    variants.length > 0 &&
    !(
      variants.length === 1 &&
      variants[0].name === "Default" &&
      variantOptions.length === 1 &&
      variantOptions[0]?.name === "Default"
    );

  // Process single product data from default variant if no real variants
  let singleProductData = {};
  if (!hasRealVariants && variantOptions.length > 0) {
    const defaultOption = variantOptions[0];
    singleProductData = {
      single_price: defaultOption.price,
      single_stock: defaultOption.stock,
      single_sku: defaultOption.sku,
      single_commission: defaultOption.accorded_commission,
    };
  }

  return (
    <main className="h-fit w-full mx-auto no-scrollbar">
      <div className="w-full max-w-5xl mx-auto px-3 md:px-0 pt-5 lg:pt-7">
        <PageHeaderBackButton
          title="Editar producto"
          description="Actualiza la información de tu producto."
        />
      </div>
      <ProductFormEdit
        commission={commission?.accorded_commission || 0.058}
        product={{
          ...product,
          ...singleProductData,
          hasVariants: hasRealVariants,
        }}
        variants={variants || []}
        variantOptions={variantOptions || []}
        brands={brands || []}
        categories={categories || []}
      />
    </main>
  );
}
