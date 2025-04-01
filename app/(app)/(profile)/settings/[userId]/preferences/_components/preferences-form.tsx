"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Bell } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Switch } from "@/components/ui/switch";
import { Database } from "@/database.types";

const notificationsSchema = z.object({
  email_marketing: z.boolean().default(true),
  email_notifications: z.boolean().default(true),
  push_enabled: z.boolean().default(false),
});

type NotificationsValues = z.infer<typeof notificationsSchema>;

export const NotificationsPreferencesForm = ({
  user,
  preferences,
}: {
  user: Database["public"]["Tables"]["users"]["Row"];
  preferences: Database["public"]["Tables"]["user_preferences"]["Row"];
}) => {
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [isPushSubmitting, setIsPushSubmitting] = useState(false);
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [currentSubscription, setCurrentSubscription] =
    useState<PushSubscription | null>(null);
  const supabase = createClient();

  const form = useForm<NotificationsValues>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      email_marketing: preferences.email_marketing,
      email_notifications: preferences.email_notifications,
      push_enabled: false,
    },
  });

  // Verificar soporte del navegador para notificaciones push
  useEffect(() => {
    const checkSupport = async () => {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        setIsPushSupported(true);

        // Cargar script de suscripción
        const script = document.createElement("script");
        script.src = "/push-subscribe.js";
        script.async = true;
        document.body.appendChild(script);

        // Verificar estado actual de la suscripción
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setCurrentSubscription(subscription);
          form.setValue("push_enabled", !!subscription);
        } catch (error) {
          console.error("Error al verificar suscripción:", error);
        }
      } else {
        setIsPushSupported(false);
      }
    };

    checkSupport();
  }, [form]);

  // Función para actualizar preferencias de email
  const updateEmailPreferences = async (
    field: "email_marketing" | "email_notifications",
    value: boolean
  ) => {
    setIsEmailSubmitting(true);

    try {
      // Actualizar preferencias existentes
      const { error } = await supabase
        .from("user_preferences")
        .update({
          [field]: value,
        })
        .eq("id", preferences.id);

      if (error) throw error;

      toast.success("Preferencias actualizadas correctamente");
    } catch (error) {
      console.error("Error al actualizar preferencias:", error);
      toast.error("Error al actualizar las preferencias");
      // Revertir el cambio en el formulario
      form.setValue(field, !value);
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  // Función para solicitar permiso de notificaciones
  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("Error al solicitar permiso:", error);
      return false;
    }
  };

  // Función para suscribirse a notificaciones push
  const subscribeToPush = async () => {
    try {
      // @ts-expect-error - Definido en push-subscribe.js
      const subscription = await window.pushNotifications.subscribe(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      );

      // Guardar suscripción en el servidor
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        throw new Error("Error al guardar suscripción en el servidor");
      }

      setCurrentSubscription(subscription);
      return true;
    } catch (error) {
      console.error("Error al suscribirse:", error);
      return false;
    }
  };

  // Versión mejorada de la función para cancelar suscripción
  const unsubscribeFromPush = async () => {
    try {
      // Añadir más logging para depuración

      if (!currentSubscription) {
        return true;
      }

      // Guardar una referencia al endpoint antes de cancelar
      const endpoint = currentSubscription.endpoint;

      // Intentar cancelar la suscripción en el navegador
      let result = false;
      try {
        // @ts-expect-error - Definido en push-subscribe.js
        result = await window.pushNotifications.unsubscribe();
      } catch (unsubError) {
        console.error(
          "Error específico al cancelar en el navegador:",
          unsubError
        );
        // Continuar con el proceso de todas formas
      }

      // Intentar eliminar la suscripción del servidor incluso si el paso anterior falló
      try {
        const response = await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: endpoint,
          }),
        });

        if (!response.ok) {
          console.error("Respuesta del servidor no válida:", response.status);
          throw new Error(`Error del servidor: ${response.status}`);
        }

      } catch (serverError) {
        console.error("Error al comunicarse con el servidor:", serverError);
        // No lanzar excepción, pero registrar el error
      }

      // Actualizar el estado local independientemente de los resultados anteriores
      setCurrentSubscription(null);

      return true;
    } catch (error) {
      console.error("Error general en unsubscribeFromPush:", error);
      return false;
    }
  };

  // Versión mejorada del manejador de cambio
  const handlePushChange = async (value: boolean) => {
    setIsPushSubmitting(true);

    try {
      if (value) {
        // Solicitar permiso de notificaciones
        const permissionGranted = await requestPermission();
        if (!permissionGranted) {
          toast.error("Necesitas permitir las notificaciones para continuar");
          form.setValue("push_enabled", false);
          return;
        }

        // Suscribir
        const subscribed = await subscribeToPush();
        if (subscribed) {
          toast.success("Notificaciones push habilitadas correctamente");
        } else {
          toast.error("Error al habilitar notificaciones push");
          form.setValue("push_enabled", false);
        }
      } else {
        // Intentar cancelar suscripción con manejo mejorado de errores
        const unsubscribed = await unsubscribeFromPush();

        if (unsubscribed) {
          toast.success("Notificaciones push deshabilitadas correctamente");
          // Asegurar que el estado del formulario se actualice correctamente
          form.setValue("push_enabled", false);
        } else {
          console.error("Fallo en el proceso de cancelación");
          toast.error("Error al deshabilitar notificaciones push");

          // Verificar el estado actual de la suscripción para actualizar la UI correctamente
          try {
            const registration = await navigator.serviceWorker.ready;
            const subscription =
              await registration.pushManager.getSubscription();
            const actuallySubscribed = !!subscription;

            form.setValue("push_enabled", actuallySubscribed);
          } catch (verifyError) {
            console.error("Error al verificar estado final:", verifyError);
            // En caso de duda, mantener el estado anterior
            form.setValue("push_enabled", !value);
          }
        }
      }
    } catch (error) {
      console.error("Error general en handlePushChange:", error);
      toast.error("Error al actualizar las preferencias de notificaciones");

      // Intento de recuperación del estado correcto
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        form.setValue("push_enabled", !!subscription);
      } catch {
        // Como último recurso, revertir al valor opuesto
        form.setValue("push_enabled", !value);
      }
    } finally {
      setIsPushSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
          <CardDescription>
            Configura qué tipo de notificaciones quieres recibir de nuestra
            parte.
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-sidebar space-y-4">
          <Form {...form}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email_notifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>
                        Notificaciones por correo
                      </FormLabel>
                      <FormDescription>
                        Recibe notificaciones importantes sobre tu cuenta y
                        transacciones.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                          updateEmailPreferences("email_notifications", value);
                        }}
                        disabled={isEmailSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email_marketing"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>
                        Correos promocionales
                      </FormLabel>
                      <FormDescription>
                        Recibe información sobre nuestras ofertas, novedades y
                        consejos.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                          updateEmailPreferences("email_marketing", value);
                        }}
                        disabled={isEmailSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </Form>
          {isPushSupported && (
            <Form {...form}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="push_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>
                          Notificaciones push
                        </FormLabel>
                        <FormDescription>
                          Recibe notificaciones inmediatas cuando haya actividad
                          en tu tienda.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <div className="flex items-center">
                          <Switch
                            checked={field.value}
                            onCheckedChange={(value) => {
                              field.onChange(value);
                              handlePushChange(value);
                            }}
                            disabled={isPushSubmitting}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
