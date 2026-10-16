import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X, RotateCcw } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useFinance();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-5 ${
              isSuccess
                ? 'bg-[#0b1b17]/90 border-emerald-500/40 text-emerald-100 shadow-emerald-950/40'
                : isWarning
                ? 'bg-[#1e1507]/90 border-amber-500/40 text-amber-100 shadow-amber-950/40'
                : isError
                ? 'bg-[#1e0a0a]/90 border-rose-500/40 text-rose-100 shadow-rose-950/40'
                : 'bg-[#0f172a]/90 border-cyan-500/40 text-cyan-100 shadow-cyan-950/40'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {isError && <XCircle className="w-5 h-5 text-rose-400" />}
              {!isSuccess && !isWarning && !isError && <Info className="w-5 h-5 text-cyan-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">{toast.title}</p>
              {toast.message && (
                <p className="text-xs opacity-80 mt-1 leading-relaxed break-words">{toast.message}</p>
              )}

              {toast.undoAction && (
                <button
                  onClick={() => {
                    toast.undoAction?.();
                    removeToast(toast.id);
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20 active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Undo Action
                </button>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
