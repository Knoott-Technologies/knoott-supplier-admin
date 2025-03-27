"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2, RefreshCw } from "lucide-react";

export function ProductCrawler() {
  const params = useParams<{ branchId: string }>();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [syncStats, setSyncStats] = useState<{
    total: number;
    created: number;
    updated: number;
    skipped: number;
    errors: number;
  } | null>(null);

  const startSync = async () => {
    setIsSyncing(true);
    setProgress(0);
    setSyncStats(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 1000);

      // Call the API to start the sync
      const response = await fetch(
        `/api/branches/${params.branchId}/api-integration/sync`,
        {
          method: "POST",
        }
      );

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al sincronizar productos");
      }

      const data = await response.json();
      setProgress(100);
      setSyncStats(data.stats);

      toast.success("Sincronización completada correctamente");

      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error("Error syncing products:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al sincronizar productos"
      );
      setProgress(0);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <RefreshCw className="h-6 w-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sincronización de Productos</DialogTitle>
            <DialogDescription>
              Sincroniza los productos desde la API configurada
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isSyncing ? (
              <div className="space-y-4">
                <p>Sincronizando productos...</p>
                <Progress value={progress} className="h-2 w-full" />
              </div>
            ) : syncStats ? (
              <div className="space-y-2">
                <p className="font-medium text-green-600">
                  ¡Sincronización completada!
                </p>
                <ul className="space-y-1 text-sm">
                  <li>Total de productos procesados: {syncStats.total}</li>
                  <li>Productos creados: {syncStats.created}</li>
                  <li>Productos actualizados: {syncStats.updated}</li>
                  <li>Productos omitidos: {syncStats.skipped}</li>
                  <li>Errores: {syncStats.errors}</li>
                </ul>
              </div>
            ) : (
              <p>
                Esta acción sincronizará todos los productos desde la API
                configurada. Los productos existentes serán actualizados y se
                crearán nuevos productos si es necesario.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cerrar
            </Button>
            <Button
              variant="defaultBlack"
              onClick={startSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                "Iniciar Sincronización"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
