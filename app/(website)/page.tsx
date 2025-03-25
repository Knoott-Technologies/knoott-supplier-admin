import { createClient } from "@/utils/supabase/server";
import { HeroSuppliers } from "./_components/hero-suppliers";
import { cookies } from "next/headers";

const MarketingPage = async () => {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userProvider } = await supabase
    .from("user_provider_branches")
    .select("*, branch:provider_branches(*, business:provider_business(*))")
    .eq("user_id", user?.id)
    .single();

  return (
    <main className="w-full h-fit items-start justify-start flex flex-col">
      <HeroSuppliers user={user} userProvider={userProvider} />
      <div className="w-full h-[10000px]"></div>
    </main>
  );
};

export default MarketingPage;
