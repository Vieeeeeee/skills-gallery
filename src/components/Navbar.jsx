import React, { useRef, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Bookmark, 
  PlusCircle, 
  UploadCloud, 
  Download, 
  X,
  LayoutGrid,
  List,
  Shuffle,
  Lock,
  Unlock,
  BookOpen
} from 'lucide-react';

export function Navbar({
  searchQuery,
  setSearchQuery,
  totalCount,
  filteredCount,
  isBookmarkOnly,
  setIsBookmarkOnly,
  bookmarkCount,
  isAdmin,
  onAdminToggle,
  onOpenUpload,
  onOpenNewModal,
  onExportJson,
  onShuffle,
  viewMode,
  setViewMode,
  appMode = 'gallery',
  setAppMode
}) {
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchQuery('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchQuery]);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-b from-[#1d1d1f] to-black border border-black/10 flex items-center justify-center shadow-xs text-white relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/25 via-transparent to-rose-500/25 opacity-80" />
              <svg className="w-4 h-4 text-white relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                <path d="M19 4v4" />
                <path d="M21 6h-4" />
              </svg>
            </div>
            <div>
              <h1 className="font-hero-serif font-bold text-base sm:text-lg text-[#1d1d1f] tracking-tight">
                Prompt & Skill 风格大赏
              </h1>
            </div>
          </div>

          {/* Search Input */}
          <div className="flex-1 max-w-xl relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#86868b] absolute left-4 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索风格、Skill、GitHub 仓库、作者...（按 / 聚焦）"
                className="w-full pl-10 pr-14 py-2.5 bg-[#f5f5f7]/90 hover:bg-[#efeff2] focus:bg-white border border-black/[0.08] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-full text-xs text-[#1d1d1f] placeholder-[#86868b] transition-all outline-none shadow-2xs"
              />
              <div className="absolute right-3 flex items-center gap-1.5">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-0.5 text-[#86868b] hover:text-[#1d1d1f] rounded"
                    title="清空"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <kbd className="hidden sm:inline-block text-[11px] font-mono text-[#86868b] bg-white px-2 py-0.5 rounded-full border border-black/[0.08] shadow-2xs">
                  /
                </kbd>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Mode Switcher: Gallery vs Sketchbook */}
            <div className="flex items-center bg-[#f5f5f7] border border-black/[0.08] rounded-xl p-0.5 shadow-2xs">
              <button
                onClick={() => setAppMode('gallery')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  appMode === 'gallery'
                    ? 'bg-white text-[#1d1d1f] shadow-xs font-semibold'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
                title="瀑布流画廊视图"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">画廊</span>
              </button>
              <button
                onClick={() => setAppMode('sketchbook')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  appMode === 'sketchbook'
                    ? 'bg-amber-900 text-white shadow-xs font-serif font-bold'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
                title="拟真手账速写本视图"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">速写本</span>
              </button>
            </div>

            {/* Shuffle / Randomize */}
            <button
              onClick={onShuffle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white border border-black/[0.08] text-[#515154] hover:border-black/[0.15] hover:text-[#1d1d1f] shadow-2xs transition-all"
              title="随机打乱排序 / 换一批灵感"
            >
              <Shuffle className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">换一批</span>
            </button>

            {/* View Mode Toggle */}
            <div className="hidden lg:flex items-center bg-[#f5f5f7] border border-black/[0.06] rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-[#1d1d1f] shadow-xs' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
                title="海报网格视图"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-[#1d1d1f] shadow-xs' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
                title="列表视图"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Export JSON */}
            <button
              onClick={onExportJson}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white border border-black/[0.08] text-[#515154] hover:border-black/[0.15] hover:text-[#1d1d1f] shadow-2xs transition-all"
              title="导出全量 JSON 备份"
            >
              <Download className="w-3.5 h-3.5 text-[#86868b]" />
              <span className="hidden xl:inline">备份</span>
            </button>

            {/* Admin Controls (Discreet) */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-0.5">
                <button
                  onClick={onOpenUpload}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-900 hover:bg-emerald-100/60 transition-colors"
                  title="上传 Docx/JSON 增补"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-emerald-700" />
                  <span>增补</span>
                </button>
                <button
                  onClick={onOpenNewModal}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1d1d1f] hover:bg-black text-white shadow-xs transition-all"
                  title="手动新增"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>新增</span>
                </button>
                <button
                  onClick={onAdminToggle}
                  className="p-1 rounded-lg text-emerald-800 hover:bg-emerald-200/60 transition-colors"
                  title="退出管理模式"
                >
                  <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                </button>
              </div>
            ) : (
              <button
                onClick={onAdminToggle}
                className="p-1.5 text-[#86868b]/30 hover:text-[#1d1d1f] rounded-lg transition-colors"
                title="Admin Entrance"
                aria-label="Admin Entrance"
              >
                <Lock className="w-3 h-3" />
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
