import { PageHeader } from "@/components/universal/headers";
import { Database } from "@/database.types";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";

export type User =
  Database["public"]["Tables"]["provider_business_users"]["Row"] & {
    user: Database["public"]["Tables"]["users"]["Row"];
  };

const OrdersPage = async ({ params }: { params: { businessId: string } }) => {
  const supabase = createClient(cookies());

  const { data: users } = await supabase
    .from("provider_business_users")
    .select("*, user:users(*)")
    .eq("business_id", params.businessId);

  return (
    <main className="h-fit w-full md:max-w-[95%] px-3 md:px-0 py-5 pb-14 lg:py-7 mx-auto no-scrollbar z-0">
      <PageHeader
        title="Usuarios"
        description="Consulta y gestiona los usuarios que tienen acceso a tu negocio en Knoott Partners."
      />
      <section className="w-full h-fit items-start justify-start flex flex-col gap-y-5 lg:gap-y-7">
        <DataTable data={users || []} columns={columns} />
      </section>
    </main>
  );
};

export default OrdersPage;
