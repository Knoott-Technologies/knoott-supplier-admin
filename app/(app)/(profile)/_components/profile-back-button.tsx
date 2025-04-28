"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export const ProfileBackButton = ({
  previousPath,
}: {
  previousPath: string;
}) => {
  const router = useRouter();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => router.replace(previousPath)}
          variant={"default"}
        >
          <ArrowLeft />
          <span>Regresar</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
