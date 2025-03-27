import { PageHeader } from "@/components/universal/headers";
import { DataTable } from "./_components/orders-table";
import { columns } from "./_components/columns";
import { createAdminClient } from "@/utils/supabase/admin";
import { FilterBar } from "./_components/filter-bar";

const OrdersPage = async ({
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
  const supabase = createAdminClient();

  // Get URL parameters with default values
  const page = parseInt(searchParams.page || "1", 10);
  const pageSize = parseInt(searchParams.pageSize || "100", 10); // 100 products per page as requested
  const status = searchParams.status || "";
  const startDate = searchParams.startDate || "";
  const endDate = searchParams.endDate || "";

  // Calculate range for Supabase
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Prepare base query
  let query = supabase
    .from("wedding_product_orders")
    .select(
      "*, address:wedding_addresses(*), client:users!wedding_product_orders_ordered_by_fkey(*), provider_shipped_user:users!wedding_product_orders_shipped_ordered_by_fkey(*), provider_user:users!wedding_product_orders_confirmed_by_fkey(*), product:wedding_products!wedding_product_orders_product_id_fkey(id, variant:products_variant_options(*), product_info:products(*, brand:catalog_brands(*), subcategory:catalog_collections(*)))",
      {
        count: "exact",
      }
    )
    .order("created_at", { ascending: false })
    .eq("provider_branch_id", params.branchId);

  // Apply status filter if exists
  if (status) {
    query = query.eq("status", status);
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
  const { data: orders, error } = await query
    .range(from, to)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    // You could handle the error here, for example, showing a message to the user
  }

  return (
    <main className="h-fit w-full md:max-w-[95%] px-3 md:px-0 py-5 pb-14 lg:py-7 mx-auto no-scrollbar">
      <PageHeader
        title="Órdenes"
        description="Visualiza y administra las órdenes de tus clientes."
      />

      <section className="w-full h-fit items-start justify-start flex flex-col gap-y-5 lg:gap-y-7">
        <div className="w-full h-fit items-start justify-start flex flex-col gap-y-4">
          <FilterBar />
          <DataTable
            columns={columns}
            pageSize={pageSize}
            data={orders || []}
            totalCount={count || 0}
            currentPage={page}
          />
        </div>
      </section>
    </main>
  );
};

export default OrdersPage;
