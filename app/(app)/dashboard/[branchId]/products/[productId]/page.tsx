import { PageHeaderBackButton } from "@/components/universal/headers";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ProductActions } from "./_components/product-actions";
import { ProductImageCarousel } from "./_components/product-image-carousel";
import { ProductInfo } from "./_components/product-info";
import { ProductStats } from "./_components/product-stats";

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

  return (
    <main className="h-fit w-full md:max-w-[95%] px-3 md:px-0 py-5 pb-14 lg:py-7 mx-auto no-scrollbar">
      <PageHeaderBackButton
        title={product.short_name}
        description={product.short_description}
      >
        <div className="flex gap-x-1 items-center justify-end">
          <ProductActions branchId={params.branchId} product={product} />
        </div>
      </PageHeaderBackButton>
      <section className="w-full flex flex-col items-start justify-start gap-y-5 lg:gap-y-7">
        <ProductStats product={product} />
        <div className="w-full h-fit grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-5 lg:gap-7">
          <ProductImageCarousel images={product.images_url} />
          <ProductInfo product={product} />
        </div>
      </section>
    </main>
  );
};

export default ProductPage;
