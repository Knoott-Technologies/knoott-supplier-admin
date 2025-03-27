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
import { ArrowRight, ChevronDown } from "lucide-react";
import { Order } from "./columns";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { StepperTimeline } from "./stepper-timeline";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export const OrderDetails = ({ order }: { order: Order }) => {
  const isMobile = useIsMobile();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={"ghost"} size={"sm"}>
          Detalles <ArrowRight />
        </Button>
      </SheetTrigger>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "[&>button]:hidden p-0 bg-sidebar sm:max-w-lg",
          isMobile && "h-[80dvh] max-h-[80dvh]"
        )}
      >
        <div className="flex h-full w-full flex-col bg-background">
          <SheetHeader className="p-3 bg-sidebar border-b text-start space-y-0">
            <SheetTitle>Detalles de la orden #{order.id}</SheetTitle>
            <SheetDescription>
              Visualiza los detalles de la orden, incluyendo la información de
              envío, etc.
            </SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto bg-background p-3">
            <Collapsible className="border group/collapsible">
              <CollapsibleTrigger asChild>
                <span className="w-full h-fit items-center justify-between flex gap-y-0 p-3 bg-background cursor-pointer">
                  <span className="flex flex-col items-start justify-start gap-y-0">
                    <h3 className="text-sm font-semibold">Línea del tiempo</h3>
                    <p className="text-xs text-muted-foreground">
                      Este es el seguimiento de la orden
                    </p>
                  </span>
                  <ChevronDown className="ml-auto size-4 transition-transform duration-300 ease-in-out flex group-data-[state=open]/collapsible:-rotate-90" />
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent className="w-full bg-sidebar p-3 border-t overflow-hidden transition-all duration-300 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                <StepperTimeline status={order.status} />
              </CollapsibleContent>
            </Collapsible>
          </div>
          <SheetFooter className="w-full h-fit bg-sidebar border-t p-3 pb-8 md:pb-3 gap-2">
            <SheetClose asChild>
              <Button variant={"outline"} className="w-full">
                Cerrar
              </Button>
            </SheetClose>
            <Button variant={"defaultBlack"} className="w-full">
              Ver página de orden
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
};
