"use client";

import { Database } from "@/database.types";
import { ColumnDef } from "@tanstack/react-table";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import NumberFlow from "@number-flow/react";

export type TransactionWallet =
  Database["public"]["Tables"]["provider_business_transactions"]["Row"];

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const columns: ColumnDef<TransactionWallet>[] = [
  {
    id: "Referencia",
    accessorKey: "reference",
    header: "Referencia",
    minSize: 180,
    cell: (info) => {
      return (
        <div className="text-sm">
          {info.row.original.reference || "Sin Referencia"}
        </div>
      );
    },
  },
  {
    id: "Fecha",
    accessorKey: "created_at",
    header: "Fecha",
    minSize: 180, // Ancho mínimo para mostrar la fecha con formato
    cell: (info) => {
      return (
        <div>
          {formatInTimeZone(
            new Date(info.row.original.created_at),
            timeZone,
            "PPP hh:mm a",
            { locale: es }
          )}
        </div>
      );
    },
  },
  {
    id: "Monto",
    accessorKey: "amount",
    header: "Monto",
    minSize: 150, // Espacio para cantidades con formato
    cell: (info) => {
      return (
        <div className="text-success font-semibold">
          <NumberFlow
            value={info.row.original.amount / 100}
            format={{
              style: "currency",
              currency: "MXN",
              currencyDisplay: "code",
            }}
          />
        </div>
      );
    },
  },
  {
    id: "Descripción",
    accessorKey: "description",
    header: "Concepto",
    minSize: 320,
    cell: (info) => {
      return <div>{info.row.original.description || "Sin Descripción"}</div>;
    },
  },
  {
    id: "Estatus",
    accessorKey: "status",
    header: "Estatus",
    minSize: 80,
    size: 80,
    cell: (info) => {
      if (info.row.original.status === "pending") {
        return (
          <div className="flex">
            <span className="min-w-20 flex items-center justify-center bg-background text-foreground border px-2 text-xs py-0.5">
              En proceso
            </span>
          </div>
        );
      }

      if (info.row.original.status === "canceled") {
        return (
          <div className="flex">
            <span className="min-w-20 flex items-center justify-center bg-destructive text-destructive-foreground px-2 text-xs py-0.5">
              Cancelado
            </span>
          </div>
        );
      }

      return (
        <div className="flex">
          <span className="min-w-20 flex items-center justify-center bg-success text-background text-xs px-2 py-0.5">
            Completado
          </span>
        </div>
      );
    },
  },
  {
    id: "Destino",
    header: "Cuenta destino",
    accessorKey: "business_id",
    minSize: 100,
    cell: (info) => {
      return <div>Cuenta CLABE</div>;
    },
  },
];
