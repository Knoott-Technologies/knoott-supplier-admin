import { PageHeader } from "@/components/universal/headers";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { columns } from "./_components/columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight, Plus, Webhook } from "lucide-react";
import { DataTable } from "./_components/products-table";
import { FilterBar } from "./_components/filter-bar";
import { ProductCrawler } from "./_components/product-crawler";

const ProductsPage = async ({
  params,
  searchParams,
}: {
  params: { branchId: string };
  searchParams: {
    page?: string;
    pageSize?: string;
    search?: string;
    status?: string;
    brandId?: string;
    subcategoryId?: string;
    startDate?: string;
    endDate?: string;
    showTrash?: string;
  };
}) => {
  const supabase = createClient(cookies());

  // Get URL parameters with default values
  const page = parseInt(searchParams.page || "1", 10);
  const pageSize = parseInt(searchParams.pageSize || "20", 10); // 
  const search = searchParams.search || "";
  const status = searchParams.status || "";
  const brandId = searchParams.brandId || "";
  const subcategoryId = searchParams.subcategoryId || "";
  const startDate = searchParams.startDate || "";
  const endDate = searchParams.endDate || "";
  const showTrash = searchParams.showTrash || false;

  // Calculate range for Supabase
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Prepare base query
  let query = supabase
    .from("products")
    .select("*, brand:catalog_brands(*), subcategory:catalog_collections(*)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .eq("provider_branch_id", params.branchId);

  // Apply search filter if exists
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,short_name.ilike.%${search}%,description.ilike.%${search}%,short_description.ilike.%${search}%`
    );
  }

  // Apply status filter if exists
  if (status) {
    query = query.eq("status", status);
  }

  // Apply brand filter if exists
  if (brandId) {
    query = query.eq("brand_id", brandId);
  }

  // Apply subcategory filter if exists
  if (subcategoryId) {
    query = query.eq("subcategory_id", subcategoryId);
  }

  // Apply date range filter if exists
  if (startDate) {
    query = query.gte("created_at", `${startDate}T00:00:00Z`);
  }

  if (endDate) {
    query = query.lte("created_at", `${endDate}T23:59:59Z`);
  }

  if (showTrash === "true") {
    query = query.in("status", ["deleted", "archived"]);
  } else {
    query = query.in("status", ["draft", "active", "requires_verification"]);
  }

  // First get total count for pagination
  const { count } = await query;

  // Then get paginated data
  const { data: products, error } = await query
    .range(from, to)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    // You could handle the error here, for example, showing a message to the user
  }

  // Fetch all brands for filter
  const { data: brands } = await supabase
    .from("catalog_brands")
    .select("id, name")
    .order("name");

  // Fetch all subcategories for filter
  const { data: subcategories } = await supabase
    .from("catalog_collections")
    .select("id, name")
    .order("name")
    .eq("level", 2);

  return (
    <>
      <Link
        href={`/dashboard/${params.branchId}/products/api-integration`}
        className="bg-background sticky top-12 z-20 border-b w-full"
      >
        <div className="bg-contrast/10 p-3 md:px-0 sticky top-0 z-10 text-contrast w-full">
          <div className="flex justify-between items-center gap-2 md:max-w-[95%] mx-auto">
            <div className="flex grow gap-3">
              <Webhook className="mt-0.5 shrink-0 size-4" aria-hidden="true" />
              <div className="flex grow justify-between gap-2 items-center">
                <span className="flex flex-col items-start justify-start gap-y-0">
                  <h3 className="text-sm font-semibold">
                    Sincroniza tu catálogo automáticamente
                  </h3>
                  <p className="text-xs">
                    Conecta tu API y mantén tus productos siempre actualizados
                    en Knoott sin esfuerzo manual.
                  </p>
                </span>
              </div>
            </div>
            <ChevronRight className="size-4" />
          </div>
        </div>
      </Link>
      <main className="h-fit w-full md:max-w-[95%] px-3 md:px-0 py-5 pb-14 lg:py-7 mx-auto no-scrollbar">
        <PageHeader
          title="Productos"
          description="Administra todo tu catálogo desde un solo lugar. Agrega, edita o elimina productos según las necesidades de tu tienda."
        >
          <Button
            variant={"defaultBlack"}
            className="hidden lg:flex"
            size={"default"}
            asChild
          >
            <Link
              href={`/dashboard/${params.branchId}/products/new/general-info`}
            >
              Agregar producto <Plus />
            </Link>
          </Button>
          <Button
            variant={"defaultBlack"}
            className="lg:hidden flex"
            size={"icon"}
            asChild
          >
            <Link
              href={`/dashboard/${params.branchId}/products/new/general-info`}
            >
              <Plus />
            </Link>
          </Button>
        </PageHeader>

        <section className="w-full h-fit items-start justify-start flex flex-col gap-y-5 lg:gap-y-7">
          <div className="w-full h-fit items-start justify-start flex flex-col gap-y-4">
            <FilterBar
              brands={brands || []}
              subcategories={subcategories || []}
            />

            <DataTable
              columns={columns}
              data={products || []}
              totalCount={count || 0}
              pageSize={pageSize}
              currentPage={page}
            />
          </div>
        </section>
      </main>
    </>
  );
};

export default ProductsPage;
