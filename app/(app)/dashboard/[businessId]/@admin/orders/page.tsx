import { PageHeader } from "@/components/universal/headers";
import { FilterBar } from "./_components/filter-bar";
import { OrdersSummary } from "./_components/orders-summary";
import { OrdersTable } from "./_components/orders-table";
import { OrdersAlerts } from "./_components/orders-alert";
import { Database } from "@/database.types";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export type Order =
  Database["public"]["Tables"]["wedding_product_orders"]["Row"] & {
    address: Database["public"]["Tables"]["wedding_addresses"]["Row"];
    client: Database["public"]["Tables"]["users"]["Row"];
    provider_user: Database["public"]["Tables"]["users"]["Row"];
    provider_shipped_user: Database["public"]["Tables"]["users"]["Row"];
    product: Database["public"]["Tables"]["wedding_products"]["Row"] & {
      variant: Database["public"]["Tables"]["products_variant_options"]["Row"] & {
        variant_list: Database["public"]["Tables"]["products_variants"]["Row"];
      };
      product_info: Database["public"]["Tables"]["products"]["Row"] & {
        brand: Database["public"]["Tables"]["catalog_brands"]["Row"];
        subcategory: Database["public"]["Tables"]["catalog_collections"]["Row"];
      };
    };
  };

const OrdersPage = async ({
  params,
  searchParams,
}: {
  params: { businessId: string };
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
  const page = Number.parseInt(searchParams.page || "1", 10);
  const pageSize = Number.parseInt(searchParams.pageSize || "100", 10);
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
      "*, address:wedding_addresses(*), client:users!wedding_product_orders_ordered_by_fkey(*), provider_shipped_user:users!wedding_product_orders_shipped_ordered_by_fkey(*), provider_user:users!wedding_product_orders_confirmed_by_fkey(*), product:wedding_products!wedding_product_orders_product_id_fkey(id, variant:products_variant_options(*, variant_list:products_variants(*)), product_info:products(*, brand:catalog_brands(*), subcategory:catalog_collections(*)))",
      {
        count: "exact",
      }
    )
    .order("created_at", { ascending: false })
    .eq("provider_business_id", params.businessId);

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
    console.error("Error fetching orders:", error);
  }

  // Get all orders for summary stats (without pagination)
  const { data: allOrders, error: allOrdersError } = await supabase
    .from("wedding_product_orders")
    .select("*")
    .eq("provider_business_id", params.businessId);

  if (allOrdersError) {
    console.error("Error fetching all orders:", allOrdersError);
  }

  return (
    <>
      <OrdersAlerts orders={allOrders || []} />
      <main className="h-fit w-full md:max-w-[95%] px-3 md:px-0 py-5 pb-14 lg:py-7 mx-auto no-scrollbar z-0">
        <PageHeader
          title="Órdenes"
          description="Consulta, gestiona y da seguimiento a las órdenes generadas por tus clientes. Mantente al tanto del estado de cada pedido en tiempo real."
        />

        <section className="w-full h-fit items-start justify-start flex flex-col gap-y-5 lg:gap-y-7">
          {/* Summary Cards */}
          <OrdersSummary
            businessId={params.businessId}
            orders={allOrders || []}
          />

          <div className="w-full h-fit items-start justify-start flex flex-col gap-y-4">
            <FilterBar />
            <OrdersTable
              orders={orders || []}
              totalCount={count || 0}
              currentPage={page}
              pageSize={pageSize}
            />
          </div>
        </section>
      </main>
    </>
  );
};

export default OrdersPage;
