import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Database } from "@/database.types";
import { cn } from "@/lib/utils";
import { User } from "@supabase/supabase-js";
import { ArrowRight, Building2, ChevronsUpDown, Store } from "lucide-react";
import Link from "next/link";
import { DropDownLogOutButton } from "../logout-button";
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
  branches: {
    id: string;
    name: string;
    provider_id: string;
    role: string;
  }[];
};

// Función para organizar los branches por negocio
const organizeBranchesByBusiness = (
  userBranches: UserBranchType[] | null
): BusinessWithBranches[] => {
  if (!userBranches || userBranches.length === 0) return [];

  const businessMap = new Map<string, BusinessWithBranches>();

  userBranches.forEach((userBranch) => {
    const branch = userBranch.branch;
    const business = branch.business;

    if (!businessMap.has(business.id)) {
      businessMap.set(business.id, {
        id: business.id,
        name: business.business_name,
        logo_url: business.business_logo_url,
        branches: [],
      });
    }

    businessMap.get(business.id)?.branches.push({
      id: branch.id,
      name: branch.branch_name,
      provider_id: userBranch.provider_id,
      role: userBranch.role,
    });
  });

  return Array.from(businessMap.values());
};

export const UserDropdown = ({
  user,
  userProviders,
  isScrolled,
}: {
  user: User;
  userProviders: UserBranchType[] | null;
  isScrolled: boolean;
}) => {
  const businesses = organizeBranchesByBusiness(userProviders);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isScrolled ? "secondary" : "ghost"}
          className={cn(
            "text-background border border-transparent",
            isScrolled && "text-foreground border-border bg-sidebar"
          )}
          size="default"
        >
          {user.user_metadata.first_name + " " + user.user_metadata.last_name}
          <ChevronsUpDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-[300px] w-[--radix-dropdown-menu-trigger-width]"
        align="end"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="flex-1 flex flex-col gap-0 items-start justify-start">
              <p>Mi cuenta</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </span>
          </DropdownMenuLabel>
          <DropdownMenuItem className="cursor-pointer" asChild>
            <Link
              className="flex items-center justify-between gap-x-3"
              href={`/settings/${user.id}/profile`}
            >
              <span className="flex items-center gap-2">Ajustes</span>{" "}
              <ArrowRight className="!size-3.5" />
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {businesses.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel>Mis negocios</DropdownMenuLabel>

            {businesses.map((business) => (
              <DropdownMenuSub key={business.id}>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Avatar className="size-4 rounded-none">
                      <AvatarImage
                        src={business.logo_url}
                        alt={business.name}
                      />
                      <AvatarFallback className="rounded-none">
                        {business.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex items-center gap-1">
                      {business.name}
                    </span>
                  </span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="min-w-[220px]">
                  {business.branches.map((branch) => (
                    <DropdownMenuItem
                      key={branch.id}
                      className="cursor-pointer"
                      asChild
                    >
                      <Link
                        className="flex items-center justify-between gap-x-3"
                        href={`/dashboard/${branch.provider_id}`}
                      >
                        <span className="flex items-center gap-2">
                          {branch.name}
                          <Badge variant={"secondary"}>
                            {branch.role === "admin"
                              ? "Admin"
                              : branch.role === "manager"
                              ? "Gerente"
                              : branch.role === "cashier"
                              ? "Cajero"
                              : branch.role}
                          </Badge>
                        </span>
                        <ArrowRight className="!size-3.5" />
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ))}

            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link
                className="flex items-center justify-between gap-x-3"
                href="/dashboard"
              >
                <span className="flex items-center gap-2">
                  Ver todos mis negocios
                </span>
                <ArrowRight className="!size-3.5" />
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        <DropdownMenuSeparator />
        <DropDownLogOutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const UserDropdownNoDynamic = ({
  user,
  userProviders,
}: {
  user: User;
  userProviders: UserBranchType[] | null;
}) => {
  const businesses = organizeBranchesByBusiness(userProviders);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"outline"} size="default">
          {user.user_metadata.first_name + " " + user.user_metadata.last_name}
          <ChevronsUpDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-[300px] w-[--radix-dropdown-menu-trigger-width]"
        align="end"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="flex-1 flex flex-col gap-0 items-start justify-start">
              <p>Mi cuenta</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </span>
          </DropdownMenuLabel>
          <DropdownMenuItem className="cursor-pointer" asChild>
            <Link
              className="flex items-center justify-between gap-x-3"
              href={`/settings/${user.id}/profile`}
            >
              <span className="flex items-center gap-2">Ajustes</span>{" "}
              <ArrowRight className="!size-3.5" />
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {businesses.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel>Mis negocios</DropdownMenuLabel>

            {businesses.map((business) => (
              <DropdownMenuSub key={business.id}>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Avatar className="size-4 rounded-none">
                      <AvatarImage
                        src={business.logo_url}
                        alt={business.name}
                      />
                      <AvatarFallback className="rounded-none">
                        {business.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex items-center gap-1">
                      {business.name}
                    </span>
                  </span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="min-w-[220px]">
                  {business.branches.map((branch) => (
                    <DropdownMenuItem
                      key={branch.id}
                      className="cursor-pointer"
                      asChild
                    >
                      <Link
                        className="flex items-center justify-between gap-x-3"
                        href={`/dashboard/${branch.provider_id}`}
                      >
                        <span className="flex items-center gap-2">
                          {branch.name}
                          <span className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full">
                            {branch.role === "admin"
                              ? "Admin"
                              : branch.role === "manager"
                              ? "Gerente"
                              : branch.role === "cashier"
                              ? "Cajero"
                              : branch.role}
                          </span>
                        </span>
                        <ArrowRight className="!size-3.5" />
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ))}

            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link
                className="flex items-center justify-between gap-x-3"
                href="/dashboard"
              >
                <span className="flex items-center gap-2">
                  Ver todos mis negocios
                </span>
                <ArrowRight className="!size-3.5" />
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        <DropdownMenuSeparator />
        <DropDownLogOutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
