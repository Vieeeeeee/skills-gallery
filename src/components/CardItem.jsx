import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Bookmark, 
  Palette, 
  Terminal, 
  Sparkles, 
  Edit3, 
  Trash2,
  Maximize2,
  ExternalLink
} from 'lucide-react';
import { GithubIcon } from './Icons';

export function CardItem({
  item,
  onSelect,
  onCopy,
  isBookmarked,
  onToggleBookmark,
  isAdmin,
  onEdit,
  onDelete,
  onTagClick,
  viewMode = 'grid'
}) {
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCopyClick = (e) => {
    e.stopPropagation();
    let textToCopy = '';
    if (item.type === 'skill') {
      textToCopy = item.install_command || item.command || (item.slug ? `使用 $${item.slug} 处理这张照片` : item.prompt);
    } else if (item.type === 'tool') {
      textToCopy = item.website_url || item.repo_url || item.command || '';
    } else {
      textToCopy = item.prompt || item.description;
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    if (onCopy) onCopy(item);
    setTimeout(() => setCopied(false), 2000);
  };

  const imageSrc = !imageError ? (item.cover_image || (item.images && item.images.length > 0 ? item.images[0] : null)) : null;
  const hasImage = Boolean(imageSrc);

  // Extract series [XXX]
  const seriesMatch = (item.title || '').match(/^\[([^\]]+)\]\s*(.*)$/);
  const seriesName = seriesMatch ? seriesMatch[1] : (item.category || '精选');
  const mainTitle = seriesMatch ? seriesMatch[2] : (item.title || '');
  const authorDisplay = (item.author === 'Vie' || item.author === 'vie' || item.author === 'Vie (威比)')
    ? '威比 Hunter Wei.'
    : (item.author || '开源社区');

  const typeConfig = {
    style: {
      label: 'STYLE',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      watermark: 'STYLE',
      icon: Palette
    },
    skill: {
      label: 'SKILL',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      watermark: 'SKILL',
      icon: Terminal
    },
    tool: {
      label: 'TOOL',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
      watermark: 'TOOL',
      icon: Sparkles
    }
  };

  const currentType = typeConfig[item.type] || typeConfig.style;
  const TypeIcon = currentType.icon;

  const getCardGradient = (category = '') => {
    if (category.includes('海报') || category.includes('画册')) {
      return 'from-[#fbf8f3] via-[#f7f2ea] to-[#eee5d8] text-[#5c4d3c]';
    } else if (category.includes('水彩') || category.includes('插画')) {
      return 'from-[#f0f7ff] via-[#e6f1fc] to-[#d8ebfa] text-[#2c5282]';
    } else if (category.includes('国风') || category.includes('水墨')) {
      return 'from-[#f2f8f4] via-[#e5f2e9] to-[#d3e8dc] text-[#22543d]';
    } else if (category.includes('动漫') || category.includes('波普')) {
      return 'from-[#faf5ff] via-[#f3e8ff] to-[#e9d8fd] text-[#553c9a]';
    } else if (category.includes('视频')) {
      return 'from-[#f5f3ff] via-[#ede9fe] to-[#ddd6fe] text-[#4c1d95]';
    } else if (category.includes('自媒体') || category.includes('小红书') || category.includes('写作')) {
      return 'from-[#fff1f2] via-[#ffe4e6] to-[#fecdd3] text-[#881337]';
    } else if (category.includes('思维') || category.includes('认知')) {
      return 'from-[#f0fdfa] via-[#ccfbf1] to-[#99f6e4]/40 text-[#134e4a]';
    } else if (category.includes('设计') || category.includes('工具') || category.includes('前端')) {
      return 'from-[#eff6ff] via-[#dbeafe] to-[#bfdbfe]/50 text-[#1e3a8a]';
    }
    return 'from-[#f8f9fa] via-[#f1f3f5] to-[#e9ecef] text-[#343a40]';
  };

  // List View
  if (viewMode === 'list') {
    return (
      <div 
        onClick={() => onSelect(item)}
        className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-3.5 bg-white hover:bg-[#fafafc] border border-black/[0.06] hover:border-black/[0.12] rounded-xl sm:rounded-2xl transition-all gap-2.5 sm:gap-3 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.04)] mb-3"
      >
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#f5f5f7] border border-black/[0.04] flex items-center justify-center shrink-0 text-[#6e6e73] group-hover:text-[#1d1d1f] transition-colors">
            <TypeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[9px] sm:text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#f5f5f7] text-[#515154] border border-black/[0.04]">
                {seriesName}
              </span>
              <h3 className="text-xs sm:text-sm font-semibold text-[#1d1d1f] group-hover:text-indigo-600 transition-colors truncate">
                {mainTitle}
              </h3>
              {item.repo_url && (
                <a 
                  href={item.repo_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  onClick={(e) => e.stopPropagation()}
                  className="text-[#86868b] hover:text-[#1d1d1f]"
                >
                  <GithubIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </a>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[#86868b] mt-0.5">
              <span>@{authorDisplay}</span>
              <span>•</span>
              <span>{item.category}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={handleCopyClick}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-medium border transition-all ${
              copied
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-[#f5f5f7] hover:bg-[#e8e8ed] border-black/[0.06] text-[#1d1d1f]'
            }`}
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-[#6e6e73]" />}
            <span>{copied ? '已复制' : (item.type === 'skill' ? '复制安装指令' : (item.type === 'tool' ? '复制链接' : '复制Prompt'))}</span>
          </button>

          {isAdmin && (
            <div className="flex items-center gap-1 pl-1 border-l border-black/[0.06]">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                className="p-1 sm:p-1.5 rounded-lg bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#6e6e73] hover:text-[#1d1d1f]"
                title="编辑"
              >
                <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                className="p-1 sm:p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 hover:text-rose-900"
                title="删除"
              >
                <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Pinterest Masonry Card (Natural Aspect Ratio, No Crop)
  return (
    <div 
      onClick={() => onSelect(item)}
      className="break-inside-avoid mb-3.5 sm:mb-4.5 group relative flex flex-col bg-white hover:bg-[#fafafc] border border-black/[0.06] hover:border-black/[0.14] rounded-2xl overflow-hidden transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 cursor-pointer"
    >
      {/* Visual Cover Area: Natural Auto Height without Hard Crop */}
      <div className="relative w-full overflow-hidden bg-[#f5f5f7] border-b border-black/[0.04]">
        
        {hasImage ? (
          <div className="w-full relative flex items-center justify-center bg-[#f0f0f2] min-h-[180px] overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
            )}
            <img
              src={imageSrc}
              alt={item.title}
              className={`w-full h-auto object-cover max-h-[520px] transition-opacity duration-300 group-hover:scale-[1.02] ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />

            {/* Bottom Type Badge on Image */}
            <div className="absolute bottom-2 left-2 z-10">
              <span className="text-[9px] sm:text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-white border border-white/20 shadow-xs">
                {seriesName}
              </span>
            </div>
          </div>
        ) : (
          <div className={`w-full aspect-[16/10] bg-gradient-to-br ${getCardGradient(item.category)} p-3 sm:p-4 flex flex-col justify-between relative overflow-hidden`}>
            {/* Top pill badges */}
            <div className="flex items-center gap-1.5 z-10">
              <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[#1d1d1f] border border-black/[0.06] shadow-2xs truncate">
                {seriesName}
              </span>
              {item.type === 'style' && (
                <span className="text-[10px] sm:text-[11px] font-mono text-[#6e6e73] px-2 py-0.5 rounded-full bg-white/80 backdrop-blur-md border border-black/[0.04]">
                  {item.aspect_ratio || '自适应'}
                </span>
              )}
            </div>

            {/* Bottom-right large watermark badge (No prompt text in preview) */}
            <div className="absolute right-2.5 sm:right-3.5 -bottom-1 font-mono text-4xl sm:text-5xl font-black tracking-wider select-none pointer-events-none opacity-[0.09] text-black transition-all group-hover:scale-105 group-hover:opacity-[0.14]">
              {currentType.watermark}
            </div>
          </div>
        )}
      </div>

      {/* Specific Content Template Based on Type */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
        
        <div>
          {/* Main Title */}
          <h3 className="font-bold text-[13px] sm:text-[14.5px] text-[#1d1d1f] group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug sm:leading-tight">
            {mainTitle}
          </h3>

          {/* Author & ID Row */}
          <div className="flex items-center justify-between gap-1.5 mt-1.5 text-[11px] text-[#86868b]">
            <span className="text-[#515154] font-medium truncate max-w-[70%] flex items-center gap-1">
              @{authorDisplay}
              {item.repo_url && (
                <a
                  href={item.repo_url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[#86868b] hover:text-black"
                  title="查看 GitHub 仓库"
                >
                  <GithubIcon className="w-3 h-3 inline-block ml-0.5" />
                </a>
              )}
            </span>
            <span className="font-mono text-[#86868b] shrink-0 text-[10px]">
              {item.id}
            </span>
          </div>

          {/* Tool specific complete description */}
          {item.type === 'tool' && item.description && (
            <p className="text-[11.5px] text-[#515154] mt-2 leading-relaxed bg-[#f8f8fa] p-2 rounded-xl border border-black/[0.04]">
              {item.description}
            </p>
          )}

          {/* Tags preview pills */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-2 overflow-hidden flex-wrap">
              {item.tags.slice(0, 3).map((tg, i) => (
                <span 
                  key={i} 
                  onClick={(e) => {
                    if (onTagClick) {
                      e.stopPropagation();
                      onTagClick(tg);
                    }
                  }}
                  className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#f5f5f7] hover:bg-[#ebebed] text-[#6e6e73] font-medium truncate transition-colors"
                >
                  #{tg}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Row Customized by Type */}
        <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between gap-2">
          
          {item.type === 'skill' ? (
            <button
              onClick={handleCopyClick}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-medium border transition-all ${
                copied
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-[#f5f5f7] hover:bg-[#ebebed] border-black/[0.06] text-[#1d1d1f] shadow-2xs'
              }`}
              title={item.install_command || item.command}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Terminal className="w-3.5 h-3.5 text-[#6e6e73]" />}
              <span className="truncate">{copied ? '已复制安装指令' : '复制安装指令'}</span>
            </button>
          ) : item.type === 'tool' ? (
            <div className="flex-1 flex items-center gap-1.5">
              {(item.website_url || item.repo_url) && (
                <a
                  href={item.website_url || item.repo_url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>访问工具</span>
                </a>
              )}
              <button
                onClick={handleCopyClick}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-medium border transition-all ${
                  copied
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-[#f5f5f7] hover:bg-[#ebebed] border-black/[0.06] text-[#1d1d1f]'
                }`}
                title={item.website_url || item.repo_url || item.command}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#6e6e73]" />}
                <span>{copied ? '已复制链接' : '复制网址'}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleCopyClick}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-medium border transition-all ${
                copied
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-[#f5f5f7] hover:bg-[#ebebed] border-black/[0.06] text-[#1d1d1f] shadow-2xs'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#6e6e73]" />}
              <span className="truncate">{copied ? '已复制 Prompt' : '一键复制 Prompt'}</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
            }}
            className="p-1.5 rounded-xl bg-[#f5f5f7] hover:bg-[#ebebed] border border-black/[0.06] text-[#6e6e73] hover:text-[#1d1d1f] transition-all shadow-2xs shrink-0"
            title="查看完整详情"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {isAdmin && (
            <div className="flex items-center gap-1 pl-1 border-l border-black/[0.06]">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                className="p-1.5 rounded-lg bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#6e6e73]"
                title="编辑"
              >
                <Edit3 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700"
                title="删除"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
