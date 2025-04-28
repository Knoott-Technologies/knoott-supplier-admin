"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

interface AcceptBusinessInvitationButtonProps {
  invitationId: string;
  businessId: string;
  userId: string;
  token: string;
}

const AcceptBusinessInvitationButton = ({
  invitationId,
  businessId,
  userId,
  token,
}: AcceptBusinessInvitationButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAcceptInvitation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Enviar los datos a la API para procesar en el servidor
      const response = await fetch("/api/businesses/invitations/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invitationId,
          businessId,
          userId,
          token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar la invitación");
      }

      // Si todo salió bien, redirigir al dashboard
      router.push(`/business/${businessId}/dashboard`);
    } catch (err) {
      console.error("Error al aceptar la invitación:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al aceptar la invitación"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {error && <p className="text-destructive mb-4 text-center">{error}</p>}
      <Button
        variant={"defaultBlack"}
        size={"default"}
        onClick={handleAcceptInvitation}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            Procesando... <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          </>
        ) : (
          <>
            Aceptar invitación <ArrowRight className="ml-2" />
          </>
        )}
      </Button>
    </div>
  );
};

export default AcceptBusinessInvitationButton;
