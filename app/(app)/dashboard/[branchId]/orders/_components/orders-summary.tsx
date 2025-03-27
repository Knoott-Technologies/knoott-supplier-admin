import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Circle } from "lucide-react";
import { Database } from "@/database.types";
import Link from "next/link";

export function OrdersSummary({
  orders,
  branchId,
}: {
  orders: Database["public"]["Tables"]["wedding_product_orders"]["Row"][];
  branchId: string;
}) {
  // Count total orders
  const totalOrders = orders.length;

  // Count orders by status
  const requiresConfirmation = orders.filter(
    (order) => order.status === "requires_confirmation"
  ).length;
  const pending = orders.filter((order) => order.status === "pending").length;
  const shipped = orders.filter((order) => order.status === "shipped").length;
  const delivered = orders.filter(
    (order) => order.status === "delivered"
  ).length;
  const canceled = orders.filter((order) => order.status === "canceled").length;
  const paid = orders.filter((order) => order.status === "paid").length;

  // Calculate orders that need attention (requires_confirmation + pending)
  const needsAttention = requiresConfirmation + pending;

  return (
    <div className="w-full h-fit grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Total Orders Card */}
      <Card className="flex-1 flex flex-col bg-sidebar w-full">
        <CardHeader className="border-b-0 bg-transparent flex gap-x-4 items-start justify-start flex-row">
          <div className="flex-1 space-y-1.5">
            <CardTitle>Total de órdenes</CardTitle>
            <CardDescription>
              El número total de órdenes recibidas en Knoott.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="w-full h-fit flex flex-col gap-1 items-start justify-start mt-auto">
            <div className="text-xl lg:text-3xl xl:text-4xl font-semibold truncate leading-none">
              {totalOrders}
            </div>
            <p className="text-sm text-muted-foreground">
              {delivered} entregadas, {shipped} en tránsito, {pending}{" "}
              pendientes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Orders Requiring Attention Card */}
      <Link
        className="flex-1 flex"
        href={`/dashboard/${branchId}/orders?page=1&status=requires_confirmation`}
      >
        <Card className="flex-1 flex flex-col bg-sidebar w-full">
          <CardHeader className="border-b-0 bg-transparent flex gap-x-4 items-start justify-between flex-row">
            <div className="flex-1 space-y-1.5">
              <CardTitle>Requieren atención</CardTitle>
              <CardDescription>
                Órdenes que requieren tu atención.
              </CardDescription>
            </div>
            <AlertCircle
              className={`h-4 w-4 ${
                needsAttention > 0 ? "text-contrast" : "text-muted-foreground"
              }`}
            />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="w-full h-fit flex flex-col gap-1 items-start justify-start mt-auto">
              <div
                className={`text-xl lg:text-3xl xl:text-4xl font-semibold truncate leading-none ${
                  needsAttention > 0 ? "text-contrast" : ""
                }`}
              >
                {needsAttention}
              </div>
              <p className="text-sm text-muted-foreground">
                {requiresConfirmation} por confirmar, {pending} pendientes de
                envío
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Status Breakdown Card */}
      <Card className="flex-1 flex flex-col bg-sidebar w-full">
        <CardHeader className="border-b-0 bg-transparent flex gap-x-4 items-start justify-between flex-row">
          <div className="flex-1 space-y-1.5">
            <CardTitle>Estado de órdenes</CardTitle>
            <CardDescription>Resumen de estado de órdenes.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <Circle className="size-2 text-contrast fill-contrast" />
              <span className="text-sm">Por confirmar</span>
            </div>
            <span className="text-sm font-semibold">
              {requiresConfirmation}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <Circle className="size-2 text-primary fill-primary" />
              <span className="text-sm">Pendientes</span>
            </div>
            <span className="text-sm font-semibold">{pending}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <Circle className="size-2 text-contrast2 fill-contrast2" />
              <span className="text-sm">Listas para envío</span>
            </div>
            <span className="text-sm font-semibold">{paid}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <Circle className="size-2 text-tertiary fill-tertiary" />
              <span className="text-sm">En tránsito</span>
            </div>
            <span className="text-sm font-semibold">{shipped}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <Circle className="size-2 text-success fill-success" />
              <span className="text-sm">Entregadas</span>
            </div>
            <span className="text-sm font-semibold">{delivered}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <Circle className="size-2 text-destructive fill-destructive" />
              <span className="text-sm">Canceladas</span>
            </div>
            <span className="text-sm font-semibold">{canceled}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
