"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, KeyRound, Mail, Phone } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { LoginFormEmail } from "./login-form-email";
import { LoginFormPhone } from "./login-form-phone";
import { LoginFormOtp } from "./login-form-otp";

export const LoginTypesRenderer = ({
  businessId,
  token,
}: {
  businessId: string | null;
  token: string | null;
}) => {
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
    let url = `/login?type=${type}`;

    if (businessId) {
      url += `&businessId=${businessId}`;
    }

    if (token) {
      url += `&token=${token}`;
    }

    router.push(url);
  };

  const renderTypeForm = () => {
    switch (type) {
      case "email":
        return <LoginFormEmail businessId={businessId} token={token} />;
      case "phone":
        return <LoginFormPhone businessId={businessId} token={token} />;
      case "otp":
        return <LoginFormOtp businessId={businessId} token={token} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-fit items-start justify-start flex flex-col gap-y-7">
      {type && (
        <Button variant={"ghost"} size={"sm"} asChild>
          <Link
            href={
              (businessId &&
                token &&
                `/login?businessId=${businessId}&token=${token}`) ||
              "/login"
            }
          >
            <ArrowLeft className="size-4" />
            Volver
          </Link>
        </Button>
      )}

      {(!type && (
        <div className="w-full h-fit items-start justify-start flex flex-col gap-y-2">
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
        <p className="text-sm text-muted-foreground shrink-0">
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
        <Link
          href={
            (businessId &&
              token &&
              `/register?businessId=${businessId}&token=${token}`) ||
            "/register"
          }
        >
          Regístrate en Partners
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
};
