import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';

export type ConfirmType = 'info' | 'warning' | 'danger' | 'success';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: ConfirmType;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  type = 'info',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-16 h-16 text-orange-600" />;
      case 'danger':
        return <XCircle className="w-16 h-16 text-red-600" />;
      case 'info':
      default:
        return <Info className="w-16 h-16 text-blue-600" />;
    }
  };

  const getButtonStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      case 'warning':
        return 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'info':
      default:
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  const getHeaderStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-50 to-green-100 border-green-200';
      case 'warning':
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200';
      case 'danger':
        return 'bg-gradient-to-r from-red-50 to-red-100 border-red-200';
      case 'info':
      default:
        return 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scaleIn">
        {/* Header with Icon */}
        <div className={`rounded-t-2xl p-6 border-b-2 ${getHeaderStyle()}`}>
          <div className="flex flex-col items-center">
            {getIcon()}
            <h3 className="mt-4 text-2xl font-bold text-gray-900 text-center">
              {title}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 text-center text-base leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${getButtonStyle()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
