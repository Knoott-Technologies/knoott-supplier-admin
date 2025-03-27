import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Database } from "@/database.types";
import { columns, PaymentIntentProps } from "./columns";
import { DataTable } from "@/components/universal/tables/data-table";

export const HistoryPurchase = ({
  user,
  paymentIntents,
}: {
  user: Database["public"]["Tables"]["users"]["Row"];
  paymentIntents: PaymentIntentProps[];
}) => {
  return (
    <Card className="w-full">
      <CardHeader className="bg-background">
        <CardTitle>Tus compras</CardTitle>
        <CardDescription>
          Aqui puedes ver las compras que has realizado dentro de nuestra
          plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-sidebar">
        {!user.stripe_cus_id ||
          (paymentIntents.length === 0 && (
            <div className="w-full h-fit items-center justify-center flex">
              Aún no has realizado ninguna compra.
            </div>
          )) || (
            <div className="w-full bg-background border">
              <DataTable columns={columns} data={paymentIntents} />
            </div>
          )}
      </CardContent>
    </Card>
  );
};
