"use client";

import { Button } from "@/components/ui/button";
import type { Order } from "../../page";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, Loader2, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShippingGuideUpload } from "./shipping-guide-upload";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Motivos de rechazo predefinidos
const CANCELLATION_REASONS = [
  {
    value:
      "Lo sentimos, actualmente no contamos con suficiente stock para completar tu pedido.",
    label: "Stock insuficiente",
  },
  {
    value:
      "Hemos detectado un problema con el producto solicitado que nos impide procesarlo correctamente.",
    label: "Problema con el producto",
  },
  {
    value:
      "Este producto se encuentra temporalmente fuera de temporada. Estará disponible próximamente.",
    label: "Producto fuera de temporada",
  },
  {
    value:
      "Detectamos un error en el precio mostrado en nuestro sistema. Lamentamos los inconvenientes.",
    label: "Precio incorrecto en el sistema",
  },
  {
    value:
      "Lamentablemente este producto no está disponible para entrega en tu zona geográfica.",
    label: "No disponible para la zona de entrega",
  },
  {
    value:
      "En este momento nuestra capacidad de producción está al máximo y no podemos procesar más pedidos.",
    label: "Capacidad de producción excedida",
  },
  {
    value: "otro",
    label: "Otro motivo",
  },
];

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
      return "bg-contrast/20 border-confirmation/50";
    case "pending":
      return "bg-primary/20 border-primary/50";
    case "paid":
      return "bg-contrast2/20 border-contrast2/50";
    case "shipped":
      return "bg-tertiary/20 border-tertiary/50";
    case "delivered":
      return "bg-success/20 border-success/50";
    case "canceled":
      return "bg-destructive/20 border-destructive/50";
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
  businessId,
  user,
}: {
  order: Order;
  businessId: string;
  user: User;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedReasonType, setSelectedReasonType] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isCanceling, setIsCanceling] = useState(false);

  // No mostrar acciones para órdenes entregadas o canceladas
  if (order.status === "delivered" || order.status === "canceled") {
    return null;
  }

  const handleAction = async () => {
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
          businessId: businessId,
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

  const handleCancelOrder = async () => {
    // Obtener el motivo de cancelación según la selección
    let finalReason = "";

    if (selectedReasonType === "otro") {
      if (!customReason.trim()) {
        toast.error("Error", {
          description: "Debes proporcionar un motivo para la cancelación",
        });
        return;
      }
      finalReason = customReason.trim();
    } else {
      // Buscar el label del motivo seleccionado
      const selectedReason = CANCELLATION_REASONS.find(
        (reason) => reason.value === selectedReasonType
      );
      if (!selectedReason) {
        toast.error("Error", {
          description: "Debes seleccionar un motivo para la cancelación",
        });
        return;
      }
      finalReason = selectedReason.value;
    }

    setIsCanceling(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          businessId: businessId,
          cancelationReason: finalReason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ha ocurrido un error");
      }

      toast.success("¡Éxito!", {
        description: "Orden cancelada correctamente",
      });

      setIsCancelDialogOpen(false);
      setSelectedReasonType("");
      setCustomReason("");

      // Refrescar la página para mostrar los cambios
      router.refresh();
    } catch (error) {
      console.error("Error al cancelar la orden:", error);
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Ha ocurrido un error inesperado",
      });
    } finally {
      setIsCanceling(false);
    }
  };

  const handleShippingGuideUploaded = async (
    fileUrl: string,
    etaFirst: Date | null,
    etaSecond: Date | null
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/ship`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          businessId: businessId,
          shippingGuideUrl: fileUrl,
          etaFirst: etaFirst ? etaFirst.toISOString() : null,
          etaSecond: etaSecond ? etaSecond.toISOString() : null,
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

  // Renderizar un botón simple para el estado "pending"
  if (order.status === "pending") {
    return (
      <div className="bg-background z-50 sticky bottom-0 w-full mt-auto">
        <div
          className={cn(
            "w-full h-fit p-3 py-2 pb-8 md:pb-2 border-t",
            getStatusActionBannerClass(order.status)
          )}
        >
          <div className="flex justify-end w-full">
            <div className="flex gap-2 w-full justify-end">
              <Button
                className={cn(
                  getStatusButtonClass(order.status),
                  "w-full md:w-auto min-w-[250px] justify-between"
                )}
                variant={"ghost"}
                size="sm"
                disabled={true}
              >
                {getStatusText(order.status)}
                <Loader2 className="animate-spin" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar un botón simple para el estado "paid" que abre directamente el sheet
  if (order.status === "paid") {
    return (
      <>
        <div className="bg-background z-50 sticky bottom-0 w-full mt-auto">
          <div
            className={cn(
              "w-full h-fit p-3 py-2 pb-8 md:pb-2 border-t",
              getStatusActionBannerClass(order.status)
            )}
          >
            <div className="flex justify-end w-full">
              <div className="flex gap-2 w-full justify-end">
                <Button
                  className={cn(
                    getStatusButtonClass(order.status),
                    "w-full md:w-auto min-w-[250px] justify-between"
                  )}
                  variant={"ghost"}
                  size="sm"
                  disabled={isLoading}
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  {getStatusText(order.status)}
                  {isLoading && <Loader2 className="animate-spin" />}
                  {!isLoading && <ArrowRight />}
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
  }

  // Renderizar botones para requires_confirmation con opción de cancelar
  if (order.status === "requires_confirmation") {
    return (
      <>
        <div className="bg-background z-50 sticky bottom-0 w-full mt-auto">
          <div
            className={cn(
              "w-full h-fit p-3 py-2 pb-8 md:pb-2 border-t",
              getStatusActionBannerClass(order.status)
            )}
          >
            <div className="flex justify-end w-full">
              <div className="flex gap-2 w-full justify-end">
                <Button
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  variant="destructive"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => setIsCancelDialogOpen(true)}
                >
                  Rechazar
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className={cn(
                        getStatusButtonClass(order.status),
                        "w-full md:w-auto min-w-[250px] justify-between"
                      )}
                      variant={"ghost"}
                      size="sm"
                      disabled={isLoading}
                    >
                      {getStatusText(order.status)}
                      {isLoading && <Loader2 className="animate-spin" />}
                      {!isLoading && <ArrowRight />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="center"
                    side="top"
                    sideOffset={5}
                    className="w-[--radix-dropdown-menu-trigger-width] bg-background"
                  >
                    <DropdownMenuLabel>
                      ¿Deseas confirmar la acción?
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleAction}
                      disabled={isLoading}
                      className="w-full justify-between cursor-pointer text-success focus:bg-success/10 focus:text-success"
                    >
                      {isLoading && <Loader2 className="animate-spin" />}
                      Confirmar
                      {!isLoading && <Check />}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Cancelar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Diálogo para cancelar orden */}
        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogContent className="p-0">
            <DialogHeader className="p-3 bg-sidebar border-b">
              <DialogTitle>Rechazar orden</DialogTitle>
              <DialogDescription>
                Por favor, indica el motivo por el cual no puedes realizar esta
                orden. Esta información será compartida con el cliente.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 p-3 bg-background">
              <div className="grid gap-2">
                <Label htmlFor="reason-select">Motivo de rechazo</Label>
                <Select
                  value={selectedReasonType}
                  onValueChange={setSelectedReasonType}
                >
                  <SelectTrigger id="reason-select" className="bg-white">
                    <SelectValue placeholder="Selecciona un motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {CANCELLATION_REASONS.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedReasonType === "otro" && (
                <div className="grid gap-2">
                  <Label htmlFor="custom-reason">Especifica el motivo</Label>
                  <Textarea
                    id="custom-reason"
                    placeholder="Escribe aquí el motivo de rechazo..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="min-h-[120px] bg-white"
                  />
                </div>
              )}
            </div>
            <DialogFooter className="sm:justify-between p-3 bg-sidebar border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCancelDialogOpen(false);
                  setSelectedReasonType("");
                  setCustomReason("");
                }}
                disabled={isCanceling}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleCancelOrder}
                disabled={
                  isCanceling ||
                  !selectedReasonType ||
                  (selectedReasonType === "otro" && !customReason.trim())
                }
              >
                {isCanceling ? (
                  <>
                    Procesando...
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    Rechazar orden
                    <X className="h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Renderizar el dropdown para los demás estados
  return (
    <>
      <div className="bg-background z-50 sticky bottom-0 w-full mt-auto">
        <div
          className={cn(
            "w-full h-fit p-3 py-2 pb-8 md:pb-2 border-t",
            getStatusActionBannerClass(order.status)
          )}
        >
          <div className="flex justify-end w-full">
            <div className="flex gap-2 w-full justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className={cn(
                      getStatusButtonClass(order.status),
                      "w-full md:w-auto min-w-[250px] justify-between"
                    )}
                    variant={"ghost"}
                    size="sm"
                    disabled={isLoading}
                  >
                    {getStatusText(order.status)}
                    {isLoading && <Loader2 className="animate-spin" />}
                    {!isLoading && <ArrowRight />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  side="top"
                  sideOffset={5}
                  className="w-[--radix-dropdown-menu-trigger-width] bg-background"
                >
                  <DropdownMenuLabel>
                    ¿Deseas confirmar la acción?
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleAction}
                    disabled={isLoading}
                    className="w-full justify-between cursor-pointer text-success focus:bg-success/10 focus:text-success"
                  >
                    {isLoading && <Loader2 className="animate-spin" />}
                    Confirmar
                    {!isLoading && <Check />}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Cancelar</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
