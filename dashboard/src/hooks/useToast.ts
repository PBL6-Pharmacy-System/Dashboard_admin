import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastData {
  type: ToastType;
  message: string;
  description?: string;
}

let globalToastFn: ((data: ToastData) => void) | null = null;

export const showGlobalToast = (type: ToastType, message: string, description?: string) => {
  if (globalToastFn) {
    globalToastFn({ type, message, description });
  }
};

export const useToast = () => {
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = useCallback((type: ToastType, message: string, description?: string) => {
    setToast({ type, message, description });
    // Auto hide after 5 seconds
    setTimeout(() => {
      setToast(null);
    }, 5000);
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const success = useCallback((message: string, description?: string) => {
    showToast('success', message, description);
  }, [showToast]);

  const error = useCallback((message: string, description?: string) => {
    showToast('error', message, description);
  }, [showToast]);

  const warning = useCallback((message: string, description?: string) => {
    showToast('warning', message, description);
  }, [showToast]);

  const info = useCallback((message: string, description?: string) => {
    showToast('info', message, description);
  }, [showToast]);

  // Register global toast function
  if (globalToastFn === null) {
    globalToastFn = (data: ToastData) => showToast(data.type, data.message, data.description);
  }

  return { toast, showToast, hideToast, success, error, warning, info };
};
