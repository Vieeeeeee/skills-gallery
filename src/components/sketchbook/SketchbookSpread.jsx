import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Bookmark, 
  Maximize2, 
  Terminal, 
  Palette, 
  ExternalLink,
  Sparkles,
  Tag
} from 'lucide-react';
import { GithubIcon } from '../Icons';

export function SketchbookSpread({
  item,
  index,
  onSelect,
  onCopy,
  isBookmarked,
  onToggleBookmark,
  side = 'both' // 'both' | 'left' | 'right'
}) {
  const [copied, setCopied] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!item) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8 text-amber-950/40 font-sketch-note text-sm">
        速写本空白页
      </div>
    );
  }

  const isLeftImage = index % 2 === 0;
  const imageSrc = !imgError ? (item.cover_image || (item.images && item.images.length > 0 ? item.images[0] : null)) : null;

  // Extract series name
  const seriesMatch = (item.title || '').match(/^\[([^\]]+)\]\s*(.*)$/);
  const seriesName = seriesMatch ? seriesMatch[1] : (item.category || '精选风格');
  const mainTitle = seriesMatch ? seriesMatch[2] : (item.title || '');

  const handleCopy = (e) => {
    e.stopPropagation();
    const textToCopy = item.type === 'skill' ? (item.command || item.prompt) : (item.prompt || item.description);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    if (onCopy) onCopy(item);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ---- Page 1: Artwork Page ---- */
  const renderArtworkSide = (isLeft) => (
    <div className={`w-full h-full p-4 sm:p-7 flex flex-col justify-between relative bg-sketch-paper select-none ${isLeft ? 'pr-5 sm:pr-9' : 'pl-5 sm:pl-9'}`}>
      
      {/* Top vintage plate header */}
      <div className="flex items-center justify-between text-amber-900/60 text-[11px] font-mono border-b border-amber-900/10 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="font-bold tracking-widest text-amber-950">PLATE № {String(index + 1).padStart(3, '0')}</span>
          <span>·</span>
          <span className="uppercase tracking-wider">{item.category}</span>
        </div>
        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-900/5 text-amber-900 border border-amber-900/15">
          {item.type === 'skill' ? 'SKILL WORKFLOW' : (item.type === 'tool' ? 'DESIGN TOOL' : 'VISUAL STYLE')}
        </span>
      </div>

      {/* Main artwork container with realistic washi tape & torn edge paper blend */}
      <div className="relative my-auto flex items-center justify-center p-2">
        
        {/* Washi Tape Sticker (Top-Left or Top-Right) */}
        <div className={`absolute ${isLeft ? '-top-3 left-4 -rotate-3' : '-top-3 right-4 rotate-2'} z-20 w-24 h-6 bg-amber-100/70 backdrop-blur-xs border-y border-amber-300/50 shadow-xs opacity-85 pointer-events-none`}>
          <div className="w-full h-full flex items-center justify-center text-[9px] font-mono text-amber-900/60 uppercase tracking-widest">
            {seriesName.slice(0, 8)}
          </div>
        </div>

        {/* Secondary tape on corner */}
        <div className={`absolute ${isLeft ? '-bottom-2 right-6 rotate-6' : '-bottom-2 left-6 -rotate-6'} z-20 w-16 h-5 bg-rose-100/60 backdrop-blur-xs border-y border-rose-300/40 shadow-xs opacity-80 pointer-events-none`}></div>

        {/* Artwork Card */}
        <div 
          onClick={() => onSelect(item)}
          className="relative max-w-full max-h-[380px] sm:max-h-[440px] rounded-xl overflow-hidden shadow-[0_8px_30px_rgba(60,40,15,0.12)] border border-amber-900/15 group cursor-zoom-in transition-transform duration-300 hover:scale-[1.01]"
        >
          {imageSrc ? (
            <div className="relative bg-[#f0ebd9]">
              {!imgLoaded && (
                <div className="w-64 h-64 sm:w-80 sm:h-80 bg-amber-900/5 animate-pulse flex items-center justify-center text-amber-900/30 text-xs">
                  速写本画稿载入中...
                </div>
              )}
              <img
                src={imageSrc}
                alt={item.title}
                className={`w-full h-auto max-h-[380px] sm:max-h-[440px] object-contain block transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
              <div className="absolute inset-0 bg-amber-900/5 mix-blend-multiply pointer-events-none" />
            </div>
          ) : (
            <div className="w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-100/60 p-6 flex flex-col justify-between text-amber-900 border border-amber-900/10">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-amber-900/60 font-semibold">{seriesName}</span>
                <span className="font-mono text-[10px] text-amber-900/40">{item.id}</span>
              </div>
              <div className="text-center font-calligraphy text-2xl sm:text-3xl text-amber-950 leading-relaxed">
                {mainTitle}
              </div>
              <div className="text-[11px] text-amber-900/60 font-sketch-note text-center">
                ✦ 手绘速写艺术档案 ✦
              </div>
            </div>
          )}

          {/* Hover zoom hint */}
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-sans flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="w-3 h-3" />
            <span>点击放大浏览</span>
          </div>
        </div>
      </div>

      {/* Bottom plate caption note */}
      <div className="flex items-center justify-between text-amber-900/70 text-[10px] sm:text-[11px] font-sketch-note border-t border-amber-900/10 pt-2">
        <span className="italic">Fig. {index + 1} — {mainTitle}</span>
        <span className="font-mono text-amber-900/50">{item.aspect_ratio || 'Natural Ratio'}</span>
      </div>
    </div>
  );

  /* ---- Page 2: Text & Journal Notes Side ---- */
  const renderTextSide = (isLeft) => (
    <div className={`w-full h-full p-4 sm:p-7 flex flex-col justify-between relative bg-sketch-paper bg-sketch-lines select-none ${isLeft ? 'pr-5 sm:pr-9' : 'pl-5 sm:pl-9'}`}>
      
      {/* Top Header: Vintage Stamp & Series Tag */}
      <div className="flex items-center justify-between gap-2 border-b border-amber-900/10 pb-2.5">
        <div className="flex items-center gap-2">
          {/* Vintage Wax Stamp Badge */}
          <span className="px-2.5 py-0.5 rounded-full bg-amber-900/10 border border-amber-900/20 text-amber-950 font-serif font-bold text-[11px] tracking-wide shadow-2xs">
            {seriesName}
          </span>
          <span className="font-mono text-[10px] text-amber-900/50">{item.id}</span>
        </div>

        {/* Bookmark button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(item.id);
          }}
          className={`p-1.5 rounded-full transition-all border ${
            isBookmarked
              ? 'bg-amber-100 border-amber-400 text-amber-700 shadow-xs'
              : 'bg-white/60 hover:bg-white border-amber-900/15 text-amber-900/60 hover:text-amber-950'
          }`}
          title="收藏本页"
        >
          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-600' : ''}`} />
        </button>
      </div>

      {/* Main Journal Title & Author */}
      <div className="space-y-2 my-2">
        <h2 className="font-calligraphy text-2xl sm:text-3xl lg:text-[32px] text-amber-950 leading-tight font-bold tracking-tight">
          {mainTitle}
        </h2>
        
        <div className="flex items-center gap-2 text-xs text-amber-900/70 font-sketch-note">
          <span>Author:</span>
          <span className="font-semibold text-amber-950">@{item.author || '开源社区'}</span>
          {item.repo_url && (
            <a
              href={item.repo_url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-amber-900/60 hover:text-amber-950 transition-colors inline-flex items-center gap-1 ml-1"
              title="访问 GitHub 源码仓库"
            >
              <GithubIcon className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Description / Story Excerpt */}
      {item.description && (
        <div className="text-xs sm:text-[13px] text-amber-950/80 leading-relaxed font-sketch-note italic bg-amber-900/[0.03] p-2.5 rounded-lg border-l-2 border-amber-900/30">
          "{item.description}"
        </div>
      )}

      {/* Sticky Memo Pad: Prompt / Command Box */}
      <div className="relative bg-[#fffdf8] rounded-xl p-3 sm:p-3.5 border border-amber-900/20 shadow-[0_4px_16px_rgba(60,40,15,0.06)] my-1">
        {/* Paper clip accent */}
        <div className="absolute -top-2.5 right-4 w-4 h-6 border-2 border-amber-900/40 rounded-full pointer-events-none opacity-60" />
        
        <div className="flex items-center justify-between text-[10px] font-mono text-amber-900/60 pb-1.5 border-b border-amber-900/10 mb-1.5">
          <span className="font-bold uppercase tracking-wider text-amber-950">
            {item.type === 'skill' ? 'INSTALLATION COMMAND' : 'PROMPT RECIPE'}
          </span>
          <span className="text-[10px] text-amber-900/50">{item.aspect_ratio ? `${item.aspect_ratio}` : 'Ready to use'}</span>
        </div>

        <p className="text-xs font-mono text-amber-950 line-clamp-3 leading-relaxed select-text font-normal">
          {item.type === 'skill' ? (item.command || item.prompt) : (item.prompt || item.description)}
        </p>

        {/* Copy Stamp Button */}
        <div className="mt-2.5 pt-2 border-t border-amber-900/10 flex items-center justify-between gap-2">
          <button
            onClick={handleCopy}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-serif font-bold transition-all border ${
              copied
                ? 'bg-emerald-100 border-emerald-400 text-emerald-900 shadow-xs'
                : 'bg-amber-900 text-[#faf7f0] hover:bg-amber-950 border-amber-950 shadow-xs hover:shadow-md'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 opacity-80" />}
            <span>{copied ? '已盖章复制！' : (item.type === 'skill' ? '复制安装指令' : '复制 Prompt 提示词')}</span>
          </button>

          <button
            onClick={() => onSelect(item)}
            className="p-1.5 rounded-lg bg-white hover:bg-amber-50 text-amber-900 border border-amber-900/20 text-xs shadow-2xs transition-colors"
            title="查看完整详情参数"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tags & Footer */}
      <div className="flex items-center justify-between gap-2 text-[10px] text-amber-900/60 pt-1 border-t border-amber-900/10">
        <div className="flex items-center gap-1 overflow-hidden">
          <Tag className="w-3 h-3 text-amber-900/40 shrink-0" />
          {(item.tags || []).slice(0, 3).map((tg, i) => (
            <span key={i} className="bg-amber-900/5 px-1.5 py-0.5 rounded text-amber-900/70 font-mono">
              #{tg}
            </span>
          ))}
        </div>
        <span className="font-handwriting text-xs text-amber-900/80 font-bold">
          Page {index + 1}
        </span>
      </div>

    </div>
  );

  /* ---- Single Page or Dual Page Layout ---- */
  if (side === 'left') {
    return isLeftImage ? renderArtworkSide(true) : renderTextSide(true);
  }
  if (side === 'right') {
    return isLeftImage ? renderTextSide(false) : renderArtworkSide(false);
  }

  // Dual Page Spread (Desktop/Tablet)
  return (
    <div className="w-full h-full flex flex-col md:flex-row relative">
      {/* Left Page */}
      <div className="w-full md:w-1/2 h-full border-b md:border-b-0 md:border-r border-amber-900/15 relative">
        {isLeftImage ? renderArtworkSide(true) : renderTextSide(true)}
      </div>

      {/* Center Book Spine Shadow */}
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-8 book-spine-shadow z-20 pointer-events-none" />

      {/* Right Page */}
      <div className="w-full md:w-1/2 h-full relative">
        {isLeftImage ? renderTextSide(false) : renderArtworkSide(false)}
      </div>
    </div>
  );
}

