import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Database } from "@/database.types";

export const DeleteAccountCard = ({
  user,
}: {
  user: Database["public"]["Tables"]["users"]["Row"];
}) => {
  return (
    <Card className="w-full border-destructive/40">
      <CardHeader className="bg-background border-b-0">
        <CardTitle>Eliminar mi cuenta</CardTitle>
        <CardDescription>
          Tu cuenta quedará eliminada permanentemente de nuestra plataforma, así
          como todos sus datos relacionados.
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
