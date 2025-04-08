import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Database } from "@/database.types";
import { User } from "@supabase/supabase-js";

export const DeleteTableCard = ({
  user,
  business,
}: {
  user: User;
  business: Database["public"]["Tables"]["provider_business"]["Row"];
}) => {
  return (
    <Card className="w-full border-destructive/40">
      <CardHeader className="bg-background border-b-0">
        <CardTitle>Eliminar mi tienda</CardTitle>
        <CardDescription>
          Tu tienda quedará eliminada permanentemente de nuestra
          plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-destructive/20 border-t border-destructive/40 justify-end flex">
        <Button variant={"destructive"} size={"sm"}>
          Eliminar
        </Button>
      </CardContent>
    </Card>
  );
};
