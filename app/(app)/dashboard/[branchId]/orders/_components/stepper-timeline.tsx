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
import { CheckCheck, CircleDashed, Signature, Truck } from "lucide-react";

export const StepperTimeline = ({
  status,
}: {
  status: Database["public"]["Enums"]["order_status"];
}) => {
  const getDefaultValue = (
    status: Database["public"]["Enums"]["order_status"]
  ) => {
    switch (status) {
      case "requires_confirmation":
        return 1;
      case "pending":
        return 2;
      case "shipped":
        return 3;
      case "delivered":
        return 4;
      default:
        return 1;
    }
  };

  const steps = [
    {
      step: 1,
      title: "Verificación",
      description: "Requiere de tu verificación",
      icon: <Signature className="size-3.5" />,
    },
    {
      step: 2,
      title: "Confirmación",
      description: "Confirmación de pago",
      icon: <CircleDashed className="size-3.5" />,
    },
    {
      step: 3,
      title: "Envío",
      description: "Envió a domicilio",
      icon: <Truck className="size-3.5" />,
    },
    {
      step: 4,
      title: "Entrega",
      description: "Entrega al cliente",
      icon: <CheckCheck className="size-3.5" />,
    },
  ];

  return (
    <Stepper
      orientation="vertical"
      className="w-full"
      defaultValue={getDefaultValue(status)}
    >
      {steps.map(({ step, title, description, icon }) => (
        <StepperItem
          key={step}
          step={step}
          className="relative items-start not-last:flex-1"
        >
          <div className="items-start pb-12 last:pb-0 w-full flex">
            <StepperIndicator asChild>{icon}</StepperIndicator>
            <div className="mt-0.5 space-y-0.5 px-2 text-left">
              <StepperTitle>{title}</StepperTitle>
              <StepperDescription>{description}</StepperDescription>
            </div>
          </div>
          {step < steps.length && (
            <StepperSeparator className="absolute inset-y-0 top-[calc(1.5rem+0.125rem)] left-3 -order-1 m-0 -translate-x-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none group-data-[orientation=vertical]/stepper:h-[calc(100%-1.5rem-0.25rem)]" />
          )}
        </StepperItem>
      ))}
    </Stepper>
  );
};
