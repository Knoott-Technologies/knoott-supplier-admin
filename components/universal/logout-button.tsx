"use client";

import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { SidebarMenuButton } from "../ui/sidebar";

export const LogoutButton = ({ inSidebar }: { inSidebar?: boolean }) => {
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut().then(() => {
      router.refresh();
    });
  }

  if (inSidebar) {
    return (
      <SidebarMenuButton
        onClick={signOut}
        className="cursor-pointer items-center justify-between text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        Cerrar sesión <LogOut className="size-4" />
      </SidebarMenuButton>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={signOut}
      className="cursor-pointer items-center justify-between text-destructive hover:text-destructive hover:bg-destructive/10"
    >
      Cerrar sesión <LogOut className="size-4" />
    </Button>
  );
};

export const DropDownLogOutButton = () => {
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut().then(() => {
      router.refresh();
    });
  }

  return (
    <DropdownMenuItem
      onClick={signOut}
      className="cursor-pointer items-center justify-between text-destructive focus:text-destructive focus:bg-destructive/10"
    >
      Cerrar sesión <LogOut className="size-4" />
    </DropdownMenuItem>
  );
};
