"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Order } from "../../page";
import { cn, formatPrice } from "@/lib/utils";
import Image from "next/image";
import { libre } from "@/components/fonts/font-def";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const OrderInfo = ({ order }: { order: Order }) => {
  return (
    <Card className="w-full flex flex-col flex-1">
      <CardHeader className="bg-background">
        <CardTitle>Información de la orden</CardTitle>
        <CardDescription>
          Revisa toda la información de la orden.
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-sidebar flex flex-col gap-y-4 items-start justify-start">
        <div className="w-full h-fit grid grid-cols-1 lg:grid-cols-2 gap-4 [&>*]:h-full">
          <Card className="w-full flex-1 flex flex-col">
            <CardHeader>
              <span className="gap-y-0">
                <p className="text-base font-semibold">Dirección de envío</p>
                <p className="text-sm text-muted-foreground">
                  Esta es la dirección de envío de la orden
                </p>
              </span>
            </CardHeader>
            <CardContent className="w-full bg-sidebar flex flex-col gap-y-4 flex-1 h-full">
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
              <div className="w-full h-fit items-start grid grid-cols-1 lg:grid-cols-2 gap-4">
                <span className="w-full flex flex-col gap-y-1">
                  <p className="text-sm font-semibold">
                    Información de contacto:
                  </p>
                  <p className="text-sm line-clamp-2 font-medium text-muted-foreground">
                    {order.client.phone_number}
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
              </div>
              <div className="w-full h-fit items-start grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                      {formatInTimeZone(order["eta-second"], timeZone, "PPP", {
                        locale: es,
                      })}
                    </p>
                  </span>
                )}
              </div>
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
            </CardContent>
          </Card>
          <Card className="w-full flex-1 flex flex-col">
            <CardHeader>
              <span className="gap-y-0">
                <p className="text-base font-semibold">Artículo</p>
                <p className="text-sm text-muted-foreground">
                  El artículo que contiene la orden
                </p>
              </span>
            </CardHeader>
            <CardContent className="w-full bg-sidebar flex flex-col gap-y-4 flex-1 h-full">
              <span className="w-full flex gap-4 h-fit">
                <div className="w-full max-w-[120px] aspect-[3/4] relative overflow-hidden bg-background">
                  {order.product.product_info.images_url[0] && (
                    <Image
                      src={
                        order.product.product_info.images_url[0] ||
                        "/placeholder.svg"
                      }
                      alt={order.product.product_info.short_name}
                      fill
                      className="object-contain"
                    />
                  )}
                </div>
                <div className="flex-1 shrink-0 w-full items-start justify-between flex flex-col gap-y-1">
                  <span className="w-full items-start justify-start flex flex-col gap-y-0">
                    <p
                      className={cn("text-xs text-foreground", libre.className)}
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
                    {order.product.variant.name !== "Default" && (
                      <p className="text-sm">
                        {order.product.variant.variant_list.name}:{" "}
                        {order.product.variant.name}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-foreground">
                      MXN {formatPrice(order.product.variant.price!)}
                    </p>
                  </span>
                </div>
              </span>
            </CardContent>
          </Card>
        </div>
        <Card className="w-full">
          <CardHeader>
            <span className="gap-y-0">
              <p className="text-base font-semibold">Resumen</p>
              <p className="text-sm text-muted-foreground">
                Resumen de la orden
              </p>
            </span>
          </CardHeader>
          <CardContent className="w-full h-fit items-start justify-start flex flex-col gap-y-4 bg-sidebar">
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
                  : ["delivered", "shipped", "paid"].includes(order.status)
                    ? "Total recibido"
                    : "Total devuelto"}
              </p>
              <p className="text-base font-semibold">
                MXN {formatPrice(order.povider_received_amount)}
              </p>
            </span>
          </CardContent>
        </Card>
        {order.status === "canceled" && order.cancelation_reason && (
          <Card className="w-full border-destructive">
            <CardHeader className="border-destructive">
              <span className="gap-y-0">
                <p className="text-base font-semibold">Motivo de cancelación</p>
                <p className="text-sm text-muted-foreground">
                  Motivo de cancelación de la orden
                </p>
              </span>
            </CardHeader>
            <CardContent className="w-full h-fit items-start justify-start flex flex-col gap-y-4 bg-destructive/5">
              <p className="text-sm text-destructive">
                {order.cancelation_reason}
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
