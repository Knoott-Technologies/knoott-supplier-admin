import { PageHeader } from "@/components/universal/headers";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const TransactionPage = async ({
  params,
}: {
  params: { branchId: string };
}) => {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/");
  }

  const { data: transactions, error } = await supabase
    .from("provider_branches_transactions")
    .select("*")
    .eq("provider_branch_id", params.branchId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching transactions:", error);
    return <div>Error fetching transactions</div>;
  }

  if (!transactions) {
    return <div>No transactions found</div>;
  }

  return (
    <main className="h-fit w-full md:max-w-[95%] px-3 md:px-0 py-5 pb-14 lg:py-7 mx-auto no-scrollbar">
      <PageHeader
        title={"Transacciones de la sucursal"}
        description="Aquí puedes ver todas las transacciones realizadas en esta sucursal."
      />
      <section className="w-full h-fit items-start justify-start flex flex-col gap-y-5 lg:gap-y-7">
        <DataTable columns={columns} data={[]} />
      </section>
    </main>
  );
};

export default TransactionPage;
