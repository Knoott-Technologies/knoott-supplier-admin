import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Database } from "@/database.types";
import { cn } from "@/lib/utils";
import { User } from "@supabase/supabase-js";
import { Menu } from "lucide-react";

export const NavigationMenuMobile = ({
  user,
  isScrolled,
  userProvider,
}: {
  user: User | null;
  userProvider:
    | (Database["public"]["Tables"]["user_provider_branches"]["Row"] & {
        branch: Database["public"]["Tables"]["provider_branches"]["Row"] & {
          business: Database["public"]["Tables"]["provider_business"]["Row"];
        };
      })[]
    | null;
  isScrolled: boolean;
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant={isScrolled ? "secondary" : "ghost"}
          className={cn(
            "text-background border border-transparent",
            isScrolled && "text-foreground border-border bg-sidebar"
          )}
          size="icon"
        >
          <Menu />
        </Button>
      </SheetTrigger>
    </Sheet>
  );
};
