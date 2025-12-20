import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  description?: string;
  onClose?: () => void;
}

const Toast = ({ type, message, description, onClose }: ToastProps) => {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'from-green-50 to-green-100 border-green-500',
          icon: <CheckCircle size={32} className="text-green-600 flex-shrink-0" />,
          textColor: 'text-green-900',
          descColor: 'text-green-700',
          hoverBg: 'hover:bg-green-200 text-green-600'
        };
      case 'error':
        return {
          bg: 'from-red-50 to-red-100 border-red-500',
          icon: <AlertCircle size={32} className="text-red-600 flex-shrink-0" />,
          textColor: 'text-red-900',
          descColor: 'text-red-700',
          hoverBg: 'hover:bg-red-200 text-red-600'
        };
      case 'warning':
        return {
          bg: 'from-orange-50 to-orange-100 border-orange-500',
          icon: <AlertTriangle size={32} className="text-orange-600 flex-shrink-0" />,
          textColor: 'text-orange-900',
          descColor: 'text-orange-700',
          hoverBg: 'hover:bg-orange-200 text-orange-600'
        };
      case 'info':
      default:
        return {
          bg: 'from-blue-50 to-blue-100 border-blue-500',
          icon: <Info size={32} className="text-blue-600 flex-shrink-0" />,
          textColor: 'text-blue-900',
          descColor: 'text-blue-700',
          hoverBg: 'hover:bg-blue-200 text-blue-600'
        };
    }
  };

  const styles = getStyles();
  
  return (
    <div 
      className={`
        fixed top-6 right-6 z-50 max-w-md w-full
        bg-gradient-to-r rounded-2xl p-6 shadow-2xl
        border-2 flex items-start gap-4
        animate-slide-down
        ${styles.bg}
      `}
    >
      {styles.icon}
      
      <div className="flex-1">
        <h3 className={`text-lg font-bold mb-1 ${styles.textColor}`}>
          {message}
        </h3>
        {description && (
          <p className={`text-sm ${styles.descColor}`}>
            {description}
          </p>
        )}
      </div>
      
      {onClose && (
        <button
          onClick={onClose}
          className={`
            p-1.5 rounded-lg transition-colors
            ${styles.hoverBg}
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
