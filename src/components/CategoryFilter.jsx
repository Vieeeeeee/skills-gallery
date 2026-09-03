import React, { useState } from 'react';
import { X, Tag, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-2">
      {/* Category Row */}
      <div className="flex items-start sm:items-center gap-2 text-xs">
        <span className="text-[#86868b] dark:text-zinc-400 font-medium shrink-0 flex items-center gap-1 text-xs pt-1 sm:pt-0 select-none">
          <span className="text-[#1d1d1f] dark:text-white text-xs">❖</span>
          分类:
        </span>

        {/* Desktop View: Clean wrapped row */}
        <div className="hidden sm:flex flex-1 flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-full font-medium transition-all text-[11.5px] border flex items-center gap-1 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#18181b] dark:bg-white text-white dark:text-black font-semibold border-[#18181b] dark:border-white shadow-2xs'
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
                className={`px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1 text-[11.5px] border cursor-pointer ${
                  isCatActive
                    ? 'bg-[#18181b] dark:bg-white text-white dark:text-black font-semibold border-[#18181b] dark:border-white shadow-2xs'
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

        {/* Mobile View: Collapsed single row vs Expanded full tight grid */}
        <div className="sm:hidden flex-1 min-w-0">
          {!isExpanded ? (
            /* Collapsed Single Row */
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2 py-1 rounded-full font-medium transition-all text-[11px] border flex items-center gap-1 cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#18181b] dark:bg-white text-white dark:text-black font-semibold border-[#18181b] dark:border-white shadow-2xs'
                    : 'bg-white dark:bg-[#141417] border-black/[0.08] dark:border-white/[0.08] text-[#515154] dark:text-zinc-300'
                }`}
              >
                <span>全部</span>
                <span className="font-mono text-[10px] opacity-75">({categoryCounts.all || 0})</span>
              </button>

              {/* If a category is selected (and not all), always show it */}
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="px-2 py-1 rounded-full font-semibold transition-all text-[11px] border flex items-center gap-1 bg-[#18181b] dark:bg-white text-white dark:text-black border-[#18181b] dark:border-white shadow-2xs cursor-pointer"
                >
                  <span>{selectedCategory}</span>
                  <span className="font-mono text-[10px] opacity-75">({categoryCounts[selectedCategory] || 0})</span>
                  <X className="w-3 h-3 ml-0.5" />
                </button>
              )}

              {/* Show top 2 categories */}
              {categories.filter(c => c !== selectedCategory).slice(0, 2).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-2 py-1 rounded-full font-medium transition-all text-[11px] border bg-white dark:bg-[#141417] border-black/[0.08] dark:border-white/[0.08] text-[#515154] dark:text-zinc-300 truncate cursor-pointer"
                >
                  <span>{cat}</span>
                </button>
              ))}

              {/* Expand Trigger Button */}
              <button
                onClick={() => setIsExpanded(true)}
                className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/[0.05] dark:bg-white/[0.08] text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 cursor-pointer"
              >
                <span>展开分类 ({categories.length})</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          ) : (
            /* Expanded Full Mobile Grid: Neat 3-Column Tight Rows */
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-1.5 w-full">
                <button
                  onClick={() => { setSelectedCategory('all'); setIsExpanded(false); }}
                  className={`px-1.5 py-1.5 rounded-xl font-medium transition-all text-[11px] border flex items-center justify-center gap-1 cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-[#18181b] dark:bg-white text-white dark:text-black font-semibold border-[#18181b] dark:border-white shadow-2xs'
                      : 'bg-white dark:bg-[#141417] border-black/[0.08] dark:border-white/[0.08] text-[#515154] dark:text-zinc-300'
                  }`}
                >
                  <span className="truncate">全部</span>
                  <span className="font-mono text-[9.5px] opacity-70">({categoryCounts.all || 0})</span>
                </button>

                {categories.map((cat) => {
                  const isCatActive = selectedCategory === cat;
                  const count = categoryCounts[cat] || 0;
                  return (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(isCatActive ? 'all' : cat); }}
                      className={`px-1.5 py-1.5 rounded-xl font-medium transition-all text-[11px] border flex items-center justify-center gap-1 truncate cursor-pointer ${
                        isCatActive
                          ? 'bg-[#18181b] dark:bg-white text-white dark:text-black font-semibold border-[#18181b] dark:border-white shadow-2xs'
                          : 'bg-white dark:bg-[#141417] border-black/[0.08] dark:border-white/[0.08] text-[#515154] dark:text-zinc-300'
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      <span className="font-mono text-[9.5px] opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-end pt-0.5">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/[0.04] dark:bg-white/[0.08] text-[#86868b] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-white cursor-pointer"
                >
                  <span>收起分类</span>
                  <ChevronUp className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hot Tags: On mobile, visible when expanded or when a tag is active */}
      {hotTags && hotTags.length > 0 && (
        <div className={`items-start sm:items-center gap-2 text-xs pt-0.5 ${isExpanded || selectedTag ? 'flex' : 'hidden sm:flex'}`}>
          <span className="text-[#86868b] dark:text-zinc-400 font-medium shrink-0 flex items-center gap-1 text-xs pt-0.5 sm:pt-0 select-none">
            <Tag className="w-3 h-3 text-[#86868b] dark:text-zinc-400" />
            标签:
          </span>
          <div className="flex-1 flex flex-wrap items-center gap-1 sm:gap-1.5">
            {hotTags.slice(0, 14).map((tag) => {
              const isTagActive = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isTagActive ? '' : tag)}
                  className={`px-2 py-0.5 rounded-md text-[10.5px] sm:text-[11px] font-medium transition-all border cursor-pointer ${
                    isTagActive
                      ? 'bg-[#18181b] dark:bg-white text-white dark:text-black border-[#18181b] dark:border-white shadow-2xs'
                      : 'bg-white dark:bg-[#141417] border-black/[0.06] dark:border-white/[0.08] text-[#6e6e73] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-white'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}

            {isFiltered && (
              <button
                onClick={onResetFilters}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] sm:text-[11px] font-medium bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 whitespace-nowrap transition-all shadow-2xs cursor-pointer"
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
