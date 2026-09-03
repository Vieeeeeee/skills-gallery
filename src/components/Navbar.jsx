import React, { useState, useRef, useEffect } from 'react';
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
  BookOpen,
  Sun,
  Moon
} from 'lucide-react';

export function Navbar({
  searchQuery,
  setSearchQuery,
  totalCount,
  filteredCount,
  isBookmarkOnly,
  setIsBookmarkOnly,
  isAdmin,
  onAdminToggle,
  onOpenUpload,
  onOpenNewModal,
  onExportJson,
  onShuffle,
  viewMode,
  setViewMode,
  appMode = 'gallery',
  setAppMode,
  theme = 'light',
  onToggleTheme,
  onOpenAbout
}) {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const mobileInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && document.activeElement !== mobileInputRef.current) {
        e.preventDefault();
        if (window.innerWidth < 768) {
          setIsMobileSearchOpen(true);
          setTimeout(() => mobileInputRef.current?.focus(), 100);
        } else {
          searchInputRef.current?.focus();
        }
      } else if (e.key === 'Escape') {
        if (document.activeElement === searchInputRef.current) {
          setSearchQuery('');
          searchInputRef.current?.blur();
        } else if (document.activeElement === mobileInputRef.current) {
          setSearchQuery('');
          mobileInputRef.current?.blur();
          setIsMobileSearchOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchQuery]);

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-[#09090b]/90 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.08] transition-all w-full max-w-[100vw]">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        
        {/* Main Row: Logo, (Desktop Search), Action controls */}
        <div className="flex items-center justify-between h-13 sm:h-16 gap-2 sm:gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-2xl bg-gradient-to-b from-[#1d1d1f] to-black border border-black/10 dark:border-white/10 flex items-center justify-center shadow-xs text-white relative overflow-hidden group shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/25 via-transparent to-rose-500/25 opacity-80" />
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1 1.3-1.3Z" />
                <path d="M19 4v4" />
                <path d="M21 6h-4" />
              </svg>
            </div>
            <div>
              <h1 className="font-hero-serif font-bold text-sm sm:text-base md:text-lg text-[#1d1d1f] dark:text-white tracking-tight truncate">
                <span className="hidden sm:inline">Prompt & Skill </span>风格大赏
              </h1>
            </div>
          </div>

          {/* Desktop Search Input (Only on md+ screens) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-2 lg:mx-4 min-w-0 relative">
            <div className="relative flex items-center w-full">
              <Search className="w-4 h-4 text-[#86868b] dark:text-zinc-500 absolute left-4 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索风格、Skill、GitHub 仓库、作者...（按 / 聚焦）"
                className="w-full pl-10 pr-14 py-2 bg-[#f5f5f7]/90 dark:bg-[#141417] hover:bg-[#efeff2] dark:hover:bg-[#1a1a1e] focus:bg-white dark:focus:bg-[#18181c] border border-black/[0.08] dark:border-white/[0.1] focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 rounded-full text-xs text-[#1d1d1f] dark:text-white placeholder-[#86868b] dark:placeholder-zinc-500 transition-all outline-none shadow-2xs"
              />
              <div className="absolute right-3 flex items-center gap-1.5">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-0.5 text-[#86868b] hover:text-[#1d1d1f] dark:text-zinc-400 dark:hover:text-white rounded cursor-pointer"
                    title="清空"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <kbd className="hidden sm:inline-block text-[11px] font-mono text-[#86868b] dark:text-zinc-500 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] shadow-2xs">
                  /
                </kbd>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            
            {/* Mobile Search Toggle Button (icon only) */}
            <button
              onClick={() => {
                const next = !isMobileSearchOpen;
                setIsMobileSearchOpen(next);
                if (next) setTimeout(() => mobileInputRef.current?.focus(), 120);
              }}
              className={`p-1.5 rounded-xl border transition-all md:hidden cursor-pointer ${
                isMobileSearchOpen || searchQuery
                  ? 'bg-[#18181b] dark:bg-white text-white dark:text-black border-[#18181b] dark:border-white shadow-2xs'
                  : 'bg-white dark:bg-[#141417] border-black/[0.08] dark:border-white/[0.08] text-[#515154] dark:text-zinc-300'
              }`}
              title="搜索"
              aria-label="搜索"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            {/* Mode Switcher: Gallery vs Sketchbook (Desktop/Tablet only) */}
            <div className="hidden md:flex items-center bg-[#f5f5f7] dark:bg-[#18181c] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-0.5 shadow-2xs">
              <button
                onClick={() => setAppMode('gallery')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  appMode === 'gallery'
                    ? 'bg-white dark:bg-white text-[#1d1d1f] dark:text-[#09090b] shadow-xs font-semibold'
                    : 'text-[#6e6e73] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
                title="瀑布流画廊视图"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>画廊</span>
              </button>
              <button
                onClick={() => setAppMode('sketchbook')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  appMode === 'sketchbook'
                    ? 'bg-amber-900 dark:bg-amber-400 text-white dark:text-amber-950 shadow-xs font-serif font-bold'
                    : 'text-[#6e6e73] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
                title="拟真手账速写本视图"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>速写本</span>
              </button>
            </div>

            {/* Community & About Entrance */}
            <button
              onClick={onOpenAbout}
              className="flex items-center gap-0.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-[#141417] hover:bg-[#fafafc] dark:hover:bg-[#1c1c22] border border-black/[0.08] dark:border-white/[0.08] text-[#515154] dark:text-zinc-300 hover:text-[#1d1d1f] dark:hover:text-white shadow-2xs transition-all cursor-pointer select-none"
              title="查看社群、致谢与关于"
            >
              <span className="text-[11px] sm:text-xs">关于</span>
              <span className="text-[9px] text-[#86868b] dark:text-zinc-500">▾</span>
            </button>

            {/* Shuffle / Randomize (Desktop/Tablet only) */}
            <button
              onClick={onShuffle}
              className="hidden md:flex items-center justify-center sm:px-3 sm:py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-[#141417] border border-black/[0.08] dark:border-white/[0.08] text-[#515154] dark:text-zinc-300 hover:border-black/[0.15] dark:hover:border-white/[0.18] hover:text-[#1d1d1f] dark:hover:text-white shadow-2xs transition-all cursor-pointer"
              title="随机打乱排序 / 换一批灵感"
            >
              <Shuffle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 mr-1.5" />
              <span>换一批</span>
            </button>

            {/* Dark Mode Switcher */}
            <button
              onClick={onToggleTheme}
              className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white dark:bg-[#141417] border border-black/[0.08] dark:border-white/[0.08] text-[#515154] dark:text-zinc-300 hover:border-black/[0.15] dark:hover:border-white/[0.18] hover:text-[#1d1d1f] dark:hover:text-white shadow-2xs transition-all cursor-pointer"
              title={theme === 'dark' ? '切换为亮色模式' : '切换为暗黑模式'}
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
              )}
            </button>

            {/* View Mode Toggle (Desktop only) */}
            <div className="hidden lg:flex items-center bg-[#f5f5f7] dark:bg-[#18181c] border border-black/[0.06] dark:border-white/[0.08] rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-white text-[#1d1d1f] dark:text-[#09090b] shadow-xs' 
                    : 'text-[#86868b] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
                title="海报网格视图"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-white text-[#1d1d1f] dark:text-[#09090b] shadow-xs' 
                    : 'text-[#86868b] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
                title="列表视图"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Admin Controls */}
            {isAdmin ? (
              <div className="flex items-center gap-1 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 rounded-xl p-0.5">
                <button
                  onClick={onExportJson}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                  title="导出全量 JSON 备份"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  <span className="hidden sm:inline">备份</span>
                </button>
                <button
                  onClick={onOpenUpload}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                  title="上传 Docx/JSON 增补"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  <span className="hidden sm:inline">增补</span>
                </button>
                <button
                  onClick={onOpenNewModal}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-[#1d1d1f] dark:bg-white hover:bg-black dark:hover:bg-zinc-200 text-white dark:text-black shadow-xs transition-all cursor-pointer"
                  title="手动新增"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span className="hidden sm:inline">新增</span>
                </button>
                <button
                  onClick={onAdminToggle}
                  className="p-1 rounded-lg text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200/60 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                  title="退出管理模式"
                >
                  <Unlock className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                </button>
              </div>
            ) : (
              <button
                onClick={onAdminToggle}
                className="p-1 text-[#86868b]/30 hover:text-[#1d1d1f] rounded-lg transition-colors cursor-pointer"
                title="Admin Entrance"
                aria-label="Admin Entrance"
              >
                <Lock className="w-3 h-3" />
              </button>
            )}

          </div>

        </div>

        {/* Mobile Search Dropdown (Only appears when tapped or searching) */}
        {(isMobileSearchOpen || searchQuery) && (
          <div className="md:hidden pb-2.5 pt-1">
            <div className="relative flex items-center w-full">
              <Search className="w-3.5 h-3.5 text-[#86868b] dark:text-zinc-500 absolute left-3 pointer-events-none" />
              <input
                ref={mobileInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索风格、Skill、作者..."
                className="w-full pl-8 pr-14 py-1.5 bg-[#f5f5f7]/90 dark:bg-[#141417] hover:bg-[#efeff2] dark:hover:bg-[#1a1a1e] focus:bg-white dark:focus:bg-[#18181c] border border-black/[0.08] dark:border-white/[0.1] focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 rounded-full text-xs text-[#1d1d1f] dark:text-white placeholder-[#86868b] dark:placeholder-zinc-500 transition-all outline-none shadow-2xs min-w-0"
              />
              <div className="absolute right-2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-[#86868b] hover:text-[#1d1d1f] dark:text-zinc-400 dark:hover:text-white rounded cursor-pointer"
                    title="清空"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsMobileSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="px-1.5 py-0.5 text-[#86868b] hover:text-[#1d1d1f] dark:text-zinc-400 dark:hover:text-white text-[11px] font-medium cursor-pointer"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
