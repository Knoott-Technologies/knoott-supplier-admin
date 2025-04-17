import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Order } from "../../page";
import { StepperTimeline } from "../../_components/stepper-timeline";

export const OrderTimeline = ({ order }: { order: Order }) => {
  return (
    <div
      id="timeline"
      className="flex w-full xl:sticky xl:top-[calc(56px_+_28px)]"
    >
      <Card className="w-full">
        <CardHeader className="bg-background">
          <CardTitle>Línea del tiempo</CardTitle>
          <CardDescription>
            Visualiza el estado de la orden en tiempo real.
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-sidebar">
          <StepperTimeline order={order} />
        </CardContent>
      </Card>
    </div>
  );
};
