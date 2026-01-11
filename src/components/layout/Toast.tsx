import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useAppStore } from '../../store';

export function Toast() {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
  };
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <AlertCircle className="w-5 h-5 text-error" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning" />,
    info: <Info className="w-5 h-5 text-info" />,
  };

  const bgColors = {
    success: 'bg-success/10 border-success/20',
    error: 'bg-error/10 border-error/20',
    warning: 'bg-warning/10 border-warning/20',
    info: 'bg-info/10 border-info/20',
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-card border shadow-lg min-w-[300px] max-w-md animate-slide-in ${bgColors[toast.type]}`}
      style={{
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      {icons[toast.type]}
      <div className="flex-1">
        <p className="font-medium text-primary-900">{toast.title}</p>
        {toast.message && (
          <p className="text-sm text-primary-600 mt-1">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="p-1 hover:bg-primary-200 rounded-full transition-colors"
      >
        <X className="w-4 h-4 text-primary-500" />
      </button>
    </div>
  );
}
