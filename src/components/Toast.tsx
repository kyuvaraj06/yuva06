import React, { useEffect } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  text: string;
  type: ToastType;
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onClose: () => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    error: <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
  };

  const colors = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-900 shadow-emerald-100/30 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-100",
    error: "bg-red-50 border-red-200 text-red-900 shadow-red-100/30 dark:bg-red-950/40 dark:border-red-900 dark:text-red-100",
    info: "bg-blue-50 border-blue-200 text-blue-900 shadow-blue-100/30 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-100"
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 transform translate-y-0 animate-fade-in ${colors[toast.type]}`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 text-sm font-medium leading-relaxed">{toast.text}</div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
