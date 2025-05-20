import { PageHeader } from "@/components/universal/headers";
import { Logo } from "@/components/universal/logo";
import { UserDropdownNoDynamic } from "@/components/universal/website/user-dropdown";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Database } from "@/database.types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type UserBusinessType =
  Database["public"]["Tables"]["provider_business_users"]["Row"] & {
    business: Database["public"]["Tables"]["provider_business"]["Row"];
  };

type BusinessWithRole = {
  id: string;
  name: string;
  logo_url: string;
  is_verified: boolean;
  role: string;
  description: string | null;
  reference: string;
};

const DashboardPage = async () => {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Obtener todos los negocios a los que pertenece el usuario
  const { data: userBusinesses, error } = await supabase
    .from("provider_business_users")
    .select("*, business:provider_business(*)")
    .eq("user_id", user?.id);

  if (error) {
    console.error("Error fetching user businesses:", error);
  }

  // Organizar los negocios con su rol
  const businesses: BusinessWithRole[] =
    userBusinesses?.map((userBusiness: UserBusinessType) => {
      const business = userBusiness.business;

      return {
        id: business.id,
        name: business.business_name,
        logo_url: business.business_logo_url,
        is_verified: business.is_verified,
        role: userBusiness.role,
        description: business.description,
        reference: business.reference,
      };
    }) || [];

  return (
    <>
      <header className="w-full h-14 items-center justify-between flex py-3 px-3 md:px-7 lg:px-14 xl:px-36 2xl:px-56 bg-sidebar sticky top-0 z-20 border-b">
        <Link href="/" className="w-fit h-full" aria-label="Home">
          <Logo variant={"black"} />
        </Link>
        <UserDropdownNoDynamic userBusinesses={userBusinesses} user={user} />
      </header>
      <main className="w-full h-fit items-start justify-start flex flex-col px-3 md:px-7 lg:px-14 xl:px-36 2xl:px-56 py-5 pb-14 lg:py-7 min-h-[calc(100vh-56px)]">
        <PageHeader
          title="Dashboard"
          description="Aquí puedes ver tus negocios y gestionarlos"
        />

        <section className="w-full grid grid-cols-1 lg:grid-cols-[2fr_.8fr] gap-5 lg:gap-7">
          {businesses.length === 0 ? (
            <Card className="bg-muted/40">
              <CardContent className="pt-6 pb-6 text-center">
                <p className="text-muted-foreground">
                  No tienes negocios asignados.
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/onboarding">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear nuevo negocio
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {businesses.map((business) => (
                <Link
                  key={business.id}
                  href={`/dashboard/${business.id}`}
                  className={cn(
                    "flex flex-1 items-center bg-sidebar border justify-between w-full hover:shadow-md ease-in-out transition-all"
                  )}
                >
                  <div className="flex flex-col gap-y-2 w-full p-3 flex-1 items-start justify-between min-h-[200px]">
                    <span className="flex flex-col gap-y-2 flex-1 w-full">
                      <div className="flex gap-x-2 w-full items-center justify-between">
                        <span className="flex gap-x-2 items-center text-base font-semibold">
                          <Avatar className="size-6 rounded-none border">
                            <AvatarImage
                              src={business.logo_url}
                              alt={business.name}
                            />
                            <AvatarFallback className="rounded-none">
                              {business.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {business.name}
                        </span>
                        <ChevronRight className="size-4" />
                      </div>
                      {business.description && (
                        <p className="text-muted-foreground text-sm">
                          {business.description}
                        </p>
                      )}
                    </span>
                    <div className="w-full items-center justify-between gap-5 flex">
                      <span className="gap-x-1.5 flex items-center text-xs text-muted-foreground">
                        {(business.is_verified && (
                          <span className="w-2 h-2 rounded-full bg-success" />
                        )) || (
                          <span className="w-2 h-2 rounded-full bg-contrast" />
                        )}
                        {business.is_verified ? "Verificado" : "En revisión"}
                      </span>
                      <p className="text-muted-foreground text-xs">
                        Ref:{" "}
                        <span className="text-foreground font-medium">
                          {business.reference}
                        </span>
                      </p>
                    </div>
                  </div>
                </Link>
              ))}

              <Link
                href="/onboarding"
                className="flex items-center flex-1 justify-center w-full border border-dashed p-4 bg-sidebar group hover:bg-muted/80 ease-in-out transition-all"
              >
                <div className="text-muted-foreground text-sm flex gap-1 items-center group-hover:text-foreground ease-in-out transition-all flex-col">
                  <Plus className="size-6" />
                  <p className="text-xs">Nuevo negocio</p>
                </div>
              </Link>
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default DashboardPage;
