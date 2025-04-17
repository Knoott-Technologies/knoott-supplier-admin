import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const LayoutPlatformBusiness = async ({
  admin,
  staff,
  supervisor,
  params,
}: {
  admin: React.ReactNode;
  staff: React.ReactNode;
  supervisor: React.ReactNode;
  params: { businessId: string };
}) => {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: role, error } = await supabase
    .from("provider_business_users")
    .select("role")
    .eq("user_id", user.id)
    .eq("business_id", params.businessId)
    .single();

  if (error || !role) {
    redirect("/");
  }

  switch (role.role) {
    case "admin":
      return admin;
    case "staff":
      return staff;
    case "supervisor":
      return supervisor;
    default:
      return staff;
  }
};

export default LayoutPlatformBusiness;
