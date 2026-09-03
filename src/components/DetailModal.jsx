import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Bookmark, 
  Sparkles, 
  Terminal, 
  Tag, 
  Compass,
  Layers,
  ArrowRight,
  Maximize2,
  Download,
  Palette,
  Wrench
} from 'lucide-react';
import { GithubIcon } from './Icons';
import { ImageLightbox } from './ImageLightbox';

export function DetailModal({
  item,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onCopy,
  onSelectRelated,
  relatedItems = []
}) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedInstallCmd, setCopiedInstallCmd] = useState(false);
  const [copiedMotion, setCopiedMotion] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!isOpen || !item) return null;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(item.prompt || item.description);
    setCopiedPrompt(true);
    if (onCopy) onCopy('提示词已完整复制到剪贴板');
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(item.command || item.prompt);
    setCopiedCmd(true);
    if (onCopy) onCopy('调用指令已复制');
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleCopyInstallCmd = () => {
    navigator.clipboard.writeText(item.install_command || item.command);
    setCopiedInstallCmd(true);
    if (onCopy) onCopy('安装指令已复制');
    setTimeout(() => setCopiedInstallCmd(false), 2000);
  };

  const images = item.images && item.images.length > 0 
    ? item.images 
    : (item.cover_image ? [item.cover_image] : []);

  const openLightbox = (index = 0) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const seriesMatch = (item.title || '').match(/^\[([^\]]+)\]\s*(.*)$/);
  const seriesName = seriesMatch ? seriesMatch[1] : (item.category || '精选');
  const mainTitle = seriesMatch ? seriesMatch[2] : (item.title || '');

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-4xl lg:max-w-5xl bg-white dark:bg-[#101014] rounded-2xl sm:rounded-3xl shadow-2xl border border-black/[0.08] dark:border-white/[0.12] overflow-hidden my-auto max-h-[92vh] flex flex-col text-[#1d1d1f] dark:text-zinc-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-black/[0.06] dark:border-white/[0.08] shrink-0 bg-[#fafafc] dark:bg-[#141419]">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 shrink-0">
                {seriesName}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#1d1d1f] dark:text-white truncate">
                {mainTitle}
              </h2>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white dark:bg-white/[0.08] hover:bg-[#f5f5f7] dark:hover:bg-white/[0.14] border border-black/[0.08] dark:border-white/[0.1] text-[#86868b] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-white transition-all"
                title="关闭"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            
            {/* 1. Images Gallery Area (If images exist) */}
            {images.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#86868b] dark:text-zinc-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    效果展示与样例 ({images.length})
                  </span>
                  <span className="text-[11px] text-[#86868b] dark:text-zinc-500">
                    点击图片查看全屏无损大图
                  </span>
                </div>

                <div className={`grid gap-2.5 sm:gap-3 ${
                  images.length === 1 
                    ? 'grid-cols-1 max-w-sm mx-auto' 
                    : images.length === 2 
                      ? 'grid-cols-2' 
                      : images.length === 3 
                        ? 'grid-cols-3' 
                        : 'grid-cols-2 lg:grid-cols-4'
                }`}>
                  {images.map((img, idx) => (
                    <div 
                      key={idx}
                      onClick={() => openLightbox(idx)}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-[#f5f5f7] dark:bg-[#18181d] border border-black/[0.06] dark:border-white/[0.08] cursor-zoom-in flex items-center justify-center shadow-xs"
                    >
                      <img
                        src={img}
                        alt={`${mainTitle} 样例 ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="p-2 rounded-full bg-white/90 dark:bg-zinc-800/90 text-[#1d1d1f] dark:text-white shadow-md backdrop-blur-md">
                          <Maximize2 className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Metadata Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 sm:p-3.5 bg-[#f8f8fa] dark:bg-[#16161c] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] text-xs">
              <div>
                <span className="text-[#86868b] dark:text-zinc-400 block text-[11px]">内容类型</span>
                <span className="font-semibold text-[#1d1d1f] dark:text-white mt-0.5 inline-flex items-center gap-1">
                  {item.type === 'style' ? '🎨 视觉风格' : (item.type === 'skill' ? '⚡ 智能体技能' : '🛠️ 设计工具')}
                </span>
              </div>
              <div>
                <span className="text-[#86868b] dark:text-zinc-400 block text-[11px]">所属分类</span>
                <span className="font-semibold text-[#1d1d1f] dark:text-white mt-0.5 block">{item.category}</span>
              </div>
              <div>
                <span className="text-[#86868b] dark:text-zinc-400 block text-[11px]">创作者 / 来源</span>
                <span className="font-semibold text-[#1d1d1f] dark:text-white mt-0.5 block truncate">
                  @{item.author === 'Vie' || item.author === 'vie' || item.author === 'Vie (威比)' ? '威比 Hunter Wei.' : (item.author || '开源社区')}
                </span>
              </div>
              <div>
                <span className="text-[#86868b] dark:text-zinc-400 block text-[11px]">{item.type === 'style' ? '建议画幅' : '系统编号'}</span>
                <span className="font-mono font-semibold text-[#1d1d1f] dark:text-white mt-0.5 block">
                  {item.type === 'style' ? (item.aspect_ratio || '3:4 / 自适应') : item.id}
                </span>
              </div>
            </div>

            {/* 3. TYPE-SPECIFIC SECTIONS */}

            {/* A. Style Details (Prompt Box) */}
            {item.type === 'style' && (
              <div className="space-y-3.5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      完整生图提示词 (Prompt)
                    </label>
                    <button
                      onClick={handleCopyPrompt}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        copiedPrompt 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' 
                          : 'bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      }`}
                    >
                      {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPrompt ? '已复制' : '一键复制 Prompt'}</span>
                    </button>
                  </div>
                  <div className="relative p-3.5 sm:p-4 rounded-2xl bg-[#f5f5f7] dark:bg-black/60 border border-black/[0.06] dark:border-white/[0.08] text-xs sm:text-sm text-[#1d1d1f] dark:text-zinc-100 font-mono leading-relaxed whitespace-pre-wrap select-all max-h-[300px] overflow-y-auto">
                    {item.prompt}
                  </div>
                </div>

                {/* Motion Prompt */}
                {item.is_motion && item.motion_prompt && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        动态视频运镜提示词 (Motion Prompt)
                      </label>
                      <button
                        onClick={handleCopyMotion}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          copiedMotion 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' 
                            : 'bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        }`}
                      >
                        {copiedMotion ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedMotion ? '已复制' : '复制运镜词'}</span>
                      </button>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-200 font-mono leading-relaxed select-all">
                      {item.motion_prompt}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* B. Skill Details (Call & Install Command & Repo) */}
            {item.type === 'skill' && (
              <div className="space-y-3.5">
                {/* Description */}
                {item.description && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-[#1d1d1f] dark:text-white">技能说明</span>
                    <div className="p-3.5 rounded-2xl bg-[#f8f8fa] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] text-xs sm:text-sm text-[#515154] dark:text-zinc-300 leading-relaxed">
                      {item.description}
                    </div>
                  </div>
                )}

                {/* 1. Install Command (PRIMARY & PROMINENT) */}
                {item.install_command && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Skill 安装命令 (最重要 · 一键安装)
                      </label>
                      <button
                        onClick={handleCopyInstallCmd}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          copiedInstallCmd 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' 
                            : 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs'
                        }`}
                      >
                        {copiedInstallCmd ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />}
                        <span>{copiedInstallCmd ? '已复制安装指令' : '一键复制安装指令'}</span>
                      </button>
                    </div>
                    <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-700/50 text-emerald-950 dark:text-emerald-300 font-mono text-xs sm:text-sm overflow-x-auto shadow-2xs">
                      <code>{item.install_command}</code>
                    </div>
                  </div>
                )}

                {/* 2. Call Command (SECONDARY & SUBTLE) */}
                {item.command && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-[#86868b] dark:text-zinc-400 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-[#86868b] dark:text-zinc-400" />
                        安装后在对话中调用 (可选)
                      </label>
                      <button
                        onClick={handleCopyCmd}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          copiedCmd 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' 
                            : 'bg-[#f5f5f7] dark:bg-white/[0.08] hover:bg-[#ebebed] text-[#6e6e73] dark:text-zinc-300 border border-black/[0.06] dark:border-white/[0.1]'
                        }`}
                      >
                        {copiedCmd ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCmd ? '已复制' : '复制调用词'}</span>
                      </button>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#f8f8fa] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] text-[#515154] dark:text-zinc-300 font-mono text-xs overflow-x-auto">
                      <code>{item.command}</code>
                    </div>
                  </div>
                )}

                {/* Repo Direct Link */}
                {item.repo_url && (
                  <a
                    href={item.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f5f5f7] dark:bg-[#18181d] hover:bg-[#ebebed] dark:hover:bg-[#222228] border border-black/[0.06] dark:border-white/[0.08] transition-all text-xs text-[#1d1d1f] dark:text-white font-medium group"
                  >
                    <span className="flex items-center gap-2">
                      <GithubIcon className="w-4 h-4 text-[#1d1d1f] dark:text-white" />
                      <span>查看 GitHub 开源仓库</span>
                    </span>
                    <span className="flex items-center gap-1 text-[#86868b] dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      <span className="font-mono truncate max-w-[240px] sm:max-w-md">{item.repo_url}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </span>
                  </a>
                )}
              </div>
            )}

            {/* C. Tool Details (Features & External Link) */}
            {item.type === 'tool' && (
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-[#1d1d1f]">工具简介</span>
                  <div className="p-3.5 rounded-2xl bg-[#f8f8fa] border border-black/[0.04] text-xs sm:text-sm text-[#515154] leading-relaxed">
                    {item.description || '精选现代高质感前端与设计开发实用工具。'}
                  </div>
                </div>

                {item.repo_url && (
                  <a
                    href={item.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>立即打开并使用该工具</span>
                  </a>
                )}
              </div>
            )}

            {/* Tags Row */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-xs text-[#86868b] font-medium flex items-center gap-1 mr-1">
                  <Tag className="w-3.5 h-3.5" />
                  标签:
                </span>
                {item.tags.map((tg, i) => (
                  <span 
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-lg bg-[#f5f5f7] text-[#515154] font-medium"
                  >
                    #{tg}
                  </span>
                ))}
              </div>
            )}

            {/* Related Recommendations */}
            {relatedItems && relatedItems.length > 0 && (
              <div className="pt-3 border-t border-black/[0.06] space-y-2.5">
                <span className="text-xs font-semibold text-[#86868b] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-indigo-600" />
                  同分类灵感推荐
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {relatedItems.slice(0, 3).map((rel) => (
                    <button
                      key={rel.id}
                      onClick={() => onSelectRelated(rel)}
                      className="p-2.5 rounded-xl bg-[#f8f8fa] hover:bg-[#f0f0f4] border border-black/[0.04] text-left transition-all group"
                    >
                      <div className="text-xs font-semibold text-[#1d1d1f] group-hover:text-indigo-600 truncate">
                        {rel.title.replace(/^\[[^\]]+\]\s*/, '')}
                      </div>
                      <div className="text-[11px] text-[#86868b] mt-0.5">
                        @{rel.author || '开源社区'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Footer Action Bar */}
          <div className="p-4 sm:p-5 border-t border-black/[0.06] bg-[#fafafc] flex items-center justify-between gap-3 shrink-0">
            <span className="text-xs text-[#86868b] font-mono hidden sm:inline">
              ID: {item.id}
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {item.type === 'skill' ? (
                <button
                  onClick={handleCopyCmd}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all"
                >
                  {copiedCmd ? <Check className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
                  <span>{copiedCmd ? '已复制安装指令' : '复制安装指令'}</span>
                </button>
              ) : item.type === 'tool' && item.repo_url ? (
                <a
                  href={item.repo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>访问工具</span>
                </a>
              ) : (
                <button
                  onClick={handleCopyPrompt}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
                >
                  {copiedPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPrompt ? '已复制 Prompt' : '复制生图 Prompt'}</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#f5f5f7] border border-black/[0.08] text-[#515154] hover:text-[#1d1d1f] text-xs font-semibold transition-all"
              >
                关闭
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Standalone Fullscreen Lightbox */}
      <ImageLightbox
        isOpen={lightboxOpen}
        images={images}
        currentIndex={lightboxIndex}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
