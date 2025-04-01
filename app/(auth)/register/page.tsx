import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/universal/headers";
import { Suspense } from "react";
import { RegisterForm } from "./register-form";

const RegisterPage = () => {
  return (
    <main className="w-full h-fit items-center justify-center flex flex-col min-h-[calc(100dvh-56px)]">
      <div className="w-full h-fit items-start justify-start flex flex-col max-w-lg px-5 md:px-7 lg:px-0">
        <PageHeader
          title="Crea tu cuenta"
          description="Crea una cuenta en Knoott Partners, adminisistra tu negocio y comienza a vender."
        />
        <Card className="w-full">
          <CardContent className="bg-sidebar">
            <Suspense>
              <RegisterForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default RegisterPage;
