import React, { useRef } from 'react';
import { ChevronRight, X, Tag } from 'lucide-react';

export function CategoryFilter({
  categories,
  selectedCategory,
  setSelectedCategory,
  categoryCounts,
  hotTags,
  selectedTag,
  setSelectedTag,
  onResetFilters,
  isFiltered
}) {
  const scrollContainerRef = useRef(null);

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-3">
      {/* Category Pills Row with Scroll Arrow */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[#86868b] dark:text-zinc-400 font-medium shrink-0 flex items-center gap-1.5 text-xs mr-1">
          <span className="text-[#1d1d1f] dark:text-white text-sm">❖</span>
          分类:
        </span>

        <div 
          ref={scrollContainerRef}
          className="flex-1 flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none scroll-smooth"
        >
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-all shrink-0 text-xs border flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-[#18181b] dark:bg-white text-white dark:text-black font-semibold border-[#18181b] dark:border-white shadow-xs dark:shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                : 'bg-white dark:bg-[#141417] border-black/[0.08] dark:border-white/[0.08] text-[#515154] dark:text-zinc-300 hover:text-[#1d1d1f] dark:hover:text-white hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c22] shadow-2xs hover:border-black/[0.14] dark:hover:border-white/[0.16]'
            }`}
          >
            <span>全部</span>
            <span className={`font-mono text-[11px] ${selectedCategory === 'all' ? 'text-white/70 dark:text-black/70' : 'text-[#86868b] dark:text-zinc-400'}`}>
              ({categoryCounts.all || 0})
            </span>
          </button>

          {categories.map((cat) => {
            const isCatActive = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isCatActive ? 'all' : cat)}
                className={`px-3.5 py-1.5 rounded-full font-medium transition-all shrink-0 flex items-center gap-1.5 text-xs border ${
                  isCatActive
                    ? 'bg-[#18181b] dark:bg-white text-white dark:text-black font-semibold border-[#18181b] dark:border-white shadow-xs dark:shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                    : 'bg-white dark:bg-[#141417] border-black/[0.08] dark:border-white/[0.08] text-[#515154] dark:text-zinc-300 hover:text-[#1d1d1f] dark:hover:text-white hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c22] shadow-2xs hover:border-black/[0.14] dark:hover:border-white/[0.16]'
                }`}
              >
                <span>{cat}</span>
                <span className={`font-mono text-[11px] ${isCatActive ? 'text-white/70 dark:text-black/70' : 'text-[#86868b] dark:text-zinc-400'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Arrow for scroll */}
        <button
          onClick={handleScrollRight}
          className="w-7 h-7 rounded-full bg-white dark:bg-[#141417] border border-black/[0.08] dark:border-white/[0.08] hover:border-black/[0.15] dark:hover:border-white/[0.16] text-[#6e6e73] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-white flex items-center justify-center shrink-0 shadow-2xs transition-all ml-1"
          title="向右滚动分类"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Hot Tags */}
      {hotTags && hotTags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[#86868b] dark:text-zinc-400 font-medium shrink-0 flex items-center gap-1.5 mr-1 text-xs">
            <Tag className="w-3.5 h-3.5 text-[#86868b] dark:text-zinc-400" />
            热门标签:
          </span>
          {hotTags.slice(0, 14).map((tag) => {
            const isTagActive = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(isTagActive ? '' : tag)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 border ${
                  isTagActive
                    ? 'bg-[#18181b] dark:bg-white text-white dark:text-black border-[#18181b] dark:border-white shadow-xs dark:shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                    : 'bg-white dark:bg-[#141417] border-black/[0.06] dark:border-white/[0.08] text-[#6e6e73] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-white hover:bg-[#fafafc] dark:hover:bg-[#1c1c22] shadow-2xs hover:border-black/[0.12] dark:hover:border-white/[0.16]'
                }`}
              >
                #{tag}
              </button>
            );
          })}

          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 whitespace-nowrap transition-all ml-auto shadow-2xs"
            >
              <X className="w-3 h-3" />
              <span>清空筛选</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
