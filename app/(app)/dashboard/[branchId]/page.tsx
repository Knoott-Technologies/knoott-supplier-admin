import { PageHeaderWithLogo } from "@/components/universal/headers";
import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TransactionChart from "./_components/transaction-chart";
import DateRangeSelector from "./_components/date-range-selector";
import { startOfWeek, endOfWeek, format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { TotalTransactionsCard } from "./_components/total-received-card";
import { TotalTransactionsNumber } from "./_components/total-transactions";
import { TotalProductsCard } from "./_components/total-products-card";

export const metadata: Metadata = {
  title: "Vista general",
  description:
    "Esta es tu vista general, aqui podrás ver la información mas relevante de tu negocio.",
};

const ProviderBranchDashboardPage = async ({
  params,
  searchParams,
}: {
  params: { branchId: string };
  searchParams: { fromDate?: string; toDate?: string };
}) => {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: branch, error } = await supabase
    .from("provider_branches")
    .select("*, business:provider_business(*)")
    .eq("id", params.branchId)
    .single();

  if (!branch || error) {
    redirect("/");
  }

  const { count: totalProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("provider_branch_id", params.branchId);

  const { count: totalTransactions } = await supabase
    .from("provider_branches_transactions")
    .select("*", { count: "exact", head: true })
    .eq("provider_branch_id", params.branchId);

  // Obtener las fechas desde los searchParams o usar valores predeterminados
  let fromDate, toDate;

  try {
    if (searchParams.fromDate && searchParams.toDate) {
      fromDate = parse(searchParams.fromDate, "yyyy-MM-dd", new Date());
      toDate = parse(searchParams.toDate, "yyyy-MM-dd", new Date());
    } else {
      fromDate = startOfWeek(new Date(), { locale: es });
      toDate = endOfWeek(new Date(), { locale: es });
    }
  } catch (e) {
    // Si hay error en el formato, usar fechas predeterminadas
    fromDate = startOfWeek(new Date(), { locale: es });
    toDate = endOfWeek(new Date(), { locale: es });
  }

  // Formatear para la consulta de Supabase (ISO string)
  const fromDateStr = format(fromDate, "yyyy-MM-dd'T00:00:00Z'");
  const toDateStr = format(toDate, "yyyy-MM-dd'T23:59:59Z'");

  // Consultar transacciones con filtro de fecha
  const { data: transactions } = await supabase
    .from("provider_branches_transactions")
    .select("*")
    .eq("provider_branch_id", params.branchId)
    .gte("created_at", fromDateStr)
    .lte("created_at", toDateStr)
    .order("created_at", { ascending: false });

  return (
    <main className="h-fit w-full md:max-w-[95%] px-3 md:px-0 py-5 pb-14 lg:py-7 mx-auto no-scrollbar">
      <PageHeaderWithLogo
        logo={branch.business.business_logo_url}
        title={branch.branch_name}
        description="Esta es tu vista general, aqui podrás ver la información mas relevante de tu negocio."
      >
        <DateRangeSelector />
      </PageHeaderWithLogo>

      <section className="w-full h-fit items-start justify-start flex flex-col gap-y-5 lg:gap-y-7">
        <div className="w-full h-fit grid grid-cols-1 md:grid-cols-1 xl:grid-cols-3 gap-4">
          <TotalTransactionsCard branch={branch} transactions={transactions} />
          <TotalTransactionsNumber total={totalTransactions} />
          <TotalProductsCard total={totalProducts} />
        </div>
        <TransactionChart data={transactions} />
      </section>
    </main>
  );
};

export default ProviderBranchDashboardPage;
