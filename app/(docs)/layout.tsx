import type React from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarBox } from "../(app)/dashboard/[businessId]/_components/sidebar-box";
import { HeaderDocs } from "./_components/header-docs";
import DocsSidebar from "./_components/docs-sidebar";
import { DocsSidebarWrapper } from "./_components/docs-sidebar-wrapper";

const DocsLayout = async ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "18rem" } as React.CSSProperties}
    >
      <DocsSidebarWrapper user={user} />
      <SidebarBox>
        <HeaderDocs user={user} />
        {children}
      </SidebarBox>
    </SidebarProvider>
  );
};

export default DocsLayout;
