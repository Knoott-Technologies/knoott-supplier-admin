"use client";

import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
} from "@/components/ui/stepper";
import type { Database } from "@/database.types";
import {
  CircleDashed,
  PackageCheck,
  PackagePlus,
  FilePenLineIcon as Signature,
  Truck,
} from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { formatPrice } from "@/lib/utils";
import type { Order } from "../page";

export const StepperTimeline = ({ order }: { order: Order }) => {
  const getDefaultValue = (
    status: Database["public"]["Enums"]["order_status"]
  ) => {
    switch (status) {
      case "created":
        return 2;
      case "requires_confirmation":
        return 2;
      case "pending":
        return 3;
      case "shipped":
        return 4;
      case "delivered":
        return 5;
      default:
        return 1;
    }
  };

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const steps = [
    {
      step: 1,
      title: "Pedido registrado",
      description: (
        <p>
          Pedido creado por{" "}
          <span className="font-medium text-foreground">
            {order.client.first_name} {order.client.last_name}
          </span>{" "}
          el{" "}
          <span className="font-medium text-foreground">
            {formatInTimeZone(
              new Date(order.created_at),
              timeZone,
              "PPP 'a las' h:mm aa",
              { locale: es }
            )}
          </span>
        </p>
      ),
      icon: <PackagePlus className="size-3.5" />,
    },
    {
      step: 2,
      title: "Esperando confirmación del negocio",
      description:
        "El negocio debe verificar y aceptar este pedido para continuar",
      icon: <Signature className="size-3.5" />,
    },
    {
      step: 3,
      title: "Procesando pago al comercio",
      description: "Estamos transfiriendo el importe a la cuenta del negocio",
      icon: <CircleDashed className="size-3.5" />,
    },
    {
      step: 4,
      title: "Preparando envío",
      description:
        "El pedido está siendo preparado para su entrega a domicilio",
      icon: <Truck className="size-3.5" />,
    },
    {
      step: 5,
      title: "Pedido entregado",
      description: "El cliente ha recibido correctamente su pedido",
      icon: <PackageCheck className="size-3.5" />,
    },
  ];

  // Determinar el estado actual del pedido para cada paso
  const isStepCompleted = (step: number) => {
    switch (step) {
      case 1: // Pedido registrado - siempre completado
        return true;
      case 2: // Confirmación del negocio
        return (
          order.status !== "requires_confirmation" && order.status !== "created"
        );
      case 3: // Procesando pago
        return (
          order.status !== "requires_confirmation" &&
          order.status !== "created" &&
          order.status !== "pending"
        );
      case 4: // Preparando envío - solo completado cuando la orden está entregada
        return order.status === "delivered";
      case 5: // Pedido entregado
        return order.status === "delivered";
      default:
        return false;
    }
  };

  // Determinar si un paso debe mostrar el estado de carga
  const isStepLoading = (step: number) => {
    if (step === 1 || step === 5) return false; // Estos pasos nunca tienen estado de carga

    const currentStep = getDefaultValue(order.status);

    // Caso especial para el paso 4 (Preparando envío)
    if (step === 4 && order.status === "shipped") {
      return true; // Siempre mostrar cargando cuando está en tránsito
    }

    return step === currentStep && !isStepCompleted(step);
  };

  // Determinar si debemos mostrar información detallada para un paso
  const shouldShowDetailedInfo = (step: number) => {
    switch (step) {
      case 2: // Confirmación del negocio
        return (
          order.status !== "requires_confirmation" &&
          order.status !== "created" &&
          order.verified_at &&
          order.provider_user
        );
      case 3: // Procesando pago
        return (
          order.status !== "requires_confirmation" &&
          order.status !== "created" &&
          order.status !== "pending" &&
          order.confirmed_at
        );
      case 4: // Preparando envío - mostrar info detallada si hay datos de envío, aunque esté en carga
        return order.status === "shipped" || order.status === "delivered";
      case 5: // Pedido entregado
        return order.status === "delivered" && order.delivered_at;
      default:
        return false;
    }
  };

  return (
    <Stepper
      orientation="vertical"
      className="w-full"
      defaultValue={getDefaultValue(order.status)}
    >
      {steps.map(({ step, title, description, icon }) => {
        if (step > getDefaultValue(order.status)) {
          return null;
        } else {
          return (
            <StepperItem
              key={step}
              step={step}
              loading={isStepLoading(step)}
              completed={isStepCompleted(step)}
              className="relative items-start not-last:flex-1"
            >
              <div className="items-start pb-12 last:pb-0 w-full flex">
                <StepperIndicator icon={icon} />
                {step === 2 && shouldShowDetailedInfo(step) ? (
                  <div className="pl-4 px-2 text-left flex flex-col gap-y-0.5">
                    <StepperTitle>
                      Pedido verificado por el negocio
                    </StepperTitle>
                    <StepperDescription>
                      Verificado por{" "}
                      <span className="text-foreground font-medium">
                        {order.provider_user.first_name}{" "}
                        {order.provider_user.last_name}
                      </span>{" "}
                      el{" "}
                      <span className="text-foreground font-medium">
                        {formatInTimeZone(
                          order.verified_at!,
                          timeZone,
                          "PPP 'a las' h:mm aa",
                          { locale: es }
                        )}
                      </span>
                    </StepperDescription>
                  </div>
                ) : step === 3 && shouldShowDetailedInfo(step) ? (
                  <div className="pl-4 px-2 text-left flex flex-col gap-y-0.5">
                    <StepperTitle>Pago transferido al comercio</StepperTitle>
                    <StepperDescription>
                      Se ha transferido{" "}
                      <span className="text-foreground font-medium">
                        MXN {formatPrice(order.povider_received_amount)}
                      </span>{" "}
                      a la cuenta bancaria del negocio el{" "}
                      <span className="text-foreground font-medium">
                        {formatInTimeZone(
                          order.confirmed_at!,
                          timeZone,
                          "PPP 'a las' h:mm aa",
                          {
                            locale: es,
                          }
                        )}
                      </span>
                    </StepperDescription>
                  </div>
                ) : step === 4 &&
                  shouldShowDetailedInfo(step) &&
                  order.shipped_at &&
                  order.provider_shipped_user ? (
                  <div className="pl-4 px-2 text-left flex flex-col gap-y-0.5">
                    <StepperTitle>Pedido en camino</StepperTitle>
                    <StepperDescription>
                      Envío gestionado por{" "}
                      <span className="text-foreground font-medium">
                        {order.provider_shipped_user.first_name}{" "}
                        {order.provider_shipped_user.last_name}
                      </span>{" "}
                      el{" "}
                      <span className="text-foreground font-medium">
                        {formatInTimeZone(
                          new Date(order.shipped_at),
                          timeZone,
                          "PPP 'a las' h:mm aa",
                          { locale: es }
                        )}
                      </span>
                    </StepperDescription>
                  </div>
                ) : step === 5 && shouldShowDetailedInfo(step) ? (
                  <div className="pl-4 px-2 text-left flex flex-col gap-y-0.5">
                    <StepperTitle>Entrega completada</StepperTitle>
                    <StepperDescription>
                      Recibido por{" "}
                      <span className="text-foreground font-medium">
                        {order.client.first_name} {order.client.last_name}
                      </span>{" "}
                      el{" "}
                      <span className="text-foreground font-medium">
                        {formatInTimeZone(
                          order.delivered_at!,
                          timeZone,
                          "PPP 'a las' h:mm aa",
                          {
                            locale: es,
                          }
                        )}
                      </span>
                    </StepperDescription>
                  </div>
                ) : (
                  <div className="pl-4 px-2 text-left flex flex-col gap-y-0.5">
                    <StepperTitle>{title}</StepperTitle>
                    <StepperDescription>{description}</StepperDescription>
                  </div>
                )}
              </div>
              {step < steps.length && (
                <StepperSeparator className="absolute inset-y-0 top-[calc(1.5rem+0.125rem)] left-3 -order-1 m-0 -translate-x-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none group-data-[orientation=vertical]/stepper:h-[calc(100%-1.5rem-0.25rem)]" />
              )}
            </StepperItem>
          );
        }
      })}
    </Stepper>
  );
};
