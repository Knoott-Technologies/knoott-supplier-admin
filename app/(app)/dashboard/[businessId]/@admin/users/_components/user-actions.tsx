"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronRight, MoreVertical, Trash2, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { User } from "../page";

export const UserActions = ({
  data,
  businessId,
}: {
  data: User;
  businessId: string;
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRoleChange = async (newRole: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/users/${data.user.id}/role?businessId=${businessId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al cambiar el rol");
      }

      toast("Rol actualizado", {
        description: `El usuario ahora es ${
          newRole === "admin"
            ? "Administrador"
            : newRole === "supervisor"
            ? "Supervisor"
            : "Staff"
        }.`,
      });
      router.refresh();
    } catch (error) {
      toast("Error", {
        description: "No se pudo actualizar el rol del usuario.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/users/${data.user.id}?businessId=${businessId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar el usuario");
      }

      toast("Usuario eliminado", {
        description: "El usuario ha sido eliminado correctamente.",
      });
      router.refresh();
    } catch (error) {
      toast("Error", {
        description: "No se pudo eliminar el usuario.",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={isLoading}>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[180px]">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center">
              <span>Cambiar Rol</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => handleRoleChange("admin")}
                disabled={data.role === "admin"}
                className={cn(
                  data.role === "admin" &&
                    "bg-contrast/10 text-contrast font-medium"
                )}
              >
                <div
                  className={cn("w-2 h-2 rounded-full mr-2", "bg-contrast")}
                />
                Administrador
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleRoleChange("supervisor")}
                disabled={data.role === "supervisor"}
                className={cn(
                  data.role === "supervisor" &&
                    "bg-contrast2/10 text-contrast2 font-medium"
                )}
              >
                <div
                  className={cn("w-2 h-2 rounded-full mr-2", "bg-contrast2")}
                />
                Supervisor
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleRoleChange("staff")}
                disabled={data.role === "staff"}
                className={cn(
                  data.role === "staff" &&
                    "bg-tertiary/10 text-tertiary font-medium"
                )}
              >
                <div
                  className={cn("w-2 h-2 rounded-full mr-2", "bg-tertiary")}
                />
                Staff
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar Usuario
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El usuario será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
