"use client";

import { useEffect } from "react";
import { toast } from "sonner";

interface ToastHandlerProps {
  status?: string;
  message?: string;
}

export function ToastHandler({ status, message }: ToastHandlerProps) {
  useEffect(() => {
    if (status && message) {
      if (status === "success") {
        toast.success(message);
      } else if (status === "error") {
        toast.error(message);
      }
    }
  }, [status, message]);

  // This component doesn't render anything
  return null;
}
