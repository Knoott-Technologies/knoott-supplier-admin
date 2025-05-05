import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import AcceptBusinessInvitationButton from "./_components/accept-button";
import { libre } from "@/components/fonts/font-def";

const AcceptBusinessInvitationPage = async ({
  searchParams,
}: {
  searchParams: { token: string };
}) => {
  const token = searchParams.token;

  if (!token) {
    return (
      <main className="w-full h-fit items-center justify-center flex flex-col min-h-dvh px-3 md:px-7 lg:px-0">
        <span className="max-w-3xl mx-auto flex flex-col gap-y-7 items-center justify-center">
          <div className="w-full max-w-xl mx-auto aspect-[3/2] relative">
            <Image
              src={"/error-illustration.svg"}
              alt="Error illustration"
              fill
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col gap-y-2 lg:gap-y-3 items-center justify-center">
            <h1
              className={cn(
                libre.className,
                "text-3xl lg:text-5xl text-center font-semibold tracking-tight"
              )}
            >
              Enlace incompleto
            </h1>
            <p className="text-muted-foreground text-base lg:text-lg text-center">
              Parece que el enlace de invitación está incompleto o ha sido
              modificado. Verifica que estés utilizando el enlace tal como lo
              recibiste en tu correo electrónico o intenta solicitar una nueva
              invitación.
            </p>
          </div>
          <Button asChild variant={"defaultBlack"} size={"default"}>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </span>
      </main>
    );
  }

  const admin = createAdminClient();
  const supabase = createClient(cookies());

  const { data: user } = await supabase.auth.getUser();

  // Verificar si existe una invitación válida con el token proporcionado
  const { data: invitation, error: invitationError } = await admin
    .from("business_invitations")
    .select(`*, business:provider_business(*)`)
    .eq("invitation_token", token)
    .single();

  if (invitationError || !invitation) {
    return (
      <main className="w-full h-fit items-center justify-center flex flex-col min-h-dvh px-3 md:px-7 lg:px-0">
        <span className="max-w-3xl mx-auto flex flex-col gap-y-7 items-center justify-center">
          <div className="w-full max-w-xl mx-auto aspect-[3/2] relative">
            <Image
              src={"/not-found-illustration.svg"}
              alt="Not found illustration"
              fill
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col gap-y-2 lg:gap-y-3 items-center justify-center">
            <h1
              className={cn(
                libre.className,
                "text-3xl lg:text-5xl text-center font-semibold tracking-tight"
              )}
            >
              Invitación no disponible
            </h1>
            <p className="text-muted-foreground text-base lg:text-lg text-center">
              Lo sentimos, pero no pudimos encontrar esta invitación en nuestro
              sistema. Es posible que el enlace haya expirado, o que la
              invitación ya no esté disponible. Si crees que esto es un error,
              contacta a la persona que te invitó.
            </p>
          </div>
          <Button asChild variant={"defaultBlack"} size={"default"}>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </span>
      </main>
    );
  }

  // Si la invitación ya fue aceptada
  if (invitation.status === "accepted") {
    return (
      <main className="w-full h-fit items-center justify-center flex flex-col min-h-dvh px-3 md:px-7 lg:px-0">
        <span className="max-w-3xl mx-auto flex flex-col gap-y-7 items-center justify-center">
          <div className="w-full max-w-xl mx-auto aspect-[3/2] relative">
            <Image
              src={"/success-illustration.svg"}
              alt="Success illustration"
              fill
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col gap-y-2 lg:gap-y-3 items-center justify-center">
            <h1
              className={cn(
                libre.className,
                "text-3xl lg:text-5xl text-center font-semibold tracking-tight"
              )}
            >
              ¡Ya eres parte de este negocio!
            </h1>
            <p className="text-muted-foreground text-base lg:text-lg text-center">
              Fantástico, ya has aceptado esta invitación anteriormente y formas
              parte del equipo. Puedes acceder directamente al panel de
              administración para continuar gestionando todos los detalles del
              negocio.
            </p>
          </div>
          <Button asChild variant={"defaultBlack"} size={"default"}>
            <Link href={`/dashboard/${invitation.business_id}`}>
              Ir a mi dashboard <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </span>
      </main>
    );
  }

  type Role = "admin" | "supervisor" | "staff";
  // Obtener el rol en español para mostrarlo
  const roleInSpanish =
    {
      admin: "Administrador",
      supervisor: "Supervisor",
      staff: "Staff",
    }[invitation.role as Role] || "Colaborador";

  // Si el usuario está autenticado
  if (user && user.user) {
    return (
      <main className="w-full h-fit items-center justify-center flex flex-col min-h-dvh px-3 md:px-7 lg:px-0">
        <span className="max-w-3xl mx-auto flex flex-col gap-y-7 items-center justify-center">
          <div className="w-full max-w-xl mx-auto aspect-[3/2] relative">
            <Image
              src={"/login-required-illustration.svg"}
              alt="Invitation illustration"
              fill
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col gap-y-2 lg:gap-y-3 items-center justify-center">
            <h1
              className={cn(
                libre.className,
                "text-3xl lg:text-5xl text-center font-semibold tracking-tight"
              )}
            >
              ¡Bienvenido al equipo!
            </h1>
            <p className="text-muted-foreground text-base lg:text-lg text-center">
              Has sido invitado a unirte a{" "}
              <span className="text-foreground font-medium">
                {invitation.business.business_name}
              </span>{" "}
              como{" "}
              <span className="text-foreground font-medium">
                {roleInSpanish}
              </span>
              . Solo un click te separa de comenzar a colaborar en este
              proyecto. ¿Listo para formar parte del equipo?
            </p>
          </div>
          <AcceptBusinessInvitationButton
            invitationId={invitation.id}
            businessId={invitation.business_id}
            userId={user.user.id}
            token={token}
          />
        </span>
      </main>
    );
  }

  // Si no hay usuario autenticado
  return (
    <main className="w-full h-fit items-center justify-center flex flex-col min-h-dvh px-3 md:px-7 lg:px-0">
      <span className="max-w-3xl mx-auto flex flex-col gap-y-7 items-center justify-center">
        <div className="w-full max-w-xl mx-auto aspect-[3/2] relative">
          <Image
            src={"/login-required-illustration.svg"}
            alt="Login required illustration"
            fill
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col gap-y-2 lg:gap-y-3 items-center justify-center">
          <h1
            className={cn(
              libre.className,
              "text-3xl lg:text-5xl text-center font-semibold tracking-tight"
            )}
          >
            A un paso de unirte al equipo
          </h1>
          <p className="text-muted-foreground text-base lg:text-lg text-center">
            ¡Buenas noticias! Has sido invitado a colaborar en{" "}
            <span className="text-foreground font-medium">
              {invitation.business?.business_name || "un negocio"}
            </span>
            . Para acceder a todas las herramientas y comenzar a colaborar,
            necesitas crear una cuenta o iniciar sesión si ya eres parte de
            nuestra plataforma.
          </p>
        </div>
        <div className="flex flex-col space-y-2 w-full max-w-xl">
          <Button
            asChild
            className="w-full"
            variant={"defaultBlack"}
            size={"default"}
          >
            <Link
              href={`/register?businessId=${invitation.business_id}&token=${token}`}
            >
              Crea tu cuenta <ArrowRight className="ml-2" />
            </Link>
          </Button>
          <Button
            asChild
            className="w-full"
            variant={"outline"}
            size={"default"}
          >
            <Link
              href={`/login?businessId=${invitation.business_id}&token=${token}`}
            >
              Iniciar sesión
            </Link>
          </Button>
        </div>
      </span>
    </main>
  );
};

export default AcceptBusinessInvitationPage;
