import type React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileSidebar } from "../../_components/profile-sidebar";
import { Logo } from "@/components/universal/logo";
import { SidebarBox } from "@/app/(app)/dashboard/[businessId]/_components/sidebar-box";

const ProfileLayout = async ({
  params,
  children,
}: {
  params: { userId: string };
  children: React.ReactNode;
}) => {
  const supabase = createClient(cookies());

  // Obtener información de la ruta actual
  const headersList = headers();
  const pathname =
    headersList.get("x-pathname") || headersList.get("x-url") || "";
  const referer = headersList.get("referer") || "";

  // También puedes usar el referer para saber de dónde viene el usuario
  const previousPath = referer ? new URL(referer).pathname : "/";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Obtener los negocios asociados al usuario actual
  const { data: userBusinesses, error: businessesError } = await supabase
    .from("provider_business_users")
    .select(
      `
      *,
      business:provider_business (
        *
      )
    `
    )
    .eq("user_id", user.id)
    .eq("role", "admin");

  if (businessesError) {
    console.error(
      "Error al obtener los negocios del usuario:",
      businessesError
    );
  }

  return (
    <SidebarProvider>
      <ProfileSidebar
        user={user}
        userBusinesses={userBusinesses || []}
        previousPath={previousPath}
      />
      <SidebarBox>
        <header className="w-full bg-sidebar lg:hidden flex h-12 py-3 items-center justify-between px-5 border-b sticky top-0 z-10">
          <SidebarTrigger />
          <Logo variant={"black"} />
        </header>
        {children}
      </SidebarBox>
    </SidebarProvider>
  );
};

export default ProfileLayout;
