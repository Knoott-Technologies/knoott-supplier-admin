"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { User } from "@supabase/supabase-js";
import { ReceiptText, Settings, Settings2, UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserBranches } from "./profile-sidebar";

export const ProfileSidebarContent = ({
  user,
  userBranches,
}: {
  user: User;
  userBranches: UserBranches[];
}) => {
  const pathname = usePathname();

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Mi cuenta</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={pathname === `/settings/${user.id}/profile`}
                asChild
              >
                <Link href={`/settings/${user.id}/profile`}>
                  <UserIcon />
                  <span>Perfil</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={pathname === `/settings/${user.id}/preferences`}
                asChild
              >
                <Link href={`/settings/${user.id}/preferences`}>
                  <Settings2 />
                  <span>Preferencias</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      {userBranches && userBranches.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Mis mesas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userBranches.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={
                      pathname ===
                      `/settings/${user.id}/${item.provider_id}/settings`
                    }
                    asChild
                  >
                    <Link
                      href={`/settings/${user.id}/${item.provider_id}/settings`}
                    >
                      <Settings />
                      <span className="truncate">
                        {item.branch.branch_name}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </>
  );
};
