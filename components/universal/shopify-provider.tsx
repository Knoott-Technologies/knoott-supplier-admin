"use client";

import {
  useEffect,
  useState,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { createApp, type ClientApplication } from "@shopify/app-bridge";

// Contexto para App Bridge
type AppBridgeContextType = {
  app: ClientApplication | null;
  isEmbedded: boolean;
};

const AppBridgeContext = createContext<AppBridgeContextType>({
  app: null,
  isEmbedded: false,
});

export const useAppBridge = () => useContext(AppBridgeContext);

export function AppBridgeProvider({ children }: { children: ReactNode }) {
  const [appBridge, setAppBridge] = useState<ClientApplication | null>(null);
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detectar si estamos en Shopify Admin
    const query = new URLSearchParams(window.location.search);
    const host = query.get("host");

    if (!host) {
      setIsEmbedded(false);
      return;
    }

    try {
      // Inicializar App Bridge 3.x
      const app = createApp({
        apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || "",
        host: host,
      });

      setAppBridge(app);
      setIsEmbedded(true);
    } catch (error) {
      console.error("Error al inicializar App Bridge:", error);
      setIsEmbedded(false);
    }
  }, []);

  return (
    <AppBridgeContext.Provider value={{ app: appBridge, isEmbedded }}>
      {children}
    </AppBridgeContext.Provider>
  );
}
