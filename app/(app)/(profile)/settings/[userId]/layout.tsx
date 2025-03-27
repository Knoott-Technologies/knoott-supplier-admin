import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileSidebar } from "../../_components/profile-sidebar";
import { Logo } from "@/components/universal/logo";
import { SidebarBox } from "@/app/(app)/dashboard/[branchId]/_components/sidebar-box";

const ProfileLayout = async ({
  params,
  children,
}: {
  params: { userId: string };
  children: React.ReactNode;
}) => {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Obtener las bodas asociadas al usuario actual
  const { data: userBranches, error: weddingsError } = await supabase
    .from("user_provider_branches")
    .select(
      `
      *,
      branch:provider_branches (
        *
      )
    `
    )
    .eq("user_id", user.id);

  if (weddingsError) {
    console.error("Error al obtener las bodas del usuario:", weddingsError);
  }

  return (
    <SidebarProvider>
      <ProfileSidebar user={user} userBranches={userBranches || []} />
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
