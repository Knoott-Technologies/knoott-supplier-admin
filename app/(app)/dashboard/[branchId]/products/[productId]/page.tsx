import { Button } from "@/components/ui/button";
import {
  PageHeader,
  PageHeaderBackButton,
} from "@/components/universal/headers";
import { createClient } from "@/utils/supabase/server";
import { Pen } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductActions } from "./_components/product-actions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ProductImageCarousel } from "./_components/product-image-carousel";

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

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "draft":
        return "Borrador";
      case "active":
        return "Activo";
      case "archived":
        return "Archivado";
      case "requires_verification":
        return "En revisión";
      case "deleted":
        return "Eliminado";
      default:
        return status;
    }
  };

  return (
    <main className="h-fit w-full md:max-w-[95%] px-3 md:px-0 py-5 pb-14 lg:py-7 mx-auto no-scrollbar">
      <PageHeaderBackButton
        title={product.short_name}
        description={product.short_description}
      >
        <div className="flex gap-x-1 items-center justify-end">
          <div
            className={cn(
              "px-2 h-7 text-sm flex items-center justify-center",
              product.status === "draft" &&
                "bg-primary/20 text-amber-800 hover:bg-primary/10",
              product.status === "active" &&
                "bg-success/20 text-success hover:bg-success/10",
              product.status === "archived" &&
                "bg-muted text-foreground border",
              product.status === "requires_verification" &&
                "bg-background text-muted-foreground border-border hover:bg-background/90 hover:text-muted-foreground",
              product.status === "deleted" &&
                "bg-destructive/20 text-destructive hover:bg-destructive/10"
            )}
          >
            {getStatusLabel(product.status)}
          </div>
          <ProductActions branchId={params.branchId} product={product} />
        </div>
      </PageHeaderBackButton>
      <section className="w-full flex flex-col items-start justify-start gap-y-5 lg:gap-y-7">
        <div className="w-full h-fit grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-5 lg:gap-7">
          <ProductImageCarousel images={product.images_url} />
        </div>
      </section>
    </main>
  );
};

export default ProductPage;
