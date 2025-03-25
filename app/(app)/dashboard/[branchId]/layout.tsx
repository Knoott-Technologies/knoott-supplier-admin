import { SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/server";
import { Viewport } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "./_components/app-sidebar";
import { SidebarBox } from "./_components/sidebar-box";
import { HeaderPlatform } from "./_components/header-platform";

export const viewport: Viewport = {
  themeColor: "#fafafa",
};

const PlatformLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { branchId: string };
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

  return (
    <SidebarProvider>
      <AppSidebar branch={branch} user={user} />
      <SidebarBox>
        <HeaderPlatform user={user} />
        {children}
      </SidebarBox>
    </SidebarProvider>
  );
};

export default PlatformLayout;
