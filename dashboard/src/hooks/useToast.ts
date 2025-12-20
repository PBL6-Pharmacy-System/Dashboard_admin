import { useState, useCallback } from 'react';

interface ToastData {
  type: 'success' | 'error';
  message: string;
  description?: string;
}

let globalToastFn: ((data: ToastData) => void) | null = null;

export const showGlobalToast = (type: 'success' | 'error', message: string, description?: string) => {
  if (globalToastFn) {
    globalToastFn({ type, message, description });
  }
};

export const useToast = () => {
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string, description?: string) => {
    setToast({ type, message, description });
    // Auto hide after 5 seconds
    setTimeout(() => {
      setToast(null);
    }, 5000);
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Register global toast function
  if (globalToastFn === null) {
    globalToastFn = (data: ToastData) => showToast(data.type, data.message, data.description);
  }

  return { toast, showToast, hideToast };
};
