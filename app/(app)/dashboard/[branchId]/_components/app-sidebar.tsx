import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { User } from "@supabase/supabase-js";
import { Database } from "@/database.types";
import { SidebarProfile } from "./sidebar-profile";
import { SidebarContentProvider } from "./sidebar-content-provider";
import { LogoutButton } from "@/components/universal/logout-button";

export async function AppSidebar({
  user,
  branch,
}: {
  user: User;
  branch: Database["public"]["Tables"]["provider_branches"]["Row"] & {
    business: Database["public"]["Tables"]["provider_business"]["Row"];
  };
}) {
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <SidebarProfile branch={branch} user={user} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarContentProvider logoUrl={branch.business.business_logo_url} branchId={branch.id} />
      </SidebarContent>
      <SidebarFooter className="bg-background border-t p-2 pb-8 md:pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <LogoutButton inSidebar />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
