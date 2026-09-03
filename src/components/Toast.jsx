import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const typeConfig = {
    success: {
      bg: 'bg-white border-black/[0.08] text-[#1d1d1f] shadow-[0_12px_32px_rgba(0,0,0,0.12)]',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-900 shadow-[0_12px_32px_rgba(225,29,72,0.1)]',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    },
    info: {
      bg: 'bg-white border-black/[0.08] text-[#1d1d1f] shadow-[0_12px_32px_rgba(0,0,0,0.12)]',
      icon: <Info className="w-5 h-5 text-indigo-600 shrink-0" />,
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
          className="ml-auto p-1 rounded-lg hover:bg-black/[0.05] text-[#86868b] hover:text-[#1d1d1f] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

