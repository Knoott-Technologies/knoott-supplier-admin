import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DeleteTableCard } from "./_components/delete-table-card";
import { PageHeader } from "@/components/universal/headers";
import { BusinessUsersCard } from "./_components/business-users-card";

const BusinessSettings = async ({
  params,
}: {
  params: { businessId: string };
}) => {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: business } = await supabase
    .from("provider_business")
    .select("*")
    .eq("id", params.businessId)
    .single();

  if (!business) {
    redirect("/");
  }

  // Fetch users associated with this business
  const { data: businessUsers, error: businessUsersError } = await supabase
    .from("provider_business_users")
    .select(
      `*,
      users:user_id (
       *
      )
    `
    )
    .eq("business_id", params.businessId);

  if (businessUsersError) {
    console.error("Error fetching business users:", businessUsersError);
  }

  return (
    <main className="h-fit w-full md:max-w-2xl px-5 md:px-0 py-5 pb-14 lg:py-7 mx-auto">
      <PageHeader
        title="Ajustes de mi negocio"
        description={`Configura tu negocio ${business.business_name}.`}
      />
      <section className="w-full h-fit items-start justify-start flex flex-col gap-y-6">
        <BusinessUsersCard
          businessUsers={businessUsers || []}
          business={business}
        />
        <DeleteTableCard user={user} business={business} />
      </section>
    </main>
  );
};

export default BusinessSettings;
