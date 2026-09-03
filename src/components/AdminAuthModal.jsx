import React, { useState } from 'react';
import { Lock, KeyRound, X, ShieldAlert } from 'lucide-react';

export function AdminAuthModal({
  isOpen,
  onClose,
  onAuthenticate,
  correctPasscode = 'Wibi888'
}) {
  const [inputPasscode, setInputPasscode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputPasscode === correctPasscode) {
      setError('');
      setInputPasscode('');
      onAuthenticate();
      onClose();
    } else {
      setError('口令验证未通过，请重新输入');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white border border-black/[0.08] rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] p-6 z-10 animate-scale-in text-[#1d1d1f]">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] flex items-center justify-center text-[#1d1d1f]">
            <Lock className="w-5 h-5 text-indigo-600" />
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1 mb-5">
          <h3 className="text-base font-bold text-[#1d1d1f] tracking-tight">
            管理员身份验证
          </h3>
          <p className="text-xs text-[#6e6e73]">
            请输入管理员私密口令以解锁编辑、删除与文件增补权限。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1d1d1f] flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#86868b]" />
              管理员口令
            </label>
            <input
              type="password"
              autoFocus
              value={inputPasscode}
              onChange={(e) => {
                setInputPasscode(e.target.value);
                if (error) setError('');
              }}
              placeholder="请输入管理员私密口令"
              className="w-full px-3.5 py-2.5 bg-[#f5f5f7] focus:bg-white border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-xs text-[#1d1d1f] placeholder-[#86868b] outline-none transition-all"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs animate-fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#f5f5f7] hover:bg-[#e8e8ed] text-xs font-medium text-[#515154] hover:text-[#1d1d1f] transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#1d1d1f] hover:bg-black text-xs font-semibold text-white shadow-xs transition-all"
            >
              解锁权限
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

