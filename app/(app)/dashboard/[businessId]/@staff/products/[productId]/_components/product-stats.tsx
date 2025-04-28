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
    <div className="w-full h-fit items-start justify-start overflow-auto no-scrollbar">
      <div className="w-fit h-fit items-stretch flex">
        <span className="flex flex-col gap-y-1 items-start justify-start flex-1 pr-2.5 py-1">
          <p className="text-sm font-semibold">Estado:</p>
          <Badge
            variant={"secondary"}
            className={cn(
              "cursor-default",
              product.status === "draft" &&
                "bg-primary/20 text-amber-800 hover:bg-primary/20",
              product.status === "active" &&
                "bg-success/20 text-success hover:bg-success/20",
              product.status === "archived" &&
                "bg-muted text-foreground border hover:bg-muted hover:text-foreground",
              product.status === "requires_verification" &&
                "bg-contrast/20 text-contrast border-border hover:bg-contrast/20 hover:text-contrast",
              product.status === "deleted" &&
                "bg-destructive/20 text-destructive hover:bg-destructive/20"
            )}
          >
            {getStatusLabel(product.status)}
          </Badge>
        </span>
        <span className="flex flex-col gap-y-1 items-start justify-start flex-1 px-2.5 border-x py-1">
          <p className="text-sm font-semibold">Creado el:</p>
          <Badge
            variant={"outline"}
            className="bg-sidebar whitespace-nowrap hover:bg-sidebar/80 cursor-default text-muted-foreground gap-x-1"
          >
            {product.created_at === product.updated_at ? (
              <Circle className="size-1.5 fill-current text-current opacity-50" />
            ) : (
              <Circle className="size-1.5 fill-success text-success" />
            )}
            {formatInTimeZone(product.created_at, timeZone, "PPP hh:mm aa", {
              locale: es,
            })}
          </Badge>
        </span>
        <span className="flex flex-col gap-y-1 items-start justify-start flex-1 pl-2.5 py-1">
          <p className="text-sm font-semibold">Última edición:</p>
          <Badge
            variant={"outline"}
            title="Versión actualizada"
            className="bg-sidebar whitespace-nowrap hover:bg-sidebar/80 cursor-default text-muted-foreground gap-x-1"
          >
            <Circle className="size-1.5 fill-success text-success" />
            {formatInTimeZone(product.updated_at, timeZone, "PPP hh:mm aa", {
              locale: es,
            })}
          </Badge>
        </span>
      </div>
    </div>
  );
};
