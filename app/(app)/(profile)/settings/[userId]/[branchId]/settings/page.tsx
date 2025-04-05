import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DeleteTableCard } from "./_components/delete-table-card";
import { PageHeader } from "@/components/universal/headers";
import { BranchUsersCard } from "./_components/branch-users-card";

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

  // Fetch users associated with this branch
  const { data: branchUsers, error: branchUsersError } = await supabase
    .from("user_provider_branches")
    .select(
      `*,
      users:user_id (
       *
      )
    `
    )
    .eq("provider_id", params.branchId);

  if (branchUsersError) {
    console.error("Error fetching branch users:", branchUsersError);
  }

  return (
    <main className="h-fit w-full md:max-w-2xl px-5 md:px-0 py-5 pb-14 lg:py-7 mx-auto">
      <PageHeader
        title="Ajustes de mi tienda"
        description={`Configura tu tienda ${branch.branch_name}.`}
      />
      <section className="w-full h-fit items-start justify-start flex flex-col gap-y-6">
        <BranchUsersCard branchUsers={branchUsers || []} branch={branch} />
        <DeleteTableCard user={user} branch={branch} />
      </section>
    </main>
  );
};

export default WeddingSettings;
