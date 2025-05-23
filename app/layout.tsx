import type { Metadata, Viewport } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { source } from "@/components/fonts/font-def";
import { ThemeProvider } from "@/components/themes/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import {
  AlertOctagon,
  CheckCheck,
  Info,
  Loader2,
  TriangleAlert,
  X,
} from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: {
    template: "%s | Knoott Partners",
    default: "Knoott Partners",
  },
  description:
    "Ingresa a la plataforma de Knoott Partners, para gestionar tu negocio, productos, pedidos y más.",
};

export const viewport: Viewport = {
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
        <body
          className={cn(
            "antialiased text-pretty selection:text-[#886F2E] selection:bg-primary/20",
            source.className
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
          >
            <TooltipProvider delayDuration={300}>
              {children}
              <Toaster
                position="top-right"
                containerAriaLabel="Notificaciones"
                className="z-[999]"
                theme="light"
                richColors
                toastOptions={{
                  unstyled: false,
                  classNames: {
                    toast: "!rounded-none bg-background !shadow-lg !border-0",
                    content: "!rounded-none",
                    default: "!rounded-none shadow-lg border-0",
                    title: cn("!font-semibold !text-foreground"),
                    description:
                      "!text-muted-foreground !text-[13px] !font-medium !tracking-tight",
                  },
                }}
                icons={{
                  warning: <TriangleAlert className="size-4" />,
                  error: <AlertOctagon className="size-4" />,
                  success: <CheckCheck className="size-4 !text-success" />,
                  close: <X className="size-4" />,
                  info: <Info className="size-4" />,
                  loading: <Loader2 className="size-4 animate-spin" />,
                }}
              />
            </TooltipProvider>
          </ThemeProvider>
        </body>
    </html>
  );
}
