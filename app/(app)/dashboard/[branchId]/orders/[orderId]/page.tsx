import { PageHeaderBackButton } from "@/components/universal/headers";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { StepperTimeline } from "../_components/stepper-timeline";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartNoAxesGantt, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OrderStats } from "./_components/order-stats";
import { OrderInfo } from "./_components/order-info";
import { OrderTimeline } from "./_components/order-timeline";
import { OrderActions } from "./_components/order-actions";

const ProductPage = async ({
  params,
}: {
  params: { orderId: string; branchId: string };
}) => {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: order, error } = await supabase
    .from("wedding_product_orders")
    .select(
      "*, address:wedding_addresses(*), client:users!wedding_product_orders_ordered_by_fkey(*), provider_shipped_user:users!wedding_product_orders_shipped_ordered_by_fkey(*), provider_user:users!wedding_product_orders_confirmed_by_fkey(*), product:wedding_products!wedding_product_orders_product_id_fkey(id, variant:products_variant_options(*, variant_list:products_variants(*)), product_info:products(*, brand:catalog_brands(*), subcategory:catalog_collections(*)))"
    )
    .eq("id", params.orderId)
    .single();

  if (!order || error) {
    redirect(`/dashboard/${params.orderId}/orders`);
  }

  return (
    <>
      <main className="w-full md:max-w-[95%] px-3 md:px-0 py-5 pb-14 lg:py-7 mx-auto no-scrollbar min-h-[calc(100vh_-_56px]">
        <PageHeaderBackButton
          title={<>Orden #{order.id}</>}
          description={
            "Revisa todos los detalles de la orden y realiza acciones disponibles."
          }
        />
        <section className="w-full flex flex-col items-start justify-start gap-y-5 lg:gap-y-7">
          <OrderStats order={order} />
          <div className="grid gap-5 lg:gap-7 items-start justify-start grid-cols-1 xl:grid-cols-[2fr_1fr] 2xl:grid-cols-[2.5fr_1fr] w-full">
            <OrderInfo order={order} />
            <OrderTimeline order={order} />
          </div>
        </section>
      </main>
      <OrderActions user={user} branchId={params.branchId} order={order} />
    </>
  );
};

export default ProductPage;
