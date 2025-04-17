import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
} from "@/components/ui/stepper";
import { Check, Loader2, Truck } from "lucide-react";

const steps = [
  {
    step: 1,
    title: "Órden verificada por el negocio",
    description: "Has verificado que puedes completar la orden.",
    icon: <Check className="size-3.5 text-background" />,
  },
  {
    step: 2,
    title: "Procesamos el pago",
    description:
      "Hemos procesado el pago del importe total de la órden, puedes ver el detalle en la sección de transacciones.",
    icon: <Check className="size-3.5 text-background" />,
    loading: true,
  },
  {
    step: 3,
    title: "En tránsito",
    description: "La órden está en camino a la dirección del cliente.",
    icon: (
      <Loader2 className="size-3.5 text-muted-foreground group-hover:animate-spin" />
    ),
    loading: true,
  },
];

export const OrdersSection2 = () => {
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-sidebar group-hover:bg-contrast2/5">
      {/* Main content */}
      <div className="flex flex-col w-full relative max-w-[80%] h-fit translate-y-[15%] items-center justify-center z-10 bg-background border shadow-md group-hover:shadow-lg ease-in-out duration-300">
        <div className="w-full h-fit border-b p-3 flex-col">
          <p className="text-sm font-semibold">Estado de la órden</p>
          <p className="text-muted-foreground text-xs">Revisa las actualizaciones de la órden en tiempo real.</p>
        </div>
        <Stepper defaultValue={3} orientation="vertical" className="w-full p-3">
          {steps.map(({ step, title, description, icon, loading }) => (
            <StepperItem
              key={step}
              step={step}
              loading={loading}
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
      </div>
    </div>
  );
};
