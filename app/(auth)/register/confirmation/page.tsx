import { libre } from "@/components/fonts/font-def";
import { cn } from "@/lib/utils";
import Image from "next/image";

const ConfirmationPage = ({
  searchParams,
}: {
  searchParams: { email: string };
}) => {
  return (
    <main className="w-full h-fit items-center justify-center flex flex-col min-h-[calc(100dvh_-_56px)] px-3 md:px-7 lg:px-0">
      <span className="max-w-2xl mx-auto flex flex-col gap-y-7 items-center justify-center">
        <div className="w-full max-w-xl mx-auto aspect-[3/2] relative">
          <Image
            src={"/email-sent-illustration.svg"}
            alt="Email sent illustration"
            fill
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col gap-y-2 lg:gap-y-3 items-start justify-start">
          <h1
            className={cn(
              libre.className,
              "text-3xl lg:text-4xl text-center font-semibold tracking-tight"
            )}
          >
            Te hemos enviado un enlace de verificación por correo electrónico
          </h1>
          <p className="text-muted-foreground text-base lg:text-lg text-center">
            Por favor, da click en el enlace que hemos enviado a{" "}
            <span className="text-foreground font-medium italic">
              {searchParams.email}
            </span>
            , recuerda revisar en tu carpeta de spam, cuando verifiques tu
            correo, puedes cerrar esta pestaña.
          </p>
        </div>
      </span>
    </main>
  );
};

export default ConfirmationPage;
