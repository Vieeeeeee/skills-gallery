import React from 'react';
import { X, Tag } from 'lucide-react';

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
  return (
    <div className="space-y-2.5">
      {/* Category Pills Row - Compact, clean, zero horizontal scrollbar */}
      <div className="flex items-start sm:items-center gap-2 text-xs">
        <span className="text-[#86868b] dark:text-zinc-400 font-medium shrink-0 flex items-center gap-1.5 text-xs pt-1 sm:pt-0 select-none">
          <span className="text-[#1d1d1f] dark:text-white text-xs">❖</span>
          分类:
        </span>

        <div className="flex-1 flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-full font-medium transition-all text-[11.5px] border flex items-center gap-1 ${
              selectedCategory === 'all'
                ? 'bg-[#18181b] dark:bg-white text-white dark:text-black font-semibold border-[#18181b] dark:border-white shadow-2xs dark:shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                : 'bg-white dark:bg-[#141417] border-black/[0.08] dark:border-white/[0.08] text-[#515154] dark:text-zinc-300 hover:text-[#1d1d1f] dark:hover:text-white hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c22]'
            }`}
          >
            <span>全部</span>
            <span className={`font-mono text-[10.5px] ${selectedCategory === 'all' ? 'text-white/70 dark:text-black/70' : 'text-[#86868b] dark:text-zinc-500'}`}>
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
                className={`px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1 text-[11.5px] border ${
                  isCatActive
                    ? 'bg-[#18181b] dark:bg-white text-white dark:text-black font-semibold border-[#18181b] dark:border-white shadow-2xs dark:shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                    : 'bg-white dark:bg-[#141417] border-black/[0.08] dark:border-white/[0.08] text-[#515154] dark:text-zinc-300 hover:text-[#1d1d1f] dark:hover:text-white hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c22]'
                }`}
              >
                <span>{cat}</span>
                <span className={`font-mono text-[10.5px] ${isCatActive ? 'text-white/70 dark:text-black/70' : 'text-[#86868b] dark:text-zinc-500'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hot Tags - Compact Micro-Tags with Clean Wrap */}
      {hotTags && hotTags.length > 0 && (
        <div className="flex items-start sm:items-center gap-2 text-xs pt-0.5">
          <span className="text-[#86868b] dark:text-zinc-400 font-medium shrink-0 flex items-center gap-1.5 text-xs pt-0.5 sm:pt-0 select-none">
            <Tag className="w-3 h-3 text-[#86868b] dark:text-zinc-400" />
            热门标签:
          </span>
          <div className="flex-1 flex flex-wrap items-center gap-1.5">
            {hotTags.slice(0, 14).map((tag) => {
              const isTagActive = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isTagActive ? '' : tag)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all border ${
                    isTagActive
                      ? 'bg-[#18181b] dark:bg-white text-white dark:text-black border-[#18181b] dark:border-white shadow-2xs dark:shadow-[0_0_8px_rgba(255,255,255,0.2)]'
                      : 'bg-white dark:bg-[#141417] border-black/[0.06] dark:border-white/[0.08] text-[#6e6e73] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-white hover:bg-[#fafafc] dark:hover:bg-[#1c1c22]'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}

            {isFiltered && (
              <button
                onClick={onResetFilters}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 whitespace-nowrap transition-all shadow-2xs"
                title="清除所有分类和标签筛选"
              >
                <X className="w-3 h-3" />
                <span>清空筛选</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
