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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { Database } from "@/database.types";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import { ArrowRight, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { DropDownLogOutButton, LogoutButton } from "../logout-button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

type UserBusinessType =
  Database["public"]["Tables"]["provider_business_users"]["Row"] & {
    business: Database["public"]["Tables"]["provider_business"]["Row"];
  };

export const UserDropdown = ({
  user,
  userBusinesses,
  isScrolled,
}: {
  user: User;
  userBusinesses: UserBusinessType[] | null;
  isScrolled: boolean;
}) => {
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

      {userBusinesses && userBusinesses.length > 0 && (
        <>
          {inSheet ? (
            <>
              <div className="p-3 flex flex-col gap-y-1">
                <p className="font-medium mb-2">Mis negocios</p>

                <div className="flex flex-col gap-2">
                  {userBusinesses.map((userBusiness) => (
                    <Button
                      key={userBusiness.business.id}
                      variant={"ghost"}
                      className="w-full justify-between text-muted-foreground"
                      asChild
                    >
                      <Link
                        href={`/dashboard/${userBusiness.business.id}`}
                        className="flex items-center justify-between w-full"
                        onClick={() => setSheetOpen(false)}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <Avatar className="size-5 rounded-none">
                            <AvatarImage
                              src={userBusiness.business.business_logo_url}
                              alt={userBusiness.business.business_name}
                            />
                            <AvatarFallback className="rounded-none">
                              {userBusiness.business.business_name
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">
                            {userBusiness.business.business_name}
                          </span>
                          <Badge variant={"secondary"} className="shrink-0">
                            {userBusiness.role === "admin"
                              ? "Admin"
                              : userBusiness.role === "supervisor"
                              ? "Gerente"
                              : userBusiness.role === "staff"
                              ? "Personal"
                              : userBusiness.role}
                          </Badge>
                        </span>
                        <ArrowRight className="!size-3.5 shrink-0" />
                      </Link>
                    </Button>
                  ))}
                </div>

                <Button
                  variant={"ghost"}
                  className="w-full justify-between mt-2"
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

              {userBusinesses.map((userBusiness) => (
                <DropdownMenuItem
                  key={userBusiness.business.id}
                  className="cursor-pointer"
                  asChild
                >
                  <Link
                    className="flex items-center justify-between gap-x-3"
                    href={`/dashboard/${userBusiness.business.id}`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <Avatar className="size-4 rounded-none">
                        <AvatarImage
                          src={userBusiness.business.business_logo_url}
                          alt={userBusiness.business.business_name}
                        />
                        <AvatarFallback className="rounded-none">
                          {userBusiness.business.business_name
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">
                        {userBusiness.business.business_name}
                      </span>
                      <Badge variant={"secondary"} className="shrink-0">
                        {userBusiness.role === "admin"
                          ? "Admin"
                          : userBusiness.role === "supervisor"
                          ? "Gerente"
                          : userBusiness.role === "staff"
                          ? "Personal"
                          : userBusiness.role}
                      </Badge>
                    </span>
                    <ArrowRight className="!size-3.5 shrink-0" />
                  </Link>
                </DropdownMenuItem>
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
  userBusinesses,
}: {
  user: User;
  userBusinesses: UserBusinessType[] | null;
}) => {
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

      {userBusinesses && userBusinesses.length > 0 && (
        <>
          {inSheet ? (
            <>
              <div className="p-3 flex flex-col gap-y-1">
                <p className="font-medium mb-2">Mis negocios</p>

                <div className="flex flex-col gap-2">
                  {userBusinesses.map((userBusiness) => (
                    <Button
                      key={userBusiness.business.id}
                      variant={"ghost"}
                      className="w-full justify-between text-muted-foreground"
                      asChild
                    >
                      <Link
                        href={`/dashboard/${userBusiness.business.id}`}
                        className="flex items-center justify-between w-full"
                        onClick={() => setSheetOpen(false)}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <Avatar className="size-5 rounded-none">
                            <AvatarImage
                              src={userBusiness.business.business_logo_url}
                              alt={userBusiness.business.business_name}
                            />
                            <AvatarFallback className="rounded-none">
                              {userBusiness.business.business_name
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">
                            {userBusiness.business.business_name}
                          </span>
                          <Badge variant={"secondary"} className="shrink-0">
                            {userBusiness.role === "admin"
                              ? "Admin"
                              : userBusiness.role === "supervisor"
                              ? "Gerente"
                              : userBusiness.role === "staff"
                              ? "Personal"
                              : userBusiness.role}
                          </Badge>
                        </span>
                        <ArrowRight className="!size-3.5 shrink-0" />
                      </Link>
                    </Button>
                  ))}
                </div>

                <Button
                  variant={"ghost"}
                  className="w-full justify-between mt-2"
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

              {userBusinesses.map((userBusiness) => (
                <DropdownMenuItem
                  key={userBusiness.business.id}
                  className="cursor-pointer"
                  asChild
                >
                  <Link
                    className="flex items-center justify-between gap-x-3"
                    href={`/dashboard/${userBusiness.business.id}`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <Avatar className="size-4 rounded-none">
                        <AvatarImage
                          src={userBusiness.business.business_logo_url}
                          alt={userBusiness.business.business_name}
                        />
                        <AvatarFallback className="rounded-none">
                          {userBusiness.business.business_name
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">
                        {userBusiness.business.business_name}
                      </span>
                      <Badge variant={"secondary"} className="shrink-0">
                        {userBusiness.role === "admin"
                          ? "Admin"
                          : userBusiness.role === "supervisor"
                          ? "Gerente"
                          : userBusiness.role === "staff"
                          ? "Personal"
                          : userBusiness.role}
                      </Badge>
                    </span>
                    <ArrowRight className="!size-3.5 shrink-0" />
                  </Link>
                </DropdownMenuItem>
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
