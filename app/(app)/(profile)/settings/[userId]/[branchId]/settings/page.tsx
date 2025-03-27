import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DeleteTableCard } from "./_components/delete-table-card";
import { WeddingAddressesCard } from "./_components/wedding-addresses-card";
import { PageHeader } from "@/components/universal/headers";

const WeddingSettings = async ({
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

  const { data: branch } = await supabase
    .from("provider_branches")
    .select("*")
    .eq("id", params.branchId)
    .single();

  if (!branch) {
    redirect("/");
  }

  return (
    <main className="h-fit w-full md:max-w-2xl px-5 md:px-0 py-5 pb-14 lg:py-7 mx-auto">
      <PageHeader
        title="Ajustes de mi tienda"
        description={`Configura tu tienda ${branch.branch_name}.`}
      />
      <section className="w-full h-fit items-start justify-start flex flex-col gap-y-6">
        <DeleteTableCard user={user} branch={branch} />
      </section>
    </main>
  );
};

export default WeddingSettings;
