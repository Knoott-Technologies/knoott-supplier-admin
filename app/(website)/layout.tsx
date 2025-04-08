import type React from "react";
import { HeaderWebsite } from "@/components/universal/website/header-website";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const MarketingLayout = async ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userBusinesses } = await supabase
    .from("provider_business_users")
    .select("*, business:provider_business(*)")
    .eq("user_id", user?.id);

  return (
    <div className="w-full h-fit items-start justify-start flex flex-col">
      <HeaderWebsite userBusinesses={userBusinesses} user={user} />
      {children}
    </div>
  );
};

export default MarketingLayout;
