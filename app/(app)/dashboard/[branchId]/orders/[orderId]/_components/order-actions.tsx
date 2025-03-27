"use client";

import { Button } from "@/components/ui/button";
import type { Order } from "../../page";
import { cn } from "@/lib/utils";
import { ArrowRight, Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShippingGuideUpload } from "./shipping-guide-upload";
import { toast } from "sonner";

const getStatusText = (status: string): string => {
  switch (status) {
    case "requires_confirmation":
      return "Aceptar orden";
    case "pending":
      return "Esperando pago";
    case "paid":
      return "Enviar orden";
    case "shipped":
      return "Marcar como entregado";
    case "delivered":
      return "Entregado";
    case "canceled":
      return "Cancelado";
    default:
      return status;
  }
};

const getStatusActionBannerClass = (status: string) => {
  switch (status) {
    case "requires_confirmation":
      return "bg-contrast/20";
    case "pending":
      return "bg-primary/20";
    case "paid":
      return "bg-contrast2/20";
    case "shipped":
      return "bg-tertiary/20";
    case "delivered":
      return "bg-success/20";
    case "canceled":
      return "bg-destructive/20";
    default:
      return "bg-background";
  }
};

const getStatusButtonClass = (status: string) => {
  switch (status) {
    case "requires_confirmation":
      return "bg-contrast text-background hover:bg-contrast/80 hover:text-background";
    case "pending":
      return "bg-primary text-foreground hover:bg-primary/80 hover:text-foreground";
    case "paid":
      return "bg-contrast2 text-background hover:bg-contrast2/80 hover:text-background";
    case "shipped":
      return "bg-tertiary text-background hover:bg-tertiary/80 hover:text-background";
    case "delivered":
      return "bg-success text-background hover:bg-success/80 hover:text-background";
    case "canceled":
      return "bg-destructive text-background hover:bg-destructive/80 hover:text-background";
    default:
      return "bg-background";
  }
};

export const OrderActions = ({
  order,
  branchId,
  user,
}: {
  order: Order;
  branchId: string;
  user: User;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // No mostrar acciones para órdenes entregadas o canceladas
  if (order.status === "delivered" || order.status === "canceled") {
    return null;
  }

  const handleAction = async () => {
    // Si el estado es "paid", mostrar el modal de carga de archivos
    if (order.status === "paid") {
      setIsUploadModalOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      let endpoint = "";
      let successMessage = "";

      switch (order.status) {
        case "requires_confirmation":
          endpoint = `/api/orders/${order.id}/confirm`;
          successMessage = "Orden confirmada correctamente";
          break;
        case "shipped":
          endpoint = `/api/orders/${order.id}/deliver`;
          successMessage = "Orden marcada como entregada";
          break;
        default:
          setIsLoading(false);
          return;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          branchId: branchId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ha ocurrido un error");
      }

      toast.success("¡Éxito!", {
        description: successMessage,
      });

      // Refrescar la página para mostrar los cambios
      router.refresh();
    } catch (error) {
      console.error("Error al procesar la acción:", error);
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Ha ocurrido un error inesperado",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShippingGuideUploaded = async (fileUrl: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/ship`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          branchId: branchId,
          shippingGuideUrl: fileUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ha ocurrido un error");
      }

      toast.success("¡Éxito!", {
        description: "Orden marcada como enviada correctamente",
      });

      // Refrescar la página para mostrar los cambios
      router.refresh();
    } catch (error) {
      console.error("Error al procesar el envío:", error);
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Ha ocurrido un error inesperado",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-background z-50 border-t sticky bottom-0 w-full mt-auto">
        <div
          className={cn(
            "w-full h-fit p-3 py-2 pb-8 md:pb-2",
            getStatusActionBannerClass(order.status)
          )}
        >
          <div className="flex justify-end w-full">
            <div className="flex gap-2 w-full justify-end">
              <Button
                className={cn(getStatusButtonClass(order.status), "w-full md:w-auto")}
                variant={"ghost"}
                size="sm"
                disabled={order.status === "pending" || isLoading}
                onClick={handleAction}
              >
                {(isLoading || order.status === "pending") && (
                  <Loader2 className=" animate-spin" />
                )}
                {getStatusText(order.status)}
                {!isLoading && order.status !== "pending" && (
                  <ArrowRight />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de carga de guía de envío */}
      <ShippingGuideUpload
        orderId={order.id}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleShippingGuideUploaded}
      />
    </>
  );
};
