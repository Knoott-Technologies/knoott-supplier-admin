"use client";

import { Redirect, Toast } from "@shopify/app-bridge/actions";
import { getSessionToken as appBridgeGetSessionToken } from "@shopify/app-bridge/utilities";
import type { ClientApplication } from "@shopify/app-bridge";
import { useAppBridge } from "@/components/universal/shopify-provider";

// Hook para usar redirecciones
export function useRedirect() {
  const { app } = useAppBridge();

  return {
    toApp: (path: string) => {
      if (!app) return;
      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.APP, path);
    },
    toRemote: (url: string) => {
      if (!app) return;
      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.REMOTE, url);
    },
  };
}

// Hook para usar toasts
export function useToast() {
  const { app } = useAppBridge();

  return {
    show: (options: { message: string; isError?: boolean }) => {
      if (!app) return;
      const toast = Toast.create(app, {
        message: options.message,
        duration: 5000,
        isError: options.isError,
      });
      toast.dispatch(Toast.Action.SHOW);
    },
  };
}

// Función para obtener el token de sesión
export async function getSessionToken(
  app: ClientApplication | null
): Promise<string | null> {
  if (!app) return null;

  try {
    // Forma correcta de obtener el token en App Bridge 3.x
    return await appBridgeGetSessionToken(app);
  } catch (error) {
    console.error("Error al obtener el token de sesión:", error);
    return null;
  }
}

// Crear un fetch autenticado
export function createAuthenticatedFetch(app: ClientApplication | null) {
  return async (uri: string, options?: RequestInit) => {
    if (!app) {
      return fetch(uri, options);
    }

    try {
      const token = await getSessionToken(app);
      const headers = new Headers(options?.headers);

      if (token) {
        headers.append("Authorization", `Bearer ${token}`);
      }

      return fetch(uri, {
        ...options,
        headers,
      });
    } catch (error) {
      console.error("Error en fetch autenticado:", error);
      return fetch(uri, options);
    }
  };
}
