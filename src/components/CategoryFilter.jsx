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
      {/* Desktop Category Row (sm+) */}
      <div className="hidden sm:flex items-center gap-2 text-xs">
        <span className="text-[#86868b] dark:text-zinc-400 font-medium shrink-0 flex items-center gap-1 text-xs select-none">
          <span className="text-[#1d1d1f] dark:text-white text-xs">❖</span>
          分类:
        </span>

        <div className="flex-1 flex flex-wrap items-center gap-1.5">
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
      </div>

      {/* Mobile View: Collapsed single row vs Expanded 100% full-width grid */}
      <div className="sm:hidden w-full">
        {!isExpanded ? (
          /* Collapsed: Strictly 1 Single Horizontal Row with Pinned Expand Button */
          <div className="flex items-center justify-between gap-1.5 w-full">
            <span className="text-[#86868b] dark:text-zinc-400 font-medium shrink-0 flex items-center gap-1 text-xs select-none">
              <span className="text-[#1d1d1f] dark:text-white text-xs">❖</span>
              分类:
            </span>

            {/* Horizontally scrollable row of unified category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`h-7 px-2.5 rounded-lg text-[11px] font-medium transition-all shrink-0 border flex items-center gap-1 cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#18181b] dark:bg-white text-white dark:text-black font-semibold border-[#18181b] dark:border-white shadow-2xs'
                    : 'bg-white dark:bg-[#141417] border-black/[0.08] dark:border-white/[0.08] text-[#515154] dark:text-zinc-300'
                }`}
              >
                <span>全部</span>
                <span className="font-mono text-[10px] opacity-70">({categoryCounts.all || 0})</span>
              </button>

              {/* If a category is selected (and not all), show it with clear X */}
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="h-7 px-2.5 rounded-lg text-[11px] font-semibold transition-all shrink-0 border flex items-center gap-1 bg-[#18181b] dark:bg-white text-white dark:text-black border-[#18181b] dark:border-white shadow-2xs cursor-pointer"
                >
                  <span>{selectedCategory}</span>
                  <span className="font-mono text-[10px] opacity-70">({categoryCounts[selectedCategory] || 0})</span>
                  <X className="w-3 h-3 ml-0.5" />
                </button>
              )}

              {/* If a tag is selected, show it with clear X */}
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag('')}
                  className="h-7 px-2.5 rounded-lg text-[11px] font-semibold transition-all shrink-0 border flex items-center gap-1 bg-[#18181b] dark:bg-white text-white dark:text-black border-[#18181b] dark:border-white shadow-2xs cursor-pointer"
                >
                  <span>#{selectedTag}</span>
                  <X className="w-3 h-3 ml-0.5" />
                </button>
              )}

              {/* Other categories horizontally scrollable */}
              {categories.filter(c => c !== selectedCategory).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="h-7 px-2.5 rounded-lg text-[11px] font-medium transition-all shrink-0 border bg-white dark:bg-[#141417] border-black/[0.08] dark:border-white/[0.08] text-[#515154] dark:text-zinc-300 cursor-pointer"
                >
                  <span>{cat}</span>
                </button>
              ))}
            </div>

            {/* Pinned Expand Button on the right */}
            <button
              onClick={() => setIsExpanded(true)}
              className="h-7 px-2.5 rounded-lg text-[11px] font-medium transition-all shrink-0 border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141417] text-[#1d1d1f] dark:text-white flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <span>展开</span>
              <ChevronDown className="w-3 h-3 text-[#86868b]" />
            </button>
          </div>
        ) : (
          /* Expanded Full Mobile View: 100% Full Width (Zero Left Space!) */
          <div className="space-y-3 pt-0.5 w-full">
            {/* Header with clear title and prominent Collapse button */}
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-[#1d1d1f] dark:text-white flex items-center gap-1">
                <span>❖ 全部分类 ({categories.length})</span>
              </span>
              <button
                onClick={() => setIsExpanded(false)}
                className="h-7 px-2.5 rounded-lg text-[11px] font-medium transition-all border border-black/[0.08] dark:border-white/[0.08] bg-[#f5f5f7] dark:bg-white/[0.08] text-[#1d1d1f] dark:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>收起分类</span>
                <ChevronUp className="w-3 h-3 text-[#86868b]" />
              </button>
            </div>

              {/* Uniform 3-Column Grid of Categories (Identical height & padding) */}
              <div className="grid grid-cols-3 gap-1.5 w-full">
                <button
                  onClick={() => { setSelectedCategory('all'); }}
                  className={`h-7 px-2 rounded-lg text-[11px] font-medium transition-all border flex items-center justify-center gap-1 truncate cursor-pointer ${
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
                      className={`h-7 px-2 rounded-lg text-[11px] font-medium transition-all border flex items-center justify-center gap-1 truncate cursor-pointer ${
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

              {/* Tags Section when expanded */}
              {hotTags && hotTags.length > 0 && (
                <div className="pt-2.5 border-t border-black/[0.05] dark:border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#86868b] dark:text-zinc-400">
                    <span className="font-medium flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>精选检索标签</span>
                    </span>
                    {isFiltered && (
                      <button
                        onClick={onResetFilters}
                        className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
                      >
                        <X className="w-3 h-3" />
                        <span>清空筛选</span>
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {hotTags.slice(0, 15).map((tag) => {
                      const isTagActive = selectedTag === tag;
                      return (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(isTagActive ? '' : tag)}
                          className={`h-6.5 px-2 rounded-md text-[10.5px] font-medium transition-all border cursor-pointer ${
                            isTagActive
                              ? 'bg-[#18181b] dark:bg-white text-white dark:text-black border-[#18181b] dark:border-white shadow-2xs'
                              : 'bg-white dark:bg-[#141417] border-black/[0.06] dark:border-white/[0.08] text-[#6e6e73] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-white'
                          }`}
                        >
                          #{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Prominent Collapse Button */}
              <div className="pt-1 flex items-center justify-center">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="h-7 px-4 rounded-lg text-xs font-medium transition-all border border-black/[0.08] dark:border-white/[0.08] bg-[#f5f5f7] hover:bg-[#ebebed] dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-[#1d1d1f] dark:text-white flex items-center gap-1 cursor-pointer"
                >
                  <span>收起分类</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

      {/* Desktop Hot Tags Section (hidden on mobile, mobile displays inside expanded view) */}
      {hotTags && hotTags.length > 0 && (
        <div className="hidden sm:flex items-center gap-2 text-xs pt-1">
          <span className="text-[#86868b] dark:text-zinc-400 font-medium shrink-0 flex items-center gap-1 text-xs select-none">
            <Tag className="w-3 h-3 text-[#86868b] dark:text-zinc-400" />
            标签:
          </span>
          <div className="flex-1 flex flex-wrap items-center gap-1.5">
            {hotTags.slice(0, 14).map((tag) => {
              const isTagActive = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isTagActive ? '' : tag)}
                  className={`h-6.5 px-2 rounded-md text-[11px] font-medium transition-all border cursor-pointer ${
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
                className="h-6.5 flex items-center gap-1 px-2 rounded-md text-[11px] font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#1d1d1f] dark:text-white border border-black/10 dark:border-white/10 whitespace-nowrap transition-all shadow-2xs cursor-pointer"
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
