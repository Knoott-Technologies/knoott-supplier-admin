import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/universal/headers";
import { Suspense } from "react";
import { RegisterForm } from "./register-form";

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
      </div>
    </main>
  );
};

export default RegisterPage;
