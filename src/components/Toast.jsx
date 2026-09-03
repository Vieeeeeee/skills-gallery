import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || (toast.type === 'error' ? 5000 : 3000));
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const typeConfig = {
    success: {
      bg: 'bg-white dark:bg-[#18181d] border-black/[0.08] dark:border-white/[0.12] text-[#1d1d1f] dark:text-zinc-100 shadow-[0_12px_32px_rgba(0,0,0,0.12)]',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900/70 text-rose-900 dark:text-rose-200 shadow-[0_12px_32px_rgba(225,29,72,0.1)]',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
    },
    info: {
      bg: 'bg-white dark:bg-[#18181d] border-black/[0.08] dark:border-white/[0.12] text-[#1d1d1f] dark:text-zinc-100 shadow-[0_12px_32px_rgba(0,0,0,0.12)]',
      icon: <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />,
    }
  };

  const current = typeConfig[toast.type] || typeConfig.info;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-scale-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md max-w-md ${current.bg}`}>
        {current.icon}
        <div className="text-xs font-semibold leading-relaxed">{toast.message}</div>
        <button
          onClick={onClose}
          className="ml-auto p-1 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.1] text-[#86868b] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

