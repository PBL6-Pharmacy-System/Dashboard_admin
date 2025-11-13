import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error';
  message: string;
  description?: string;
  onClose?: () => void;
}

const Toast = ({ type, message, description, onClose }: ToastProps) => {
  const isSuccess = type === 'success';
  
  return (
    <div 
      className={`
        fixed top-6 right-6 z-50 max-w-md w-full
        bg-gradient-to-r rounded-2xl p-6 shadow-2xl
        border-2 flex items-start gap-4
        animate-slide-down
        ${isSuccess 
          ? 'from-green-50 to-green-100 border-green-500' 
          : 'from-red-50 to-red-100 border-red-500'
        }
      `}
    >
      {isSuccess ? (
        <CheckCircle size={32} className="text-green-600 flex-shrink-0" />
      ) : (
        <AlertCircle size={32} className="text-red-600 flex-shrink-0" />
      )}
      
      <div className="flex-1">
        <h3 className={`text-lg font-bold mb-1 ${isSuccess ? 'text-green-900' : 'text-red-900'}`}>
          {message}
        </h3>
        {description && (
          <p className={`text-sm ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
            {description}
          </p>
        )}
      </div>
      
      {onClose && (
        <button
          onClick={onClose}
          className={`
            p-1.5 rounded-lg transition-colors
            ${isSuccess 
              ? 'hover:bg-green-200 text-green-600' 
              : 'hover:bg-red-200 text-red-600'
            }
          `}
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};

export default Toast;
