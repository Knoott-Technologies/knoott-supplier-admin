"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { EllipsisIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Database } from "@/database.types";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { ProductActions } from "./product-actions";

// Definir el tipo Product basado en el esquema de la base de datos
export type Product = Database["public"]["Tables"]["products"]["Row"] & {
  brand: Database["public"]["Tables"]["catalog_brands"]["Row"];
  subcategory: Database["public"]["Tables"]["catalog_collections"]["Row"];
};

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Definir las columnas con tamaños explícitos para evitar compresión
export const columns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    size: 50, // Ancho fijo para evitar compresión
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "imagen",
    header: "Imagen",
    cell: ({ row }) => {
      const imageUrl = row.original.images_url?.[0] || "";
      return (
        <div className="flex items-center justify-center h-16 w-12 relative overflow-hidden aspect-[3/4]">
          {imageUrl && imageUrl !== "" ? (
            <Image
              src={imageUrl}
              alt={row.original.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="bg-muted h-full w-full flex items-center justify-center text-xs text-muted-foreground">
              Sin imagen
            </div>
          )}
        </div>
      );
    },
    size: 70, // Ancho fijo para evitar compresión
    enableSorting: false,
  },
  {
    header: "Nombre",
    accessorKey: "name",
    cell: ({ row }) => (
      <div className="flex flex-col min-w-0">
        <div className="font-medium truncate">{row.getValue("name")}</div>
      </div>
    ),
    size: 200, // Ancho fijo para evitar compresión
    maxSize: 300,
    minSize: 100,
    enableHiding: false,
  },
  {
    header: "Descripción",
    accessorKey: "short_description",
    cell: ({ row }) => (
      <div className="w-full" title={row.original.description}>
        <p className="truncate">
          {row.getValue("short_description") ||
            row.original.description ||
            "Sin descripción"}
        </p>
      </div>
    ),
    size: 300, // Ancho fijo para evitar compresión
    minSize: 200,
    maxSize: 400,
  },
  {
    header: "Estado",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          className={cn(
            status === "draft" &&
              "bg-primary/20 text-amber-800 hover:bg-primary/10",
            status === "active" &&
              "bg-success/20 text-success hover:bg-success/10",
            status === "archived" && "bg-muted text-foreground border",
            status === "requires_verification" &&
              "bg-background text-muted-foreground border-border hover:bg-background/90 hover:text-muted-foreground",
            status === "deleted" &&
              "bg-destructive/20 text-destructive hover:bg-destructive/10"
          )}
        >
          {status === "draft" && "Borrador"}
          {status === "active" && "Activo"}
          {status === "archived" && "Archivado"}
          {status === "requires_verification" && "En revisión"}
          {status === "deleted" && "Eliminado"}
        </Badge>
      );
    },
    size: 100, // Ancho fijo para evitar compresión
  },
  {
    header: "Fecha creación",
    accessorKey: "created_at",
    cell: ({ row }) => {
      return (
        <div>
          {formatInTimeZone(row.getValue("created_at"), timeZone, "PP h:mm a", {
            locale: es,
          })}
        </div>
      );
    },
    size: 140, // Ancho fijo para evitar compresión
  },
  {
    header: "Marca",
    id: "brand",
    accessorKey: "brand.name",
    cell: ({ row }) => (
      <div className="truncate">{row.original.brand?.name || "-"}</div>
    ),
    size: 120, // Ancho fijo para evitar compresión
    enableHiding: false,
  },
  {
    header: "Colección",
    id: "subcategory",
    accessorKey: "subcategory.name",
    cell: ({ row }) => (
      <div className="truncate">{row.original.subcategory?.name || "-"}</div>
    ),
    size: 120, // Ancho fijo para evitar compresión
    enableHiding: false,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => {
      const product = row.original;

      return <ProductActions product={product} />;
    },
    size: 60, // Ancho fijo para evitar compresión
    enableHiding: false,
  },
];
