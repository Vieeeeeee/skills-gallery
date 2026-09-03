import React from 'react';
import { X, Copy, Mail, QrCode, Heart, Sparkles } from 'lucide-react';

export function AboutModal({ isOpen, onClose, onCopy }) {
  if (!isOpen) return null;

  const handleCopyWeChat = () => {
    navigator.clipboard.writeText('Wibi2077');
    if (onCopy) onCopy('微信号已复制！添加请备注：进AIGC学习群');
  };

  return (
    <div 
      className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative bg-white dark:bg-[#16161a] rounded-3xl p-6 sm:p-7 shadow-2xl border border-black/[0.08] dark:border-white/[0.12] max-w-md w-full space-y-5 text-left my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white rounded-full bg-black/5 dark:bg-white/5 transition-colors cursor-pointer"
          title="关闭"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title & Badge */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>开源交流与共建</span>
            </span>
          </div>
          <h3 className="text-lg font-bold text-[#1d1d1f] dark:text-white tracking-tight">
            Prompt & Skill 风格大赏
          </h3>
          <p className="text-xs text-[#86868b] dark:text-zinc-400 mt-0.5">
            工业级视觉生图提示词与开源智能体技能灵感字典 · 1,000+ 实测精选
          </p>
        </div>

        {/* Hall of Fame / Special Acknowledgments */}
        <div className="p-3.5 rounded-2xl bg-amber-500/[0.07] border border-amber-600/15 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>核心贡献与特别致谢</span>
          </div>
          <div className="text-xs space-y-1 text-amber-950/80 dark:text-amber-200/90 leading-relaxed font-sans">
            <p>
              • <strong>共建社群</strong>：✨ 感谢<strong>「威比🙂↔️AIGC学习群」</strong>诸位群友的无私分享与实战出图沉淀！
            </p>
            <p>
              • <strong>原始资料整理</strong>：💖 特别致谢群友 <strong>@我的世界皓宸</strong> 对海量原始视觉资料、参数调优与样张的系统化梳理和无私奉献！
            </p>
          </div>
        </div>

        {/* WeChat QR & Community Join */}
        <div className="bg-[#f5f5f7] dark:bg-[#111114] p-4 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] text-center space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <QrCode className="w-4 h-4" />
            <span>扫码添加作者微信 · 加入交流群</span>
          </div>

          <div className="bg-white p-2 rounded-xl shadow-xs max-w-[190px] mx-auto">
            <img 
              src="/wechat-qr.jpg" 
              alt="微信二维码" 
              className="w-full h-auto rounded-lg"
            />
          </div>

          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white dark:bg-[#18181d] border border-black/[0.06] dark:border-white/[0.08] text-xs">
            <span className="text-[#86868b] dark:text-zinc-400">
              微信号: <strong className="font-mono text-[#1d1d1f] dark:text-white select-all">Wibi2077</strong>
            </span>
            <button
              onClick={handleCopyWeChat}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors shadow-2xs cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>复制</span>
            </button>
          </div>
          <p className="text-[11px] text-[#86868b] dark:text-zinc-500">
            添加微信时请备注：<span className="text-emerald-700 dark:text-emerald-400 font-semibold">进AIGC学习群</span>
          </p>
        </div>

        {/* Multi-channel Contact Links */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-[#86868b] dark:text-zinc-400 tracking-wider uppercase">
            更多联系与社交主页
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <a
              href="mailto:wuwei5986@gmail.com"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-[#f5f5f7] dark:bg-[#1a1a1f] border border-black/[0.04] dark:border-white/[0.06] text-[#1d1d1f] dark:text-zinc-200 hover:border-indigo-400/50 transition-all group"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <div className="truncate">
                <div className="text-[10px] text-[#86868b] dark:text-zinc-400 leading-none">联系邮箱</div>
                <div className="font-mono font-medium truncate mt-0.5">wuwei5986...</div>
              </div>
            </a>

            <a
              href="https://x.com/wsiwsii"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-[#f5f5f7] dark:bg-[#1a1a1f] border border-black/[0.04] dark:border-white/[0.06] text-[#1d1d1f] dark:text-zinc-200 hover:border-black/20 dark:hover:border-white/20 transition-all group"
            >
              <span className="text-xs font-bold shrink-0">𝕏</span>
              <div className="truncate">
                <div className="text-[10px] text-[#86868b] dark:text-zinc-400 leading-none">Twitter / X</div>
                <div className="font-medium truncate mt-0.5">@wsiwsii</div>
              </div>
            </a>

            <a
              href="https://github.com/Vieeeeeee/skills-gallery"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-[#f5f5f7] dark:bg-[#1a1a1f] border border-black/[0.04] dark:border-white/[0.06] text-[#1d1d1f] dark:text-zinc-200 hover:border-black/20 dark:hover:border-white/20 transition-all group"
            >
              <span className="text-xs shrink-0">🐙</span>
              <div className="truncate">
                <div className="text-[10px] text-[#86868b] dark:text-zinc-400 leading-none">GitHub 开源主页</div>
                <div className="font-medium truncate mt-0.5">skills-gallery</div>
              </div>
            </a>

            <a
              href="https://github.com/Vieeeeeee/skills-gallery/issues/new?template=claim_author.yml"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-[#f5f5f7] dark:bg-[#1a1a1f] border border-black/[0.04] dark:border-white/[0.06] text-amber-800 dark:text-amber-300 hover:border-amber-400/50 transition-all group"
            >
              <span className="text-xs shrink-0">🏷️</span>
              <div className="truncate">
                <div className="text-[10px] text-[#86868b] dark:text-zinc-400 leading-none">原创作者认领</div>
                <div className="font-medium truncate mt-0.5">凭据认领 ↗</div>
              </div>
            </a>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] text-[11px] text-[#86868b] dark:text-zinc-500 text-center flex items-center justify-between">
          <span>Curated by 威比 Hunter Wei.（抖音、小红书同名）</span>
          <span>© 2026 Edition</span>
        </div>

      </div>
    </div>
  );
}
