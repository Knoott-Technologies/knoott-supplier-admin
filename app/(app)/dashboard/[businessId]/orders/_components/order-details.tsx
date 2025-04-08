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
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  ChevronDown,
  ChevronRight,
  Circle,
  ExternalLink,
  PanelBottomOpen,
  PanelRightOpen,
  X,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn, formatPrice } from "@/lib/utils";
import { StepperTimeline } from "./stepper-timeline";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Image from "next/image";
import { libre } from "@/components/fonts/font-def";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Order } from "../page";

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const getGradientColor = (status: string) => {
  switch (status) {
    case "requires_confirmation":
      return "from-contrast/25 to-background";
    case "pending":
      return "from-primary/25 to-background";
    case "paid":
      return "from-contrast2/25 to-background";
    case "shipped":
      return "from-tertiary/25 to-background";
    case "delivered":
      return "from-success/25 to-background";
    case "canceled":
      return "from-destructive/25 to-background";
    default:
      return "from-background to-background";
  }
};

export const OrderDetails = ({ order }: { order: Order }) => {
  const isMobile = useIsMobile();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="font-normal text-muted-foreground"
          variant={"ghost"}
          size={"icon"}
        >
          <PanelRightOpen className="!size-3.5 hidden md:flex" />
          <PanelBottomOpen className="!size-3.5 md:hidden" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "[&>button]:hidden p-0 bg-sidebar sm:max-w-lg",
          isMobile && "h-[100dvh] max-h-[100dvh] border-t-0"
        )}
      >
        <div className="flex h-full w-full flex-col bg-background">
          <SheetHeader className="p-3 bg-sidebar border-b flex flex-row justify-between items-start text-start space-y-0 gap-5">
            <div className="flex-1 items-start justify-start flex flex-col gap-y-1.5">
              <SheetTitle>Detalles de la orden #{order.id}</SheetTitle>
              <SheetDescription>
                Visualiza los detalles de la orden, incluyendo la información de
                envío, etc.
              </SheetDescription>
            </div>
            <SheetClose asChild>
              <Button
                className="font-normal text-muted-foreground md:hidden"
                variant={"outline"}
                size={"icon"}
              >
                <X className="!size-3.5" />
              </Button>
            </SheetClose>
          </SheetHeader>
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col gap-4 overflow-auto bg-gradient-to-b relative from-0% to-25% lg:to-15%",
              getGradientColor(order.status)
            )}
          >
            {/* <div
              className={cn(
                "absolute inset-x-0 h-[10%] z-0 ",
                
              )}
            /> */}
            {order.status == "requires_confirmation" && (
              <Link
                href={`/dashboard/${order.provider_business_id}/orders/${order.id}#confirmation`}
                className="bg-background sticky top-0 z-10 border-b"
              >
                <div className="bg-contrast/10 p-3 sticky top-0 z-10 text-contrast">
                  <div className="flex justify-between gap-2">
                    <div className="flex grow gap-3">
                      <AlertTriangle
                        className="mt-0.5 shrink-0 size-4"
                        aria-hidden="true"
                      />
                      <div className="flex grow justify-between gap-2 items-center">
                        <p className="text-sm">
                          Necesitamos confirmación de tu negocio para continuar
                        </p>
                        <ChevronRight
                          className="ms-1 size-4 -mt-0.5 inline-flex transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )}
            {order.status === "canceled" && order.canceled_at && (
              <div className="bg-background sticky top-0 border-b border-b-destructive z-10">
                <div className="bg-destructive/20 p-3 sticky top-0 z-10 text-destructive">
                  <div className="flex justify-between gap-2">
                    <div className="flex grow gap-3">
                      <Ban
                        className="mt-0.5 shrink-0 size-4"
                        aria-hidden="true"
                      />
                      <div className="flex grow justify-between gap-2 items-center">
                        <div className="flex flex-col grow justify-start items-start">
                          <p className="text-sm">
                            Esta orden ha sido cancelada el día{" "}
                            {formatInTimeZone(
                              order.canceled_at,
                              timeZone,
                              "PPP 'a las' hh:mm aa",
                              { locale: es }
                            )}
                          </p>
                          {order.cancelation_reason && (
                            <p className="text-xs">
                              Motivo de cancelación: {order.cancelation_reason}
                            </p>
                          )}
                        </div>
                        <ChevronRight
                          className="ms-1 size-4 shrink-0 -mt-0.5 inline-flex transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="w-full h-fit items-start justify-start flex flex-col gap-y-4 p-3 z-[1]">
              {order.status !== "canceled" && (
                <Collapsible
                  defaultOpen
                  className="border group/collapsible w-full"
                >
                  <CollapsibleTrigger asChild>
                    <span className="w-full h-fit items-center justify-between flex gap-y-0 p-3 bg-sidebar cursor-pointer">
                      <span className="flex flex-col items-start justify-start gap-y-0">
                        <h3 className="text-sm font-semibold">
                          {order.status === "requires_confirmation" && (
                            <span className="flex items-center justify-start gap-x-1">
                              <Circle className="!size-2 animate-pulse fill-contrast text-contrast" />
                              Esperando confirmación del negocio
                            </span>
                          )}
                          {order.status === "pending" && (
                            <span className="flex items-center justify-start gap-x-1">
                              <Circle className="!size-2 animate-pulse fill-primary text-primary" />
                              Procesando pago al comercio
                            </span>
                          )}
                          {order.status === "paid" && (
                            <span className="flex items-center justify-start gap-x-1">
                              <Circle className="!size-2 animate-pulse fill-contrast2 text-contrast2" />
                              Hemos enviado el pago
                            </span>
                          )}
                          {order.status === "shipped" && (
                            <span className="flex items-center justify-start gap-x-1">
                              <Circle className="!size-2 animate-pulse fill-tertiary text-tertiary" />
                              Preparando envío
                            </span>
                          )}
                          {order.status === "delivered" && (
                            <span className="flex items-center justify-start gap-x-1">
                              <Circle className="!size-2 fill-success text-success" />
                              Pedido entregado
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
              )}
              <div className="w-full flex flex-col gap-y-0 items-start justify-start">
                <span className="w-full h-fit items-center justify-between flex gap-y-0 p-3 bg-sidebar border">
                  <span className="flex flex-col items-start justify-start gap-y-0">
                    <h3 className="text-sm font-semibold">
                      Dirección de envío
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Esta es la dirección de envío de la orden
                    </p>
                  </span>
                </span>
                <div className="w-full flex flex-col gap-4 p-3 border-t-0 border bg-background">
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
                  <span className="w-full flex flex-col gap-y-1">
                    <p className="text-sm font-semibold">Destinatario:</p>
                    <p
                      title={
                        order.client.first_name + " " + order.client.last_name
                      }
                      className="text-sm truncate font-medium text-muted-foreground"
                    >
                      {order.client.first_name + " " + order.client.last_name}
                    </p>
                  </span>
                  {order.shipping_guide_url && (
                    <span className="w-full flex flex-col gap-y-1">
                      <p className="text-sm font-semibold">Guía de envío:</p>
                      <Link
                        href={order.shipping_guide_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm line-clamp-2 font-medium text-tertiary hover:underline hover:text-tertiary/80 flex items-center gap-x-1.5"
                      >
                        Ver guía <ExternalLink className="size-3.5" />
                      </Link>
                    </span>
                  )}
                  {order["eta-first"] && order["eta-second"] && (
                    <span className="w-full flex flex-col gap-y-1">
                      <p className="text-sm font-semibold">
                        Fecha aproximada de entrega:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatInTimeZone(order["eta-first"], timeZone, "PPP", {
                          locale: es,
                        })}{" "}
                        -{" "}
                        {formatInTimeZone(
                          order["eta-second"],
                          timeZone,
                          "PPP",
                          { locale: es }
                        )}
                      </p>
                    </span>
                  )}
                  {order.address.additional_notes && (
                    <span className="w-full flex flex-col gap-y-1">
                      <p className="text-sm font-semibold">
                        Notas adicionales:
                      </p>
                      <p
                        title={order.address.additional_notes}
                        className="text-sm line-clamp-2 font-medium text-muted-foreground"
                      >
                        {order.address.additional_notes}
                      </p>
                    </span>
                  )}
                  <span className="w-full flex flex-col gap-y-1">
                    <p className="text-sm font-semibold">
                      Información de contacto:
                    </p>
                    <p className="text-sm line-clamp-2 font-medium text-muted-foreground">
                      {order.client.phone_number}
                    </p>
                  </span>
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
                <div className="w-full flex flex-col gap-4 p-3 border-t-0 border bg-background">
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
                        <p className="text-sm">
                          {order.product.variant.variant_list.name}:{" "}
                          {order.product.variant.name}
                        </p>
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
                <div className="w-full flex flex-col gap-2 p-3 border-t-0 border bg-background">
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
                        : ["delivered", "shipped", "paid"].includes(
                            order.status
                          )
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
          </div>
          <SheetFooter className="w-full h-fit bg-sidebar border-t p-3 pb-8 md:pb-3 gap-2">
            <SheetClose asChild>
              <Button variant={"outline"} className="w-full">
                Cerrar
              </Button>
            </SheetClose>
            <Button asChild variant={"defaultBlack"} className="w-full">
              <Link
                href={`/dashboard/${order.provider_business_id}/orders/${order.id}`}
              >
                Ver página de orden <ArrowRight />
              </Link>
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
};
