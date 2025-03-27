import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Database } from "@/database.types";
import { User } from "@supabase/supabase-js";
import { MoreVertical, Plus } from "lucide-react";
import { AddressForm } from "./address-form";
import { AddressesDropdown } from "./addresses-dropdown";
import React from "react";

export const WeddingAddressesCard = ({
  addresses,
  user,
  wedding_id,
}: {
  addresses: Database["public"]["Tables"]["wedding_addresses"]["Row"][] | null;
  user: User;
  wedding_id: string;
}) => {
  return (
    <Card className="w-full">
      <CardHeader className="bg-background">
        <CardTitle>Direcciones guardadas</CardTitle>
        <CardDescription>
          Aquí puedes ver las direcciones guardadas de tu mesa de regalos,
          puedes agregar nuevas, editarlas o eliminarlas.
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-sidebar">
        <div className="w-full h-fit items-start justify-start flex flex-col">
          {addresses && addresses.length > 0 ? (
            addresses.map((address, index) => (
              <React.Fragment key={address.id}>
                <div
                  className="w-full h-fit items-start justify-start flex p-3 hover:bg-background border border-transparent hover:border-border ease-in-out duration-300"
                  key={address.id}
                >
                  <div className="flex flex-col gap-y-2 items-start justify-start flex-1">
                    <span className="flex flex-col flex-1 items-start justify-start gap-y-2">
                      <div className="w-full flex flex-col gap-y-1">
                        {address.tag && (
                          <span className="text-base text-foreground font-semibold flex gap-x-2">
                            {address.tag}
                            {address.is_default && (
                              <div className="text-muted-foreground pointer-events-none flex items-center justify-center">
                                <kbd className="text-muted-foreground inline-flex border bg-sidebar h-5 items-center px-1.5 font-[inherit] text-[0.65rem] font-medium">
                                  Predeterminada
                                </kbd>
                              </div>
                            )}
                          </span>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {address.street_address}, {address.postal_code},{" "}
                          {address.city}, {address.state}, {address.country}
                        </p>
                      </div>
                      {address.additional_notes && (
                        <div className="w-full flex flex-col gap-y-0">
                          <p className="text-sm text-foreground font-semibold">
                            Notas adicionales:
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.additional_notes}
                          </p>
                        </div>
                      )}
                    </span>
                  </div>
                  <div className="shrink-0 items-start justify-start flex">
                    <AddressesDropdown address={address} />
                  </div>
                </div>
                {index !== addresses.length - 1 && <Separator className="my-2"/>}
              </React.Fragment>
            ))
          ) : (
            <p>No hay direcciones guardadas</p>
          )}
          <Separator className="my-2"/>
          <Collapsible className="group/collapsible w-full">
            <CollapsibleTrigger asChild>
              <Button
                className="w-full justify-between group-data-[state=open]/collapsible:bg-background group-data-[state=open]/collapsible:border-border border-transparent border border-b-0 px-3 ease-in-out duration-300"
                variant={"ghost"}
                size={"default"}
              >
                <span className="flex relative items-center">
                  <p className="group-data-[state=open]/collapsible:scale-0 scale-100 ease-in-out duration-300">
                    Agregar nueva dirección
                  </p>
                  <p className="group-data-[state=open]/collapsible:scale-100 scale-0 ease-in-out duration-300 absolute left-0">
                    Cerrar formulario
                  </p>
                </span>
                <span>
                  <Plus className="group-data-[state=open]/collapsible:rotate-45 ease-in-out duration-300" />
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="w-full border bg-background overflow-hidden transition-all duration-300 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
              <div className="w-full p-3">
                <AddressForm wedding_id={wedding_id} />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
};
