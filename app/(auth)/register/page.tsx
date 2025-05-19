import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/universal/headers";
import { Suspense } from "react";
import { RegisterForm } from "./register-form";
import Link from "next/link";

const RegisterPage = ({
  searchParams,
}: {
  searchParams: { businessId?: string; token?: string };
}) => {
  const businessId = searchParams.businessId || null;
  const token = searchParams.token || null;

  return (
    <main className="w-full h-fit items-center justify-center flex flex-col min-h-[calc(100dvh-56px)]">
      <div className="w-full h-fit items-start justify-start flex flex-col max-w-lg px-5 md:px-7 lg:px-0">
        <PageHeader
          title={businessId && token ? "Únete al negocio" : "Crea tu cuenta"}
          description={
            businessId && token
              ? "Has sido invitado a colaborar. Crea una cuenta para continuar."
              : "Crea una cuenta en Partners, administra tu negocio y comienza a vender."
          }
        />
        <Card className="w-full">
          <CardContent className="bg-sidebar">
            <Suspense>
              <RegisterForm businessId={businessId} token={token} />
            </Suspense>
          </CardContent>
        </Card>
        <div className="w-full text-center items-center justify-center flex mt-5">
          <p className="text-xs text-muted-foreground">
            Al crear una cuenta en Knoott Partners, aceptas nuestros{"  "}
            <Link
              href="/terms-and-conditions"
              className="font-medium underline hover:text-foreground"
            >
              Términos y Condiciones
            </Link>
            , así como nuestro{" "}
            <Link
              href="/privacy-policy"
              className="font-medium underline hover:text-foreground"
            >
              Aviso de Privacidad
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
