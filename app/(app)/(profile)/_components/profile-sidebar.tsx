import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { User } from "@supabase/supabase-js";
import { ProfileSidebarContent } from "./profile-sidebar-content";
import type { Database } from "@/database.types";
import { LogoutButton } from "@/components/universal/logout-button";
import { ProfileBackButton } from "./profile-back-button";

export type UserBusinesses =
  Database["public"]["Tables"]["provider_business_users"]["Row"] & {
    business: Database["public"]["Tables"]["provider_business"]["Row"];
  };

export const ProfileSidebar = ({
  user,
  userBusinesses,
  previousPath,
}: {
  user: User;
  userBusinesses: UserBusinesses[];
  previousPath: string;
}) => {
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="bg-background border-b">
        <ProfileBackButton previousPath={previousPath} />
      </SidebarHeader>
      <SidebarContent>
        <ProfileSidebarContent userBusinesses={userBusinesses} user={user} />
      </SidebarContent>
      <SidebarFooter className="bg-background border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <LogoutButton inSidebar />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
