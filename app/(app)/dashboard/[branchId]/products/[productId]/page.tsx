import { PageHeaderLinkButton } from "@/components/universal/headers";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ProductActions } from "./_components/product-actions";
import { ProductImageCarousel } from "./_components/product-image-carousel";
import { ProductInfo } from "./_components/product-info";
import { ProductStats } from "./_components/product-stats";
import { Database } from "@/database.types";
import { ProductVariantInfo } from "./_components/product-variants-info";

// Define types for better type safety
type Variant = Database["public"]["Tables"]["products_variants"]["Row"];

type VariantOption =
  Database["public"]["Tables"]["products_variant_options"]["Row"] & {
    variant: Variant;
  };

export type GroupedVariant = {
  variant: Variant;
  options: Omit<VariantOption, "variant">[];
};

const ProductPage = async ({
  params,
}: {
  params: { productId: string; branchId: string };
}) => {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: product, error } = await supabase
    .from("products")
    .select("*, brand:catalog_brands(*), subcategory:catalog_collections(*)")
    .eq("id", params.productId)
    .single();

  if (!product || error) {
    redirect(`/dashboard/${params.branchId}/products`);
  }

  const { data: variantOptions, error: variantsError } = await supabase
    .from("products_variant_options")
    .select("*, variant:products_variants!inner(*)")
    .eq("variant.product_id", params.productId);

  // Group variant options by variant
  const groupedVariants: GroupedVariant[] = [];

  if (variantOptions && !variantsError) {
    // Create a map to store variants and their options
    const variantMap = new Map<number, GroupedVariant>();

    // Process each variant option
    variantOptions.forEach((option: VariantOption) => {
      const variantId = option.variant.id;

      // If this variant hasn't been processed yet, add it to the map
      if (!variantMap.has(variantId)) {
        variantMap.set(variantId, {
          variant: option.variant,
          options: [],
        });
      }

      // Add the option to the variant's options array (without the variant property)
      const { variant, ...optionWithoutVariant } = option;
      variantMap.get(variantId)?.options.push(optionWithoutVariant);
    });

    // Convert the map to an array and sort by variant position
    groupedVariants.push(
      ...Array.from(variantMap.values()).sort(
        (a, b) => a.variant.position - b.variant.position
      )
    );

    // Sort options within each variant by position
    groupedVariants.forEach((group) => {
      group.options.sort((a, b) => a.position - b.position);
    });
  }

  console.log("Grouped variants:", JSON.stringify(groupedVariants, null, 2));

  return (
    <main className="h-fit w-full md:max-w-[95%] px-3 md:px-0 py-5 pb-14 lg:py-7 mx-auto no-scrollbar">
      <PageHeaderLinkButton
        title={product.short_name}
        description={product.short_description}
        href={`/dashboard/${params.branchId}/products`}
      >
        <div className="flex gap-x-1 items-center justify-end">
          <ProductActions branchId={params.branchId} product={product} />
        </div>
      </PageHeaderLinkButton>
      <section className="w-full flex flex-col items-start justify-start gap-y-5 lg:gap-y-7">
        <ProductStats product={product} />
        <div className="w-full h-fit grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-5 lg:gap-7">
          <ProductImageCarousel images={product.images_url} />
          <div className="w-full h-fit items-start justify-start flex flex-col gap-y-5 lg:gap-y-7">
            <ProductInfo product={product} />
            <ProductVariantInfo
              branchId={params.branchId}
              variants={groupedVariants}
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProductPage;
