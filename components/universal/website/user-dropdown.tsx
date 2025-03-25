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
import { Database } from "@/database.types";
import { cn } from "@/lib/utils";
import { User } from "@supabase/supabase-js";
import { ArrowRight, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { DropDownLogOutButton } from "../logout-button";

export const UserDropdown = ({
  user,
  userProvider,
  isScrolled,
}: {
  user: User;
  userProvider:
    | (Database["public"]["Tables"]["user_provider_branches"]["Row"] & {
        branch: Database["public"]["Tables"]["provider_branches"]["Row"] & {
          business: Database["public"]["Tables"]["provider_business"]["Row"];
        };
      })
    | null;
  isScrolled: boolean;
}) => {
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
          <ChevronsUpDown />
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
        {userProvider && (
          <DropdownMenuGroup>
            <DropdownMenuLabel>Mis negocios</DropdownMenuLabel>
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link
                className="flex items-center justify-between gap-x-3"
                href={`/dashboard/${userProvider.provider_id}`}
              >
                <span className="flex items-center gap-1">
                  <Avatar className="size-4 rounded-none">
                    <AvatarImage
                      src={userProvider.branch.business.business_logo_url}
                      alt={userProvider.branch.business.business_name}
                    />
                    <AvatarFallback className="rounded-none">
                      {userProvider.branch.branch_name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {userProvider.branch.branch_name}
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
