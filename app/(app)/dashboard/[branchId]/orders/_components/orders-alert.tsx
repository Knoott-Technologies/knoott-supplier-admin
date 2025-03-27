"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, ChevronRight, Clock } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { Database } from "@/database.types";

export function OrdersAlerts({
  orders,
}: {
  orders: Database["public"]["Tables"]["wedding_product_orders"]["Row"][];
}) {
  const now = new Date();

  // Find orders that require confirmation and are older than 1 day
  const unconfirmedOrders = orders.filter((order) => {
    if (order.status === "requires_confirmation") {
      const createdDate = parseISO(order.created_at);
      const daysSinceCreation = differenceInDays(now, createdDate);
      return daysSinceCreation >= 1;
    }
    return false;
  });

  // Find orders that are confirmed but not shipped after 2 days
  const unshippedOrders = orders.filter((order) => {
    if (order.status === "pending" && order.confirmed_at) {
      const confirmedDate = parseISO(order.confirmed_at);
      const daysSinceConfirmation = differenceInDays(now, confirmedDate);
      return daysSinceConfirmation >= 2;
    }
    return false;
  });

  // If no alerts, don't render the component
  if (unconfirmedOrders.length === 0 && unshippedOrders.length === 0) {
    return null;
  }

  return (
    <>
      {unconfirmedOrders.length > 0 && (
        <div className="bg-background sticky top-12 z-20 border-b w-full">
          <div className="bg-destructive/10 p-3 sticky top-0 z-10 text-destructive w-full">
            <div className="flex justify-between gap-2">
              <div className="flex grow gap-3">
                <AlertTriangle
                  className="mt-0.5 shrink-0 size-4"
                  aria-hidden="true"
                />
                <div className="flex grow justify-between gap-2 items-center">
                  <span className="flex flex-col items-start justify-start gap-y-0">
                    <h3 className="text-sm font-semibold">
                      Órdenes sin confirmar
                    </h3>
                    <p className="text-xs">
                      Hay {unconfirmedOrders.length}{" "}
                      {unconfirmedOrders.length === 1 ? "orden" : "órdenes"} sin
                      confirmar por más de 1 día. Por favor, confirma estas
                      órdenes lo antes posible.
                    </p>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {unshippedOrders.length > 0 && (
        <div className="bg-background sticky top-12 z-20 border-b w-full">
          <div className="bg-primary/10 p-3 sticky top-0 z-10 text-amber-700 w-full">
            <div className="flex justify-between gap-2">
              <div className="flex grow gap-3">
                <AlertTriangle
                  className="mt-0.5 shrink-0 size-4"
                  aria-hidden="true"
                />
                <div className="flex grow justify-between gap-2 items-center">
                  <span className="flex flex-col items-start justify-start gap-y-0">
                    <h3 className="text-sm font-semibold">
                      Órdenes pendientes de envío
                    </h3>
                    <p className="text-xs">
                      Hay {unshippedOrders.length}{" "}
                      {unshippedOrders.length === 1 ? "orden" : "órdenes"}{" "}
                      confirmadas hace más de 2 días que aún no han sido
                      enviadas. Por favor, procesa estos envíos lo antes
                      posible.
                    </p>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
