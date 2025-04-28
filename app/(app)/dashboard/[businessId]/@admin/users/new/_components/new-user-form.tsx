"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the form schema with Zod
const inviteUserSchema = z.object({
  userName: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  userEmail: z.string().email({ message: "Correo electrónico inválido" }),
  role: z.enum(["admin", "supervisor", "staff"], {
    required_error: "Por favor selecciona un rol",
  }),
});

type InviteUserFormValues = z.infer<typeof inviteUserSchema>;

export const NewUserForm = ({ businessId }: { businessId: string }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form
  const form = useForm<InviteUserFormValues>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      userName: "",
      userEmail: "",
      role: "staff",
    },
  });

  // Handle form submission
  const onSubmit = async (data: InviteUserFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/businesses/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId,
          userName: data.userName,
          userEmail: data.userEmail,
          role: data.role,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al enviar la invitación");
      }

      toast.success("Invitación enviada correctamente");
      form.reset();
    } catch (error) {
      console.error("Error al enviar invitación:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al enviar la invitación"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Invitar usuario</CardTitle>
        <CardDescription>
          Invita a un nuevo miembro a colaborar en tu negocio
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 bg-sidebar">
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-background"
                      placeholder="Nombre del usuario"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="correo@ejemplo.com"
                      className="bg-background"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Define los permisos que tendrá el usuario en tu negocio
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between border-t">
            <Button
              variant="outline"
              type="button"
              onClick={() => form.reset()}
            >
              Cancelar
            </Button>
            <Button
              variant={"defaultBlack"}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Invitar Usuario"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
