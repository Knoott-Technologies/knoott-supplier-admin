"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Database } from "@/database.types";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { OrderDetails } from "./order-details";

// Definir el tipo Product basado en el esquema de la base de datos
export type Order =
  Database["public"]["Tables"]["wedding_product_orders"]["Row"] & {
    address: Database["public"]["Tables"]["wedding_addresses"]["Row"];
    client: Database["public"]["Tables"]["users"]["Row"];
    product: Database["public"]["Tables"]["wedding_products"]["Row"];
  };

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Definir las columnas con tamaños explícitos para evitar compresión
export const columns: ColumnDef<Order>[] = [
  {
    id: "id",
    accessorKey: "id",
    header: "ID",
    size: 30, // Ancho fijo para evitar compresión
    enableSorting: false,
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
    header: "Cliente",
    accessorKey: "client.first_name",
    size: 150, // Ancho fijo para evitar compresión
    maxSize: 200,
    minSize: 100,
    cell: ({ row }) => {
      return (
        <div>
          <p className="truncate">
            {row.original.client.first_name} {row.original.client.last_name}
          </p>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    header: "Dirección de envío",
    accessorKey: "address.street_address",
    size: 200, // Ancho fijo para evitar compresión
    maxSize: 250,
    minSize: 150,
    cell: ({ row }) => {
      return (
        <div>
          <p className="truncate">
            {row.original.address.street_address}, {row.original.address.city},{" "}
            {row.original.address.postal_code}, {row.original.address.state}
          </p>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    header: "Estado",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          className={cn(
            status === "requires_confirmation" &&
              "bg-contrast/20 text-contrast hover:bg-contrast/10",
            status === "pending" &&
              "bg-primary/20 text-amber-800 hover:bg-primary/10",
            status === "delivered" &&
              "bg-success/20 text-success hover:bg-success/10",
            status === "shipped" &&
              "bg-tertiary/20 text-tertiary border hover:bg-tertiary/10 hover:text-tertiary",
            status === "deleted" &&
              "bg-destructive/20 text-destructive hover:bg-destructive/10"
          )}
        >
          {status === "requires_confirmation" && "Requiere confirmación"}
          {status === "pending" && "Pendiente"}
          {status === "delivered" && "Entregado"}
          {status === "shipped" && "En tránsito"}
          {status === "deleted" && "Cancelado"}
        </Badge>
      );
    },
    size: 130,
    minSize: 80,
    maxSize: 150,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => {

      return <OrderDetails order={row.original} />;
    },
    size: 60, // Ancho fijo para evitar compresión
    enableHiding: false,
  },
];
