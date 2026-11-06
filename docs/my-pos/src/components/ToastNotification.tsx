import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ToastNotification: React.FC = () => {
  const { notification, clearNotification } = useStore();

  if (!notification) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
  };

  const bgStyles = {
    success: 'bg-emerald-950/90 text-white border-emerald-800',
    error: 'bg-rose-950/90 text-white border-rose-800',
    warning: 'bg-amber-950/90 text-white border-amber-800',
    info: 'bg-slate-900/90 text-white border-slate-700',
  };

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top-3 duration-200 pointer-events-auto">
      <div className={`p-3.5 rounded-2xl border backdrop-blur-md shadow-xl flex items-center justify-between gap-3 ${bgStyles[notification.type]}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          {icons[notification.type]}
          <p className="text-xs font-medium leading-snug truncate">
            {notification.message}
          </p>
        </div>
        <button
          onClick={clearNotification}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0"
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
