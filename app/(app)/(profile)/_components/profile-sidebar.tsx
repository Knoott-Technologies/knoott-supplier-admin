import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { User } from "@supabase/supabase-js";
import { ArrowLeft, UserIcon } from "lucide-react";
import Link from "next/link";
import { ProfileSidebarContent } from "./profile-sidebar-content";
import { Database } from "@/database.types";
import { LogoutButton } from "@/components/universal/logout-button";
import { ProfileBackButton } from "./profile-back-button";

export type UserBranches =
  Database["public"]["Tables"]["user_provider_branches"]["Row"] & {
    branch: Database["public"]["Tables"]["provider_branches"]["Row"];
  };

export const ProfileSidebar = ({
  user,
  userBranches,
}: {
  user: User;
  userBranches: UserBranches[];
}) => {
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="bg-background border-b">
        <ProfileBackButton />
      </SidebarHeader>
      <SidebarContent>
        <ProfileSidebarContent userBranches={userBranches} user={user} />
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
