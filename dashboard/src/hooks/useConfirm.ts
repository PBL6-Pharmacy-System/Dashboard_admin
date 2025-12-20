import { useState, useCallback } from 'react';
import type { ConfirmType } from '../components/ConfirmDialog';

interface ConfirmOptions {
  title: string;
  message: string;
  type?: ConfirmType;
  confirmText?: string;
  cancelText?: string;
}

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: {
      title: '',
      message: '',
      type: 'info',
      confirmText: 'Xác nhận',
      cancelText: 'Hủy',
    },
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options: {
          ...options,
          type: options.type || 'info',
          confirmText: options.confirmText || 'Xác nhận',
          cancelText: options.cancelText || 'Hủy',
        },
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(true);
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  }, [confirmState.resolve]);

  const handleCancel = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(false);
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  }, [confirmState.resolve]);

  return {
    confirm,
    confirmState,
    handleConfirm,
    handleCancel,
  };
};
