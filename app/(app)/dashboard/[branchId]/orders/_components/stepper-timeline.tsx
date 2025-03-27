"use client";

import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
} from "@/components/ui/stepper";
import { Database } from "@/database.types";
import {
  CircleDashed,
  PackageCheck,
  PackagePlus,
  Signature,
  Truck,
} from "lucide-react";
import { Order } from "./columns";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { formatPrice } from "@/lib/utils";

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
              loading={
                step !== 1 &&
                step !== 5 &&
                step === getDefaultValue(order.status)
              }
              completed={
                getDefaultValue(order.status) === 5 ||
                getDefaultValue(order.status) === 1
              }
              className="relative items-start not-last:flex-1"
            >
              <div className="items-start pb-12 last:pb-0 w-full flex">
                <StepperIndicator icon={icon} />
                {step === 2 ? (
                  (order.verified_at && order.provider_user && (
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
                            new Date(order.verified_at),
                            timeZone,
                            "PPP 'a las' h:mm aa",
                            { locale: es }
                          )}
                        </span>
                      </StepperDescription>
                    </div>
                  )) || (
                    <div className="pl-4 px-2 text-left flex flex-col gap-y-0.5">
                      <StepperTitle>{title}</StepperTitle>
                      <StepperDescription>{description}</StepperDescription>
                    </div>
                  )
                ) : step === 3 ? (
                  (order.confirmed_at && (
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
                            new Date(order.confirmed_at),
                            timeZone,
                            "PPP 'a las' h:mm aa",
                            { locale: es }
                          )}
                        </span>
                      </StepperDescription>
                    </div>
                  )) || (
                    <div className="pl-4 px-2 text-left flex flex-col gap-y-0.5">
                      <StepperTitle>{title}</StepperTitle>
                      <StepperDescription>{description}</StepperDescription>
                    </div>
                  )
                ) : step === 4 ? (
                  (order.shipped_at && order.provider_shipped_user && (
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
                  )) || (
                    <div className="pl-4 px-2 text-left flex flex-col gap-y-0.5">
                      <StepperTitle>{title}</StepperTitle>
                      <StepperDescription>{description}</StepperDescription>
                    </div>
                  )
                ) : step === 5 ? (
                  (order.delivered_at && order.client && (
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
                            new Date(order.delivered_at),
                            timeZone,
                            "PPP 'a las' h:mm aa",
                            { locale: es }
                          )}
                        </span>
                      </StepperDescription>
                    </div>
                  )) || (
                    <div className="pl-4 px-2 text-left flex flex-col gap-y-0.5">
                      <StepperTitle>{title}</StepperTitle>
                      <StepperDescription>{description}</StepperDescription>
                    </div>
                  )
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
