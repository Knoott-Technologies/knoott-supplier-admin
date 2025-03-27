"use client";

import { Database } from "@/database.types";
import { ColumnDef } from "@tanstack/react-table";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Tipo de transacción original
export type PaymentIntentProps =
  Database["public"]["Tables"]["payment_intents"]["Row"] & {
    wedding: Pick<Database["public"]["Tables"]["weddings"]["Row"], "name">;
  };

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Columnas para la vista agrupada
export const columns: ColumnDef<PaymentIntentProps>[] = [
  {
    id: "Fecha",
    accessorKey: "created_at",
    header: "Fecha",
    minSize: 170,
    cell: (info) => {
      return (
        <div>
          {formatInTimeZone(
            new Date(info.row.original.created_at),
            timeZone,
            "dd/MM/yyyy h:mm a",
            { locale: es }
          )}
        </div>
      );
    },
  },
  {
    id: "Monto",
    accessorKey: "amount",
    header: "Total",
    minSize: 150,
    cell: (info) => {
      return <div>MXN {formatPrice(info.row.original.amount)}</div>;
    },
  },
  {
    id: "Destino",
    accessorKey: "wedding.name",
    header: "Destino",
    minSize: 150,
    cell: (info) => {
      return <div>{info.row.original.wedding.name}</div>;
    },
  },
  {
    id: "Estado",
    accessorKey: "status",
    header: "Estado",
    minSize: 150,
    cell: (info) => {
      if (info.row.original.status === "succeeded") {
        return (
          <div className="flex">
            <span className="min-w-20 flex items-center justify-center bg-success text-background text-xs px-2 py-0.5">
              Completado
            </span>
          </div>
        );
      }
    },
  },
];
