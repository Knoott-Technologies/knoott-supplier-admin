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

        <section className="w-full">
          {businesses.length === 0 ? (
            <Card className="bg-muted/40">
              <CardContent className="pt-6 pb-6 text-center">
                <p className="text-muted-foreground">
                  No tienes negocios asignados.
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/dashboard/new-business">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear nuevo negocio
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.map((business) => (
                <Card key={business.id} className="w-full flex-1 flex flex-col">
                  <CardHeader className="">
                    <div className="flex justify-between items-center w-full">
                      <CardTitle className="flex items-center gap-2">
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
                      </CardTitle>
                      <Badge
                        variant={"outline"}
                        className="gap-x-1.5 pl-1.5 flex font-medium bg-sidebar"
                      >
                        {(business.is_verified && (
                          <span className="w-2 h-2 rounded-full bg-success" />
                        )) || (
                          <span className="w-2 h-2 rounded-full bg-contrast" />
                        )}
                        {business.is_verified ? "Verificado" : "En revisión"}
                      </Badge>
                    </div>
                    <CardDescription>
                      Referencia: {business.reference}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="bg-sidebar flex flex-col gap-y-2 w-full flex-1">
                    <div className="flex flex-col gap-y-2 w-full">
                      <div className="flex items-center justify-between w-full p-3 bg-background rounded-md border">
                        <span className="flex flex-col gap-y-1 flex-1 w-full">
                          <div className="flex gap-x-2 w-full items-center justify-between">
                            <p className="font-medium">{business.name}</p>
                            <Badge variant={"secondary"}>
                              {business.role === "admin"
                                ? "Administrador"
                                : business.role === "manager"
                                ? "Gerente"
                                : business.role === "staff"
                                ? "Personal"
                                : business.role}
                            </Badge>
                          </div>
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-background border-t p-0">
                    <Button
                      asChild
                      variant={"ghost"}
                      size={"sm"}
                      className="w-full whitespace-normal text-muted-foreground"
                    >
                      <Link
                        href={`/dashboard/${business.id}`}
                        className="flex items-center justify-between w-full"
                      >
                        <span className="flex flex-col gap-y-1 flex-1 w-full">
                          <div className="flex gap-x-2 w-full">
                            <p>Administrar negocio</p>
                          </div>
                        </span>
                        <ChevronRight className="shrink-0" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              <Card className="w-full border-dashed bg-sidebar">
                <CardContent className="flex flex-col items-center justify-center h-full">
                  <Button
                    asChild
                    variant="outline"
                    size={"sm"}
                    className="w-full"
                  >
                    <Link
                      href="/dashboard/new-business"
                      className="flex items-center"
                    >
                      Nuevo negocio
                      <Plus />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default DashboardPage;
