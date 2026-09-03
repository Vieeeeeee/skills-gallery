
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add useRef
if 'useRef' not in code:
    code = code.replace(
        "import React, { useState, useEffect, useMemo } from 'react';",
        "import React, { useState, useEffect, useMemo, useRef } from 'react';"
    )

# 2. Add Sentinel and Hook
target_str = "  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };"

sentinel_code = """  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  // Infinite Scroll Sentinel Observer
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!hasMore || loading || appMode !== 'gallery') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0] && entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredSkills.length));
        }
      },
      { rootMargin: '400px' }
    );

    const el = sentinelRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, loading, appMode, filteredSkills.length]);"""

code = code.replace(target_str, sentinel_code)

# 3. Replace Bottom Button
old_ui = """        {/* Infinite Scroll / Load More */}
        {!loading && appMode === 'gallery' && hasMore && (
          <div className="mt-8 sm:mt-10 text-center">
            <button
              onClick={handleLoadMore}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-[#fafafc] border border-black/[0.08] hover:border-black/[0.15] text-xs font-semibold text-[#1d1d1f] transition-all shadow-xs group"
            >
              <span>加载更多（剩余 {filteredSkills.length - visibleCount} 项）</span>
              <ChevronDown className="w-4 h-4 text-[#86868b] group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        )}"""

new_ui = """        {/* Infinite Scroll Sentinel & Auto-loader */}
        {!loading && appMode === 'gallery' && (
          <div className="mt-8 mb-6 text-center">
            {hasMore ? (
              <div ref={sentinelRef} className="py-6 flex flex-col items-center justify-center gap-2 text-[#86868b]">
                <div className="w-5 h-5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                <span className="text-xs text-[#86868b]">下滑自动加载更多 · 剩余 {filteredSkills.length - visibleCount} 项</span>
              </div>
            ) : (
              <div className="py-8 text-xs text-[#86868b]/70 flex items-center justify-center gap-3">
                <span className="h-px w-16 bg-black/[0.08]" />
                <span>已呈现全部 {filteredSkills.length} 条精选灵感</span>
                <span className="h-px w-16 bg-black/[0.08]" />
              </div>
            )}
          </div>
        )}"""

code = code.replace(old_ui, new_ui)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("src/App.jsx updated with infinite scroll successfully!")
