import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import React from 'react';
import { useAuth } from '../context/AuthContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAuth();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border text-sm transition-all duration-200 animate-in slide-in-from-right-4 ${
            toast.type === 'success'
              ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-100 shadow-emerald-950/40'
              : toast.type === 'error'
              ? 'bg-slate-900/95 border-rose-500/40 text-rose-100 shadow-rose-950/40'
              : 'bg-slate-900/95 border-sky-500/40 text-sky-100 shadow-sky-950/40'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400" />}
          </div>
          <div className="flex-1 font-medium leading-snug">{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-white transition-colors p-0.5"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
