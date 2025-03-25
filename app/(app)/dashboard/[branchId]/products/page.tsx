import { PageHeader } from "@/components/universal/headers";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { columns } from "./_components/columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DataTable } from "./_components/products-table";
import { FilterBar } from "./_components/filter-bar";
import { ExcelImportDialog } from "./_components/excel-import-dialog";

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
  };
}) => {
  const supabase = createClient(cookies());

  // Get URL parameters with default values
  const page = Number.parseInt(searchParams.page || "1", 10);
  const pageSize = Number.parseInt(searchParams.pageSize || "100", 10); // 100 products per page as requested
  const search = searchParams.search || "";
  const status = searchParams.status || "";
  const brandId = searchParams.brandId || "";
  const subcategoryId = searchParams.subcategoryId || "";
  const startDate = searchParams.startDate || "";
  const endDate = searchParams.endDate || "";

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
    <main className="h-fit w-full md:max-w-[95%] px-3 md:px-0 py-5 pb-14 lg:py-7 mx-auto no-scrollbar">
      <PageHeader
        title="Productos"
        description="Gestiona tus productos, agrega, edita y elimina los productos de tu negocio"
      >
        <div className="flex gap-2">
          {/* Excel Import Dialog */}
          <div className="hidden lg:block">
            <ExcelImportDialog branchId={params.branchId} />
          </div>

          <Button
            variant={"defaultBlack"}
            className="hidden lg:flex"
            size={"default"}
            asChild
          >
            <Link
              href={`/dashboard/${params.branchId}/products/new/general-info`}
            >
              Agregar Producto <Plus className="ml-2 h-4 w-4" />
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
        </div>
      </PageHeader>
      <section className="w-full h-fit items-start justify-start flex flex-col gap-y-5 lg:gap-y-7">
        <div className="w-full h-fit items-start justify-start flex flex-col gap-y-4">
          {/* Filter bar component with Excel import for mobile */}
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <FilterBar
              brands={brands || []}
              subcategories={subcategories || []}
            />
            <div className="lg:hidden">
              <ExcelImportDialog branchId={params.branchId} />
            </div>
          </div>

          {/* Data table component */}
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
  );
};

export default ProductsPage;
