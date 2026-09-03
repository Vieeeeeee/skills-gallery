import React, { useState, useMemo } from 'react';
import { X, Search, BookOpen, Palette } from 'lucide-react';

export function SketchbookTOC({ isOpen, onClose, items, currentIndex, onSelectIndex }) {
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  const categories = useMemo(() => {
    const set = new Set();
    items.forEach((it) => {
      if (it.category) set.add(it.category);
    });
    return Array.from(set);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items
      .map((item, originalIndex) => ({ item, originalIndex }))
      .filter(({ item }) => {
        if (selectedCat !== 'all' && item.category !== selectedCat) return false;
        if (!query) return true;
        const q = query.toLowerCase();
        return (
          (item.title && item.title.toLowerCase().includes(q)) ||
          (item.category && item.category.toLowerCase().includes(q)) ||
          (item.author && item.author.toLowerCase().includes(q)) ||
          (item.id && item.id.toLowerCase().includes(q))
        );
      });
  }, [items, query, selectedCat]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-[#faf7f0] h-full shadow-2xl flex flex-col border-l border-amber-900/10 font-sans animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-amber-900/10 bg-[#f5f0e6] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-900" />
            <h2 className="font-hero-serif font-bold text-lg text-amber-950">速写本目录 · Table of Contents</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-amber-900/10 text-amber-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-3 border-b border-amber-900/10 bg-[#faf7f0]/80 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-amber-900/50 absolute left-3 top-2.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="在速写本目录中查找..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white/80 border border-amber-900/15 rounded-xl text-amber-950 placeholder-amber-900/40 focus:outline-hidden focus:ring-1 focus:ring-amber-900/30"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <button
              onClick={() => setSelectedCat('all')}
              className={`px-2.5 py-0.5 rounded-full whitespace-nowrap transition-colors ${
                selectedCat === 'all'
                  ? 'bg-amber-900 text-white font-medium'
                  : 'bg-amber-900/10 text-amber-900 hover:bg-amber-900/15'
              }`}
            >
              全部 ({items.length})
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCat(c)}
                className={`px-2.5 py-0.5 rounded-full whitespace-nowrap transition-colors ${
                  selectedCat === c
                    ? 'bg-amber-900 text-white font-medium'
                    : 'bg-amber-900/10 text-amber-900 hover:bg-amber-900/15'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-xs text-amber-900/50 font-sketch-note">
              未找到匹配的速写本页
            </div>
          ) : (
            filteredItems.map(({ item, originalIndex }) => {
              const isCurrent = originalIndex === currentIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectIndex(originalIndex);
                    onClose();
                  }}
                  className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${
                    isCurrent
                      ? 'bg-amber-900/10 border-amber-900/30 shadow-xs'
                      : 'bg-white/60 hover:bg-white border-amber-900/10 hover:border-amber-900/20'
                  }`}
                >
                  <span className="font-mono text-[11px] font-bold text-amber-900/60 w-8 shrink-0 text-center">
                    P.{originalIndex + 1}
                  </span>

                  {/* Thumbnail / Icon */}
                  <div className="w-10 h-10 rounded-lg bg-amber-900/5 border border-amber-900/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.cover_image || (item.images && item.images[0]) ? (
                      <img
                        src={item.cover_image || item.images[0]}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <Palette className="w-4 h-4 text-amber-900/40" />
                    )}
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-900/10 text-amber-900 font-mono">
                        {item.category || item.type}
                      </span>
                      <h4 className="text-xs font-semibold text-amber-950 truncate font-sketch-note">
                        {item.title}
                      </h4>
                    </div>
                    <div className="text-[10px] text-amber-900/60 mt-0.5 truncate">
                      @{item.author || '开源社区'} · {item.id}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-amber-900/10 bg-[#f5f0e6] text-center text-[11px] text-amber-900/60 font-mono">
          当前共 {items.length} 页 · 点击条目快速翻页
        </div>
      </div>
    </div>
  );
}

