"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { User } from "@supabase/supabase-js";
import { Settings, Settings2, UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserBusinesses } from "./profile-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export const ProfileSidebarContent = ({
  user,
  userBusinesses,
}: {
  user: User;
  userBusinesses: UserBusinesses[];
}) => {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { state } = useSidebar();

  const isCollapsed = !isMobile && state === "collapsed";

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
      {userBusinesses && userBusinesses.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Mis negocios</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userBusinesses.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.business.business_name}
                    className={cn(
                      "flex items-center gap-2",
                      isCollapsed && "justify-center p-0 h-8 w-8"
                    )}
                    isActive={
                      pathname ===
                      `/settings/${user.id}/${item.business.id}/settings`
                    }
                  >
                    <Link
                      href={`/settings/${user.id}/${item.business.id}/settings`}
                    >
                      <Avatar
                        className={cn(
                          "size-4 rounded-none",
                          isCollapsed && "size-4"
                        )}
                      >
                        <AvatarImage
                          src={item.business.business_logo_url}
                          alt={item.business.business_name}
                        />
                        <AvatarFallback className="rounded-none">
                          {item.business.business_name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {!isCollapsed && (
                        <span className="flex-1 text-left max-w-[80%] truncate">
                          {item.business.business_name}
                        </span>
                      )}
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
