"use client";

import { useState } from "react";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { Database } from "@/database.types";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import { ArrowRight, ChevronsUpDown, LogOut } from "lucide-react";
import Link from "next/link";
import { DropDownLogOutButton, LogoutButton } from "../logout-button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Contenido compartido entre dropdown y sheet
  const ProfileContent = ({ inSheet = false }: { inSheet?: boolean }) => (
    <>
      {inSheet ? (
        <div
          className={cn(
            "flex flex-col gap-0 items-start justify-start w-full",
            inSheet ? "bg-sidebar p-3 border-b" : ""
          )}
        >
          <p className="mb-1 w-full font-medium">Mi cuenta</p>
          <p
            className={cn(
              "truncate w-full",
              inSheet ? "text-lg font-medium" : "text-xs text-muted-foreground"
            )}
          >
            {user.user_metadata.first_name + " " + user.user_metadata.last_name}
          </p>
          <p className="text-xs text-muted-foreground truncate w-full">
            {user.email}
          </p>
        </div>
      ) : (
        <DropdownMenuLabel>
          <p className="mb-1 w-full font-medium">Mi cuenta</p>
          <p
            className={cn(
              "truncate w-full",
              inSheet ? "text-lg font-medium" : "text-xs text-muted-foreground"
            )}
          >
            {user.user_metadata.first_name + " " + user.user_metadata.last_name}
          </p>
          <p className="text-xs text-muted-foreground truncate w-full">
            {user.email}
          </p>
        </DropdownMenuLabel>
      )}

      {inSheet ? (
        <div className="p-3 pb-0">
          <Button
            variant={"ghost"}
            className="w-full justify-between text-muted-foreground mb-2"
            asChild
          >
            <Link
              className="flex items-center justify-between gap-x-3"
              href={`/settings/${user.id}/profile`}
              onClick={() => setSheetOpen(false)}
            >
              <span className="flex items-center gap-2">Ajustes</span>
              <ArrowRight className="!size-3.5" />
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" asChild>
            <Link
              className="flex items-center justify-between gap-x-3"
              href={`/settings/${user.id}/profile`}
            >
              <span className="flex items-center gap-2">Ajustes</span>
              <ArrowRight className="!size-3.5" />
            </Link>
          </DropdownMenuItem>
        </>
      )}

      {businesses.length > 0 && (
        <>
          {inSheet ? (
            <>
              <div className="p-3 flex flex-col gap-y-1">
                <p className="font-medium mb-2">Mis negocios</p>

                {businesses.map((business) => (
                  <div key={business.id} className="flex flex-col gap-y-2">
                    <div className="flex items-center gap-1">
                      <Avatar className="size-5 rounded-none">
                        <AvatarImage
                          src={business.logo_url}
                          alt={business.name}
                        />
                        <AvatarFallback className="rounded-none">
                          {business.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{business.name}</span>
                    </div>

                    <div className="flex flex-col gap-1">
                      {business.branches.map((branch) => (
                        <Button
                          key={branch.id}
                          variant={"ghost"}
                          className="w-full justify-between text-muted-foreground"
                          asChild
                        >
                          <Link
                            href={`/dashboard/${branch.provider_id}`}
                            className="flex items-center justify-between w-full"
                            onClick={() => setSheetOpen(false)}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <span className="truncate">{branch.name}</span>
                              <Badge variant={"secondary"} className="shrink-0">
                                {branch.role === "admin"
                                  ? "Admin"
                                  : branch.role === "manager"
                                  ? "Gerente"
                                  : branch.role === "cashier"
                                  ? "Cajero"
                                  : branch.role}
                              </Badge>
                            </span>
                            <ArrowRight className="!size-3.5 shrink-0" />
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}

                <Button
                  variant={"ghost"}
                  className="w-full justify-between"
                  asChild
                >
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-between w-full"
                    onClick={() => setSheetOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      Ver todos mis negocios
                    </span>
                    <ArrowRight className="!size-3.5" />
                  </Link>
                </Button>
              </div>

              <div className="p-3 pb-8 md:pb-3">
                <LogoutButton />
              </div>
            </>
          ) : (
            <>
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
                  <DropdownMenuSubContent className="min-w-[300px]">
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
                          <span className="flex items-center gap-2 min-w-0">
                            <span className="truncate">{branch.name}</span>
                            <Badge variant={"secondary"} className="shrink-0">
                              {branch.role === "admin"
                                ? "Admin"
                                : branch.role === "manager"
                                ? "Gerente"
                                : branch.role === "cashier"
                                ? "Cajero"
                                : branch.role}
                            </Badge>
                          </span>
                          <ArrowRight className="!size-3.5 shrink-0" />
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
            </>
          )}
        </>
      )}
    </>
  );

  return isMobile ? (
    // Versión móvil con Sheet
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
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
      </SheetTrigger>
      <SheetContent side="bottom" className="p-0 overflow-auto max-h-[85vh]">
        <ProfileContent inSheet={true} />
      </SheetContent>
    </Sheet>
  ) : (
    // Versión desktop con DropdownMenu
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
          <ProfileContent />
        </DropdownMenuGroup>
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
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Contenido compartido entre dropdown y sheet
  const ProfileContent = ({ inSheet = false }: { inSheet?: boolean }) => (
    <>
      {inSheet ? (
        <div
          className={cn(
            "flex flex-col gap-0 items-start justify-start w-full",
            inSheet ? "bg-sidebar p-3 border-b" : ""
          )}
        >
          <p className="mb-1 w-full font-medium">Mi cuenta</p>
          <p
            className={cn(
              "truncate w-full",
              inSheet ? "text-lg font-medium" : "text-xs text-muted-foreground"
            )}
          >
            {user.user_metadata.first_name + " " + user.user_metadata.last_name}
          </p>
          <p className="text-xs text-muted-foreground truncate w-full">
            {user.email}
          </p>
        </div>
      ) : (
        <DropdownMenuLabel>
          <p className="mb-1 w-full font-medium">Mi cuenta</p>
          <p
            className={cn(
              "truncate w-full",
              inSheet ? "text-lg font-medium" : "text-xs text-muted-foreground"
            )}
          >
            {user.user_metadata.first_name + " " + user.user_metadata.last_name}
          </p>
          <p className="text-xs text-muted-foreground truncate w-full">
            {user.email}
          </p>
        </DropdownMenuLabel>
      )}

      {inSheet ? (
        <div className="p-3 pb-0">
          <Button
            variant={"ghost"}
            className="w-full justify-between text-muted-foreground mb-2"
            asChild
          >
            <Link
              className="flex items-center justify-between gap-x-3"
              href={`/settings/${user.id}/profile`}
              onClick={() => setSheetOpen(false)}
            >
              <span className="flex items-center gap-2">Ajustes</span>
              <ArrowRight className="!size-3.5" />
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" asChild>
            <Link
              className="flex items-center justify-between gap-x-3"
              href={`/settings/${user.id}/profile`}
            >
              <span className="flex items-center gap-2">Ajustes</span>
              <ArrowRight className="!size-3.5" />
            </Link>
          </DropdownMenuItem>
        </>
      )}

      {businesses.length > 0 && (
        <>
          {inSheet ? (
            <>
              <div className="p-3 flex flex-col gap-y-1">
                <p className="font-medium mb-2">Mis negocios</p>

                {businesses.map((business) => (
                  <div key={business.id} className="flex flex-col gap-y-2">
                    <div className="flex items-center gap-1">
                      <Avatar className="size-5 rounded-none">
                        <AvatarImage
                          src={business.logo_url}
                          alt={business.name}
                        />
                        <AvatarFallback className="rounded-none">
                          {business.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{business.name}</span>
                    </div>

                    <div className="flex flex-col gap-1">
                      {business.branches.map((branch) => (
                        <Button
                          key={branch.id}
                          variant={"ghost"}
                          className="w-full justify-between text-muted-foreground"
                          asChild
                        >
                          <Link
                            href={`/dashboard/${branch.provider_id}`}
                            className="flex items-center justify-between w-full"
                            onClick={() => setSheetOpen(false)}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <span className="truncate">{branch.name}</span>
                              <Badge variant={"secondary"} className="shrink-0">
                                {branch.role === "admin"
                                  ? "Admin"
                                  : branch.role === "manager"
                                  ? "Gerente"
                                  : branch.role === "cashier"
                                  ? "Cajero"
                                  : branch.role}
                              </Badge>
                            </span>
                            <ArrowRight className="!size-3.5 shrink-0" />
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}

                <Button
                  variant={"ghost"}
                  className="w-full justify-between"
                  asChild
                >
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-between w-full"
                    onClick={() => setSheetOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      Ver todos mis negocios
                    </span>
                    <ArrowRight className="!size-3.5" />
                  </Link>
                </Button>
              </div>

              <div className="p-3 pb-8 md:pb-3">
                <LogoutButton />
              </div>
            </>
          ) : (
            <>
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
                  <DropdownMenuSubContent className="min-w-[300px]">
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
                          <span className="flex items-center gap-2 min-w-0">
                            <span className="truncate">{branch.name}</span>
                            <Badge variant={"secondary"} className="shrink-0">
                              {branch.role === "admin"
                                ? "Admin"
                                : branch.role === "manager"
                                ? "Gerente"
                                : branch.role === "cashier"
                                ? "Cajero"
                                : branch.role}
                            </Badge>
                          </span>
                          <ArrowRight className="!size-3.5 shrink-0" />
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
            </>
          )}
        </>
      )}
    </>
  );

  return isMobile ? (
    // Versión móvil con Sheet
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant={"outline"} size="default">
          {user.user_metadata.first_name + " " + user.user_metadata.last_name}
          <ChevronsUpDown className="ml-1 h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="p-0 overflow-auto max-h-[85vh]">
        <ProfileContent inSheet={true} />
      </SheetContent>
    </Sheet>
  ) : (
    // Versión desktop con DropdownMenu
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
          <ProfileContent />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropDownLogOutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
