"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, KeyRound, Mail, Phone } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { LoginFormEmail } from "./login-form-email";
import { LoginFormPhone } from "./login-form-phone";
import { LoginFormOtp } from "./login-form-otp";

export const LoginTypesRenderer = () => {
  const router = useRouter();
  const params = useSearchParams();

  const type = params.get("type");

  const loginTypes = [
    {
      type: "phone",
      label: "número de teléfono",
      icon: Phone,
    },
    {
      type: "email",
      label: "correo electrónico",
      icon: Mail,
    },
    {
      type: "otp",
      label: "código de verificación",
      icon: KeyRound,
    },
  ];

  const handleLoginType = (type: string) => {
    // Build the URL with only the parameters that exist
    const url = `/login?type=${type}`;

    router.push(url);
  };

  const renderTypeForm = () => {
    switch (type) {
      case "email":
        return <LoginFormEmail />;
      case "phone":
        return <LoginFormPhone />;
      case "otp":
        return <LoginFormOtp />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-fit items-start justify-start flex flex-col gap-y-4 px-5 md:px-0">
      {type && (
        <Button variant={"ghost"} size={"sm"} asChild>
          <Link href={"/login"}>
            <ArrowLeft className="size-4" />
            Volver
          </Link>
        </Button>
      )}

      {(!type && (
        <div className="w-full h-fit items-start justify-start flex flex-col gap-y-2">
          {/* <Button
            className="w-full relative"
            size={"default"}
            variant={"outline"}
          >
            Inicio de sesión con Google
            <Google className="size-4 absolute left-2" />
          </Button> */}
          {loginTypes.map((item, index) => (
            <Button
              className="w-full relative"
              size={"default"}
              variant={"outline"}
              key={index}
              onClick={() => handleLoginType(item.type)}
            >
              <item.icon className="size-4 absolute left-2" />
              Ingresa con {item.label}
            </Button>
          ))}
        </div>
      )) ||
        renderTypeForm()}

      <div className="w-full flex gap-x-3 items-center justify-center">
        <Separator className="flex-1" />
        <p className="text-xs text-muted-foreground shrink-0">
          ¿No tienes una cuenta?
        </p>
        <Separator className="flex-1" />
      </div>
      <Button
        className="w-full relative"
        size={"default"}
        variant={"ghost"}
        asChild
      >
        <Link href={"/register"}>
          Regístrate en Knoott Partners
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
};
