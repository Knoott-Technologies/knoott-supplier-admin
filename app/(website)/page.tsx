import { createClient } from "@/utils/supabase/server";
import { HeroSuppliers } from "./_components/hero-suppliers";
import { cookies } from "next/headers";

const MarketingPage = async () => {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userBusiness, error} = await supabase
    .from("provider_business_users")
    .select("*, business:provider_business(*)")
    .eq("user_id", user?.id)

  return (
    <main className="w-full h-fit items-start justify-start flex flex-col">
      <HeroSuppliers user={user} userBusiness={userBusiness} />
      <div className="w-full h-[10000px]"></div>
    </main>
  );
};

export default MarketingPage;
