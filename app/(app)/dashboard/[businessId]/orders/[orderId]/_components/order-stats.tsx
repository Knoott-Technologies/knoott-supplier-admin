"use client";

import React from "react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import {
  Circle,
  AlertCircle,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  CreditCard,
} from "lucide-react";
import { Order } from "../../page";

const getStatusLabel = (status: string): string => {
  switch (status) {
    case "requires_confirmation":
      return "Requiere confirmación";
    case "pending":
      return "Pendiente";
    case "paid":
      return "Pagado";
    case "shipped":
      return "En tránsito";
    case "delivered":
      return "Entregado";
    case "canceled":
      return "Cancelado";
    default:
      return status;
  }
};

export const OrderStats = ({ order }: { order: Order }) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Determinar qué fechas mostrar basado en el estado de la orden
  const getRelevantDates = () => {
    const dates = [
      {
        label: "Creado el",
        date: order.created_at,
        icon: (
          <Circle className="size-1.5 fill-current text-current opacity-50" />
        ),
      },
    ];

    if (order.verified_at) {
      dates.push({
        label: "Verificado el",
        date: order.verified_at,
        icon: <Circle className="size-1.5 fill-success text-success" />,
      });
    }

    if (order.paid_at) {
      dates.push({
        label: "Pagado el",
        date: order.paid_at,
        icon: <Circle className="size-1.5 fill-contrast2 text-contrast2" />,
      });
    }

    if (order.shipped_at) {
      dates.push({
        label: "Enviado el",
        date: order.shipped_at,
        icon: <Circle className="size-1.5 fill-tertiary text-tertiary" />,
      });
    }

    if (order.delivered_at) {
      dates.push({
        label: "Entregado el",
        date: order.delivered_at,
        icon: <Circle className="size-1.5 fill-success text-success" />,
      });
    }

    if (order.canceled_at) {
      dates.push({
        label: "Cancelado el",
        date: order.canceled_at,
        icon: <Circle className="size-1.5 fill-destructive text-destructive" />,
      });
    }

    return dates;
  };

  const relevantDates = getRelevantDates();

  return (
    <div className="w-full h-fit items-stretch overflow-auto no-scrollbar">
      <div className="w-fit h-fit items-stretch flex">
        <span className="flex flex-col gap-y-1 items-start justify-start flex-1 pr-2.5 py-1">
          <p className="text-sm font-semibold">Estado:</p>
          <Badge
            variant={"secondary"}
            className={cn(
              "cursor-default gap-x-1.5 whitespace-nowrap",
              order.status === "requires_confirmation" &&
                "bg-contrast/20 text-contrast hover:bg-contrast/20",
              order.status === "pending" &&
                "bg-primary/20 text-amber-800 hover:bg-primary/20",
              order.status === "paid" &&
                "bg-contrast2/20 text-contrast2 hover:bg-contrast2/20",
              order.status === "shipped" &&
                "bg-tertiary/20 text-tertiary border hover:bg-tertiary/20",
              order.status === "delivered" &&
                "bg-success/20 text-success hover:bg-success/20",
              order.status === "canceled" &&
                "bg-destructive/20 text-destructive hover:bg-destructive/20"
            )}
          >
            {getStatusLabel(order.status)}
          </Badge>
        </span>
        {relevantDates.map((dateInfo, index) => (
          <React.Fragment key={dateInfo.label}>
            <span className="flex flex-col gap-y-1 items-start justify-start flex-1 px-2.5 py-1 first:border-l-0 border-l last:pr-0">
              <p className="text-sm font-semibold">{dateInfo.label}:</p>
              <Badge
                variant={"outline"}
                className="bg-sidebar whitespace-nowrap hover:bg-sidebar/80 cursor-default text-muted-foreground gap-x-1"
              >
                {dateInfo.icon}
                {formatInTimeZone(dateInfo.date, timeZone, "PPP hh:mm aa", {
                  locale: es,
                })}
              </Badge>
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
