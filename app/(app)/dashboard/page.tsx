import { PageHeader } from "@/components/universal/headers";
import { Logo } from "@/components/universal/logo";
import {
  UserDropdown,
  UserDropdownNoDynamic,
} from "@/components/universal/website/user-dropdown";
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

type UserBranchType =
  Database["public"]["Tables"]["user_provider_branches"]["Row"] & {
    branch: Database["public"]["Tables"]["provider_branches"]["Row"] & {
      business: Database["public"]["Tables"]["provider_business"]["Row"];
    };
  };

type BusinessWithBranches = {
  id: string;
  name: string;
  logo_url: string;
  is_verified: boolean;
  branches: {
    id: string;
    name: string;
    reference: string;
    role: string;
    description: string | null;
  }[];
};

const DashboardPage = async () => {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Obtener todos los branches a los que pertenece el usuario
  const { data: userBranches, error } = await supabase
    .from("user_provider_branches")
    .select("*, branch:provider_branches(*, business:provider_business(*))")
    .eq("user_id", user?.id);

  if (error) {
    console.error("Error fetching user branches:", error);
  }

  // Organizar los branches por negocio
  const businessMap = new Map<string, BusinessWithBranches>();

  userBranches?.forEach((userBranch: UserBranchType) => {
    const branch = userBranch.branch;
    const business = branch.business;

    if (!businessMap.has(business.id)) {
      businessMap.set(business.id, {
        id: business.id,
        name: business.business_name,
        logo_url: business.business_logo_url,
        is_verified: business.is_verified,
        branches: [],
      });
    }

    businessMap.get(business.id)?.branches.push({
      id: branch.id,
      name: branch.branch_name,
      reference: branch.branch_reference,
      role: userBranch.role,
      description: branch.description,
    });
  });

  // Convertir el mapa a un array para renderizar
  const businesses = Array.from(businessMap.values());

  return (
    <>
      <header className="w-full h-14 items-center justify-between flex py-3 px-3 md:px-7 lg:px-14 xl:px-36 2xl:px-56 bg-sidebar sticky top-0 z-20 border-b">
        <Link href="/" className="w-fit h-full" aria-label="Home">
          <Logo variant={"black"} />
        </Link>
        <UserDropdownNoDynamic userProviders={userBranches} user={user} />
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
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.map((business) => (
                <Card key={business.id} className="w-full">
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
                      {business.branches.length}{" "}
                      {business.branches.length === 1
                        ? "sucursal"
                        : "sucursales"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="bg-sidebar flex flex-col gap-y-2 w-full">
                    <span className="gap-y-0">
                      <p className="text-sm font-semibold">Tiendas</p>
                      <p className="text-xs text-muted-foreground">
                        Todas las tiendas/sucursales a las que tienes acceso
                      </p>
                    </span>
                    <div className="flex flex-col gap-y-2 w-full">
                      {business.branches.map((branch) => (
                        <Button
                          key={branch.id}
                          asChild
                          variant={"outline"}
                          size={"default"}
                          className="w-full whitespace-normal"
                        >
                          <Link
                            href={`/dashboard/${branch.id}`}
                            className="flex items-center justify-between w-full"
                          >
                            <span className="flex flex-col gap-y-1 flex-1 w-full">
                              <div className="flex gap-x-2 w-full">
                                <p>{branch.name}</p>
                                <Badge variant={"secondary"}>
                                  {branch.role === "admin"
                                    ? "Administrador"
                                    : branch.role === "manager"
                                    ? "Gerente"
                                    : branch.role === "cashier"
                                    ? "Cajero"
                                    : branch.role}
                                </Badge>
                              </div>
                              {branch.description && (
                                <span className="w-full flex">
                                  <p className="text-xs text-muted-foreground w-full">
                                    {branch.description}
                                  </p>
                                </span>
                              )}
                            </span>
                            <ChevronRight className="shrink-0" />
                          </Link>
                        </Button>
                      ))}
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
                        href={`/dashboard/${business.id}/new-branch`}
                        className="flex items-center justify-between w-full"
                      >
                        <span className="flex flex-col gap-y-1 flex-1 w-full">
                          <div className="flex gap-x-2 w-full">
                            <p>Nueva sucursal</p>
                          </div>
                        </span>
                        <Plus className="shrink-0" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default DashboardPage;
