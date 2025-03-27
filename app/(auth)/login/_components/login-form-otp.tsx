"use client";

import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Mail,
  Phone,
  ArrowRight,
  Timer,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Esquema inicial para validación del contacto (email o teléfono)
const contactSchema = z.object({
  contact: z
    .string()
    .min(1, { message: "Este campo es requerido" })
    .refine(
      (val) => {
        // Verificar si es email o teléfono con formato internacional
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        const isPhone = /^\+[1-9]\d{6,14}$/.test(val);
        return isEmail || isPhone;
      },
      {
        message:
          "Ingresa un correo electrónico o número de teléfono válido (+523334445555)",
      }
    ),
});

// Esquema para validación del código OTP
const otpSchema = z.object({
  otp: z
    .string()
    .min(1, { message: "El código es requerido" })
    .length(6, { message: "El código debe tener 6 dígitos" })
    .regex(/^\d+$/, { message: "El código debe contener solo números" }),
});

export function LoginFormOtp() {
  const [step, setStep] = useState<"contact" | "otp">("contact");
  const [loading, setLoading] = useState(false);
  const [contactType, setContactType] = useState<"email" | "phone" | null>(
    null
  );
  const [contactValue, setContactValue] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  // Añadimos estado para rastrear la intención del usuario
  const [isLikelyEmail, setIsLikelyEmail] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  // Formulario para el contacto (email o teléfono)
  const contactForm = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      contact: "",
    },
  });

  // Formulario para el código OTP
  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Función para determinar si es email o teléfono
  const detectContactType = (value: string): "email" | "phone" | null => {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "email";
    } else if (/^\+[1-9]\d{6,14}$/.test(value)) {
      return "phone";
    }
    return null;
  };

  // Función mejorada para detectar si es probable que sea un correo
  const isLikelyEmailInput = (value: string): boolean => {
    // Si contiene @ es definitivamente un correo
    if (value.includes("@")) {
      return true;
    }

    // Si empieza con + es definitivamente un teléfono
    if (value.startsWith("+")) {
      return false;
    }

    // Si el usuario ya indicó anteriormente que es un correo, mantener esa intención
    if (isLikelyEmail) {
      return true;
    }

    // Si contiene letras, probablemente es un correo
    if (/[a-zA-Z]/.test(value)) {
      return true;
    }

    // Si solo tiene números y es corto, probablemente es un teléfono
    if (/^\d{1,5}$/.test(value)) {
      return false;
    }

    // Por defecto, no aplicar formato automático para evitar errores
    return true;
  };

  // Función para formatear entrada de teléfono (mejorada)
  const formatPhoneInput = (value: string) => {
    // Verificar si es probable que sea un correo
    if (isLikelyEmailInput(value)) {
      return value;
    }

    // Si parece teléfono, asegurar formato internacional
    if (!value.startsWith("+") && /\d/.test(value)) {
      value = "+" + value.replace(/[^\d]/g, "");
    } else if (value.startsWith("+")) {
      value = "+" + value.substring(1).replace(/[^\d]/g, "");
    }

    return value;
  };

  // Manejador para enviar el contacto
  async function onSubmitContact(values: z.infer<typeof contactSchema>) {
    try {
      setLoading(true);

      // Detectar tipo de contacto (email o teléfono)
      const type = detectContactType(values.contact);
      if (!type) {
        return; // No debería ocurrir debido a la validación
      }

      setContactType(type);
      setContactValue(values.contact);

      const { data, error } = await supabase.auth.signInWithOtp({
        ...(type === "email"
          ? { email: values.contact }
          : { phone: values.contact }),
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        toast.error("Hubo un error al enviar el código OTP", {
          description:
            "Por favor, verifica tu información e intenta de nuevo en unos segundos.",
        });
        return; // Importante: detener la ejecución aquí si hay un error
      }

      // Solo avanzar si NO hubo error
      toast.success("Código enviado correctamente", {
        description: `Hemos enviado un código de verificación a ${values.contact}`,
      });

      // Iniciar contador para reenvío
      startResendCountdown();

      // Avanzar al siguiente paso
      setStep("otp");
    } catch (error) {
      console.error("Error al enviar OTP:", error);
      toast.error("Ocurrió un error inesperado", {
        description: "Por favor, intenta de nuevo más tarde.",
      });
    } finally {
      setLoading(false);
    }
  }

  // Manejador para verificar el código OTP
  async function onSubmitOtp(values: z.infer<typeof otpSchema>) {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.verifyOtp({
        token: values.otp,
        ...(contactType === "email"
          ? {
              email: contactValue,
              type: "magiclink",
            }
          : {
              phone: contactValue,
              type: "sms",
            }),
      });

      if (error) {
        toast.error("Error al verificar el código", {
          description:
            "El código puede ser incorrecto o haber expirado. Intenta de nuevo.",
        });
        return;
      }

      // Verificación exitosa, ahora obtenemos información del usuario
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Mostrar mensaje de éxito general
        toast.success("Inicio de sesión exitoso");
       

        // Si no encuentra userProvider, redirigir a la ruta general
        return router.push("/dashboard");
      } else {
        toast.error("Error de autenticación", {
          description: "No se pudo obtener la información del usuario.",
        });
      }
    } catch (error) {
      console.error("Error al verificar OTP:", error);
      toast.error("Ocurrió un error inesperado", {
        description: "Por favor, intenta de nuevo más tarde.",
      });
    } finally {
      setLoading(false);
    }
  }

  // Función para reenviar el código
  const handleResendCode = async () => {
    if (resendDisabled) return;

    try {
      setLoading(true);

      // Realmente enviar el código OTP de nuevo usando Supabase
      const { data, error } = await supabase.auth.signInWithOtp({
        ...(contactType === "email"
          ? { email: contactValue }
          : { phone: contactValue }),
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        toast.error("Error al reenviar el código", {
          description: "Por favor, intenta de nuevo más tarde.",
        });
        return;
      }

      toast.success("Código reenviado", {
        description: `Hemos enviado un nuevo código a ${contactValue}`,
      });

      // Iniciar contador para reenvío
      startResendCountdown();
    } catch (error) {
      console.error("Error al reenviar OTP:", error);
      toast.error("Ocurrió un error inesperado", {
        description: "Por favor, intenta de nuevo más tarde.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para iniciar el contador de reenvío
  const startResendCountdown = () => {
    setResendDisabled(true);
    setCountdown(30);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Volver al paso anterior
  const goBack = () => {
    setStep("contact");
    otpForm.reset();
  };

  return (
    <>
      {step === "contact" ? (
        <Form {...contactForm}>
          <form
            onSubmit={contactForm.handleSubmit(onSubmitContact)}
            className="flex flex-col w-full gap-y-4"
          >
            <FormField
              control={contactForm.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico o número de teléfono</FormLabel>
                  <FormControl>
                    <div className="relative items-center justify-start flex">
                      {detectContactType(field.value) === "email" ||
                      isLikelyEmail ? (
                        <Mail
                          className={cn(
                            "absolute left-3 size-4 text-muted-foreground"
                          )}
                        />
                      ) : (
                        <Phone
                          className={cn(
                            "absolute left-3 size-4 text-muted-foreground"
                          )}
                        />
                      )}
                      <Input
                        placeholder="correo@ejemplo.com o +523334445555"
                        className="pl-10 pr-3 bg-white"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Actualizar estado de intención
                          setIsLikelyEmail(isLikelyEmailInput(value));
                          // Formatear solo si es teléfono
                          const formattedValue = isLikelyEmail
                            ? value
                            : formatPhoneInput(value);
                          field.onChange(formattedValue);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground mt-1">
                    Te enviaremos un código para iniciar sesión
                  </p>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="default"
              variant={"default"}
              className="w-full bg-foreground text-background hover:bg-foreground/80 hover:text-background mt-5"
              disabled={loading}
            >
              {loading ? (
                "Enviando código..."
              ) : (
                <span className="flex items-center gap-2">
                  Continuar <ArrowRight className="size-4" />
                </span>
              )}
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...otpForm}>
          <form
            onSubmit={otpForm.handleSubmit(onSubmitOtp)}
            className="flex flex-col w-full gap-y-4"
          >
            <p className="text-sm text-muted-foreground">
              Hemos enviado un código de verificación de 6 dígitos al{" "}
              <span className="font-medium text-foreground">
                {contactValue}
              </span>
            </p>

            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de 6 dígitos</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123456"
                      className="text-center bg-white text-lg tracking-wider"
                      maxLength={6}
                      {...field}
                      onChange={(e) => {
                        // Solo permitir dígitos
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 6) {
                          field.onChange(value);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-y-3 mt-2">
              <Button
                type="submit"
                size="default"
                variant={"default"}
                className="w-full bg-foreground text-background hover:bg-foreground/80 hover:text-background"
                disabled={loading}
              >
                {loading ? "Verificando..." : "Verificar"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-sm"
                onClick={handleResendCode}
                disabled={resendDisabled || loading}
              >
                {resendDisabled ? (
                  <span className="flex items-center gap-2">
                    <Timer className="size-3.5" /> Reenviar en {countdown}s
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="size-3.5" /> Reenviar código
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </>
  );
}
