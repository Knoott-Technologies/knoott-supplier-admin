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
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Announcement } from "@/components/ui/sidebar-news";

export async function AppSidebar({
  user,
  business,
  role = "admin",
}: {
  user: User;
  business: Database["public"]["Tables"]["provider_business"]["Row"];
  role: Database["public"]["Enums"]["provider_businees_user_roles"];
}) {
  const supabase = createClient(cookies());

  const { count: ordersCount } = await supabase
    .from("wedding_product_orders")
    .select("*", { count: "exact", head: true })
    .eq("status", ["requires_confirmation", "paid"])
    .eq("provider_business_id", business.id);

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <SidebarProfile role={role} business={business} user={user} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarContentProvider
          ordersCount={ordersCount || 0}
          role={role}
          logoUrl={business.business_logo_url}
          businessId={business.id}
        />
      </SidebarContent>
      <SidebarFooter className="p-0">
        {/* <div className="p-2 pb-0">
          <Announcement
            title="Ahora puedes crear banners"
            description="Puedes crear y solicitar banners para el catálogo Knoott, aumenta tus ventas e impulsa tu negocio."
            href={`/dashboard/${business.id}/banners`}
          />
        </div> */}
        <div className="p-2 border-t bg-background pb-8 lg:pb-2">
          <LogoutButton inSidebar />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
