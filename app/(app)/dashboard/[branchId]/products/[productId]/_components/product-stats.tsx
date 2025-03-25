"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Database } from "@/database.types";
import { cn } from "@/lib/utils";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { Circle } from "lucide-react";

const getStatusLabel = (status: string): string => {
  switch (status) {
    case "draft":
      return "Borrador";
    case "active":
      return "Activo";
    case "archived":
      return "Archivado";
    case "requires_verification":
      return "En revisión";
    case "deleted":
      return "Eliminado";
    default:
      return status;
  }
};

export const ProductStats = ({
  product,
}: {
  product: Database["public"]["Tables"]["products"]["Row"] & {
    brand: Database["public"]["Tables"]["catalog_brands"]["Row"];
    subcategory: Database["public"]["Tables"]["catalog_collections"]["Row"];
  };
}) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <div className="w-full h-fit items-start justify-start overflow-auto">
      <div className="w-fit h-14 items-stretch gap-x-5 flex flex-wrap">
        <span className="flex flex-col gap-y-1 items-start justify-start">
          <p className="text-sm font-semibold">Creado el:</p>
          <Badge
            variant={"outline"}
            className="bg-sidebar hover:bg-sidebar/80 cursor-default text-muted-foreground gap-x-1"
          >
            <Circle className="size-1.5 fill-current text-current opacity-50" />
            {formatInTimeZone(product.created_at, timeZone, "PPP hh:mm aa", {
              locale: es,
            })}
          </Badge>
        </span>
        <Separator className="h-full" orientation="vertical" />
        <span className="flex flex-col gap-y-1 items-start justify-start">
          <p className="text-sm font-semibold">Última edición:</p>
          <Badge
            variant={"outline"}
            className="bg-sidebar hover:bg-sidebar/80 cursor-default text-muted-foreground gap-x-1"
          >
            <Circle className="size-1.5 fill-current text-current opacity-50" />
            {formatInTimeZone(product.updated_at, timeZone, "PPP hh:mm aa", {
              locale: es,
            })}
          </Badge>
        </span>
        <Separator className="h-full" orientation="vertical" />
        <span className="flex flex-col gap-y-1 items-start justify-start">
          <p className="text-sm font-semibold">Estado:</p>
          <Badge
            variant={"secondary"}
            className={cn(
              product.status === "draft" &&
                "bg-primary/20 text-amber-800 hover:bg-primary/10",
              product.status === "active" &&
                "bg-success/20 text-success hover:bg-success/10",
              product.status === "archived" &&
                "bg-muted text-foreground border",
              product.status === "requires_verification" &&
                "bg-background text-muted-foreground border-border hover:bg-background/90 hover:text-muted-foreground",
              product.status === "deleted" &&
                "bg-destructive/20 text-destructive hover:bg-destructive/10"
            )}
          >
            {getStatusLabel(product.status)}
          </Badge>
        </span>
      </div>
    </div>
  );
};
