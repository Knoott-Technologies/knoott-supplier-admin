import { PageHeader } from "@/components/universal/headers";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BusinessForm } from "./_components/business-form";

const OnboardingPage = async () => {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="w-full h-fit items-center justify-start flex flex-col min-h-[calc(100dvh-56px)] py-7 lg:py-10">
      <div className="w-full h-fit items-start justify-start flex flex-col max-w-xl px-5 md:px-7 lg:px-0">
        <PageHeader
          title="Registra tu negocio"
          description="Registra tu negocio en Knoott Partners, agrega sucursales y comienza a personalizar tu tienda."
        />
        <BusinessForm />
      </div>
    </main>
  );
};

export default OnboardingPage;
