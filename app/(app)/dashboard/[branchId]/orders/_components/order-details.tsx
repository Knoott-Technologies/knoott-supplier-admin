"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ArrowRight, ChevronDown, Circle } from "lucide-react";
import { Order } from "./columns";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn, formatPrice } from "@/lib/utils";
import { StepperTimeline } from "./stepper-timeline";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { libre } from "@/components/fonts/font-def";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import NumberFlow from "@number-flow/react";
import { Separator } from "@/components/ui/separator";

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const OrderDetails = ({ order }: { order: Order }) => {
  const isMobile = useIsMobile();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="font-normal" variant={"ghost"} size={"sm"}>
          Detalles <ArrowRight className="!size-3.5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "[&>button]:hidden p-0 bg-sidebar sm:max-w-lg",
          isMobile && "h-[90dvh] max-h-[90dvh]"
        )}
      >
        <div className="flex h-full w-full flex-col bg-background">
          <SheetHeader className="p-3 bg-sidebar border-b text-start">
            <div className="w-full h-fit items-start justify-between flex">
              <span className="flex-1 items-start justify-start flex flex-col">
                <SheetTitle>Detalles de la orden #{order.id}</SheetTitle>
                <SheetDescription>
                  Visualiza los detalles de la orden, incluyendo la información
                  de envío, etc.
                </SheetDescription>
              </span>
              <Badge
                className={cn(
                  "shrink-0",
                  order.status === "created" &&
                    "bg-background text-muted-foreground hover:bg-background border-border",
                  order.status === "requires_confirmation" &&
                    "bg-contrast/20 text-contrast hover:bg-contrast/10",
                  order.status === "pending" &&
                    "bg-primary/20 text-amber-800 hover:bg-primary/10",
                  order.status === "delivered" &&
                    "bg-success/20 text-success hover:bg-success/10",
                  order.status === "shipped" &&
                    "bg-tertiary/20 text-tertiary border hover:bg-tertiary/10 hover:text-tertiary",
                  order.status === "canceled" &&
                    "bg-destructive/20 text-destructive hover:bg-destructive/10"
                )}
              >
                {order.status === "created" && "Orden creada"}
                {order.status === "requires_confirmation" &&
                  "Requiere confirmación"}
                {order.status === "pending" && "Pendiente"}
                {order.status === "delivered" && "Entregado"}
                {order.status === "shipped" && "En tránsito"}
                {order.status === "canceled" && "Cancelado"}
              </Badge>
            </div>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto bg-background p-3">
            {(order.status !== "canceled" && (
              <Collapsible defaultOpen className="border group/collapsible">
                <CollapsibleTrigger asChild>
                  <span className="w-full h-fit items-center justify-between flex gap-y-0 p-3 bg-sidebar cursor-pointer">
                    <span className="flex flex-col items-start justify-start gap-y-0">
                      <h3 className="text-sm font-semibold">
                        {order.status === "created" && (
                          <span className="flex items-center justify-start gap-x-1">
                            <Circle className="!size-2 fill-muted-foreground text-muted-foreground" />
                            Orden creada por el cliente
                          </span>
                        )}
                        {order.status === "requires_confirmation" && (
                          <span className="flex items-center justify-start gap-x-1">
                            <Circle className="!size-2 fill-contrast text-contrast" />
                            Requiere aprobación del negocio
                          </span>
                        )}
                        {order.status === "pending" && (
                          <span className="flex items-center justify-start gap-x-1">
                            <Circle className="!size-2 fill-primary text-primary" />
                            Envío de pago pendiente
                          </span>
                        )}
                        {order.status === "shipped" && (
                          <span className="flex items-center justify-start gap-x-1">
                            <Circle className="!size-2 fill-tertiary text-tertiary" />
                            Orden en tránsito
                          </span>
                        )}
                        {order.status === "delivered" && (
                          <span className="flex items-center justify-start gap-x-1">
                            <Circle className="!size-2 fill-success text-success" />
                            Orden entregada en domicilio
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Ver línea del tiempo de la orden
                      </p>
                    </span>
                    <ChevronDown className="ml-auto size-4 transition-transform duration-300 ease-in-out flex group-data-[state=open]/collapsible:-rotate-90" />
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent className="w-full bg-background p-3 border-t overflow-hidden transition-all duration-300 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                  <StepperTimeline order={order} />
                </CollapsibleContent>
              </Collapsible>
            )) || (
              <div className="w-full flex flex-col gap-y-2 items-start justify-start p-3 bg-destructive/10 text-destructive border border-destructive">
                {(order.canceled_at && (
                  <h3 className="text-sm font-semibold">
                    Orden cancelada el día{" "}
                    {formatInTimeZone(
                      order.canceled_at,
                      timeZone,
                      "PPP 'a las' hh:mm aa",
                      { locale: es }
                    )}
                  </h3>
                )) || (
                  <h3 className="text-sm font-semibold">
                    Esta orden ha sido cancelada
                  </h3>
                )}
                {order.cancelation_reason && (
                  <span>
                    <p className="text-sm font-medium text-foreground">
                      Motivo de cancelación:
                    </p>
                    <p className="text-sm text-destructive/80">
                      {order.cancelation_reason}
                    </p>
                  </span>
                )}
              </div>
            )}
            <div className="w-full flex flex-col gap-y-0 items-start justify-start">
              <span className="w-full h-fit items-center justify-between flex gap-y-0 p-3 bg-sidebar border">
                <span className="flex flex-col items-start justify-start gap-y-0">
                  <h3 className="text-sm font-semibold">Dirección de envío</h3>
                  <p className="text-xs text-muted-foreground">
                    Esta es la dirección de envío de la orden
                  </p>
                </span>
              </span>
              <div className="w-full flex flex-col gap-4 p-3 border-t-0 border">
                <span className="w-full flex flex-col gap-y-1">
                  <p className="text-sm font-semibold">
                    {order.address.tag || "Destino"}:
                  </p>
                  <p
                    title={
                      order.address.street_address +
                      ", " +
                      order.address.city +
                      ", " +
                      order.address.postal_code +
                      ", " +
                      order.address.state +
                      ", " +
                      order.address.country
                    }
                    className="text-sm line-clamp-2 font-medium text-muted-foreground"
                  >
                    {order.address.street_address +
                      ", " +
                      order.address.city +
                      ", " +
                      order.address.postal_code +
                      ", " +
                      order.address.state +
                      ", " +
                      order.address.country}
                  </p>
                </span>
                {order.address.additional_notes && (
                  <span className="w-full flex flex-col gap-y-1">
                    <p className="text-sm font-semibold">Notas adicionales:</p>
                    <p
                      title={order.address.additional_notes}
                      className="text-sm line-clamp-2 font-medium text-muted-foreground"
                    >
                      {order.address.additional_notes}
                    </p>
                  </span>
                )}
              </div>
            </div>
            <div className="w-full flex flex-col gap-y-0 items-start justify-start">
              <span className="w-full h-fit items-center justify-between flex gap-y-0 p-3 bg-sidebar border">
                <span className="flex flex-col items-start justify-start gap-y-0">
                  <h3 className="text-sm font-semibold">Artículo</h3>
                  <p className="text-xs text-muted-foreground">
                    El artículo que contiene la orden
                  </p>
                </span>
              </span>
              <div className="w-full flex flex-col gap-4 p-3 border-t-0 border">
                <span className="w-full grid grid-cols-[1fr_4fr] gap-4">
                  <div className="w-full flex-1 aspect-[3/4] relative overflow-hidden bg-background">
                    {order.product.product_info.images_url[0] && (
                      <Image
                        src={order.product.product_info.images_url[0]}
                        alt={order.product.product_info.short_name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 w-full items-start justify-between flex flex-col gap-y-1">
                    <span className="w-full items-start justify-start flex flex-col gap-y-0">
                      <p
                        className={cn(
                          "text-xs text-foreground",
                          libre.className
                        )}
                      >
                        {order.product.product_info.brand.name}
                      </p>
                      <p className="text-sm text-foreground font-semibold line-clamp-1">
                        {order.product.product_info.short_name}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {order.product.product_info.description}
                      </p>
                    </span>
                    <span className="w-full items-center justify-between flex">
                      <p className="text-sm">{order.product.variant.name}</p>
                      <p className="text-sm font-semibold text-foreground">
                        MXN {formatPrice(order.product.variant.price!)}
                      </p>
                    </span>
                  </div>
                </span>
              </div>
            </div>
            <div className="w-full flex flex-col gap-y-0 items-start justify-start">
              <span className="w-full h-fit items-center justify-between flex gap-y-0 p-3 bg-sidebar border">
                <span className="flex flex-col items-start justify-start gap-y-0">
                  <h3 className="text-sm font-semibold">Resumen</h3>
                  <p className="text-xs text-muted-foreground">
                    Resumen de la orden
                  </p>
                </span>
              </span>
              <div className="w-full flex flex-col gap-2 p-3 border-t-0 border">
                <span className="w-full flex justify-between items-center gap-y-1">
                  <p className="text-sm text-muted-foreground font-semibold">
                    Subtotal
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    MXN {formatPrice(order.total_amount)}
                  </p>
                </span>
                <span className="w-full flex justify-between items-center gap-y-1">
                  <p className="text-sm text-muted-foreground font-semibold">
                    Comisión por venta
                  </p>
                  <p className="text-sm font-semibold text-destructive">
                    - MXN {formatPrice(order.knoott_received_amount)}
                  </p>
                </span>
                <Separator />
                <span className="w-full flex justify-between items-center gap-y-1">
                  <p className="text-sm text-muted-foreground font-semibold">
                    {["pending", "created", "requires_confirmation"].includes(
                      order.status
                    )
                      ? "Total a recibir"
                      : ["delivered", "shipped"].includes(order.status)
                      ? "Total recibido"
                      : "Total devuelto"}
                  </p>
                  <p className="text-base font-semibold">
                    MXN {formatPrice(order.povider_received_amount)}
                  </p>
                </span>
              </div>
            </div>
          </div>
          <SheetFooter className="w-full h-fit bg-sidebar border-t p-3 pb-8 md:pb-3 gap-2">
            <SheetClose asChild>
              <Button variant={"outline"} className="w-full">
                Cerrar
              </Button>
            </SheetClose>
            <Button variant={"defaultBlack"} className="w-full">
              Ver página de orden <ArrowRight />
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
};
