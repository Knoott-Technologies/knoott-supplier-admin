import { SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/server";
import { Viewport } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "../_components/app-sidebar";
import { SidebarBox } from "../_components/sidebar-box";
import { HeaderPlatform } from "../_components/header-platform";

export const viewport: Viewport = {
  themeColor: "#fafafa",
};

const PlatformLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { businessId: string };
}) => {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: business, error } = await supabase
    .from("provider_business")
    .select("*")
    .eq("id", params.businessId)
    .single();

  if (!business || error) {
    redirect("/");
  }

  const { data: userBusinesses } = await supabase
    .from("provider_business_users")
    .select("*")
    .eq("user_id", user.id)
    .eq("business_id", business.id)
    .single();

  if (!userBusinesses) {
    redirect("/dashboard");
  }

  return (
    <SidebarProvider>
      <AppSidebar role="admin" business={business} user={user} />
      <SidebarBox>
        <HeaderPlatform role={"admin"} user={user} />
        {children}
      </SidebarBox>
    </SidebarProvider>
  );
};

export default PlatformLayout;
