"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "../page";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "./user-actions";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "user.first_name",
    header: "Nombre",
  },
  {
    accessorKey: "user.last_name",
    header: "Apellido",
  },
  {
    accessorKey: "user.email",
    header: "Correo",
  },
  {
    accessorKey: "user.phone_number",
    header: "Teléfono",
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) => {
      return (
        <Badge
          variant={"secondary"}
          className={cn(
            "pointer-events-none",
            row.original.role === "admin"
              ? "text-contrast bg-contrast/10 hover:text-contrast hover:bg-contrast/10"
              : row.original.role === "supervisor"
              ? "text-contrast2 bg-contrast2/10 hover:text-contrast2 hover:bg-contrast2/10"
              : "text-tertiary bg-tertiary/10 hover:text-tertiary hover:bg-tertiary/10"
          )}
        >
          {row.original.role === "admin"
            ? "Administrador"
            : row.original.role === "supervisor"
            ? "Supervisor"
            : "Staff"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <UserActions
          businessId={row.original.business_id}
          user={row.original}
        />
      );
    },
  },
];
