import { PageHeader } from "@/components/platform/headers";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { HistoryPurchase } from "./_components/history-purchase";

const HistoryPage = async ({ params }: { params: { userId: string } }) => {
  const supabase = createClient(cookies());

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", params.userId)
    .single();

  if (error || !user) {
    return null;
  }

  const { data: userLong } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!userLong) {
    return null;
  }

  const { data: paymentIntents, error: paymentIntentsError } = await supabase
    .from("payment_intents")
    .select("*, wedding:weddings(name)")
    .eq("user_id", user.id)
    .eq("status", "succeeded")
    .order("created_at", { ascending: false });

  return (
    <main className="h-fit w-full md:max-w-2xl px-5 md:px-0 py-5 pb-14 lg:py-7 mx-auto">
      <PageHeader
        title="Historial de compras"
        description={`Aquí podrás ver tu historial de compras dentro de Knoott.`}
      />
      <section className="w-full h-fit items-start justify-start flex flex-col gap-y-6">
        <HistoryPurchase
          paymentIntents={paymentIntents || []}
          user={userLong}
        />
      </section>
    </main>
  );
};

export default HistoryPage;
