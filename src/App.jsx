import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { CategoryFilter } from './components/CategoryFilter';
import { CardItem } from './components/CardItem';
import { DetailModal } from './components/DetailModal';
import { EditModal } from './components/EditModal';
import { AdminUploadModal } from './components/AdminUploadModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { Toast } from './components/Toast';
import { DashCascade } from './components/DashCascade';
import { SketchbookView } from './components/sketchbook/SketchbookView';
import { matchSearch } from './utils/search';
import { Sparkles, Palette, Terminal, Wrench, SearchX, RefreshCw, ChevronDown } from 'lucide-react';

const STORAGE_KEY = 'SKILLS_GALLERY_DATA_V2026_CLEAN_V13';
const BOOKMARKS_KEY = 'SKILLS_GALLERY_BOOKMARKS_V4_FEED';
const APP_MODE_KEY = 'SKILLS_APP_MODE_KEY';
const PAGE_SIZE = 24;

export function App() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('');
  const [isBookmarkOnly, setIsBookmarkOnly] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [appMode, setAppMode] = useState(() => {
    try {
      return localStorage.getItem(APP_MODE_KEY) || 'gallery';
    } catch {
      return 'gallery';
    }
  });
  
  // Pagination
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Admin & Auth
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // Bookmarks & Toast
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem(BOOKMARKS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Theme (Dark Mode vs Light Mode)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('wibi_theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('wibi_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  // Initial Load: Always load fresh clean dataset on startup; preserve only explicit admin edits
  useEffect(() => {
    const DATA_VERSION_KEY = 'SKILLS_DATA_VERSION_V2026_CLEAN_V13';
    const loadInitialData = async () => {
      try {
        const isCustomModified = localStorage.getItem('SKILLS_DATA_CUSTOM_MODIFIED') === 'true';
        const currentVersion = localStorage.getItem(DATA_VERSION_KEY);
        const localData = localStorage.getItem(STORAGE_KEY);

        if (isCustomModified && currentVersion === 'v13' && localData) {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSkills(parsed);
            setLoading(false);
            return;
          }
        }

        const res = await fetch('/skills_data.json?t=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          setSkills(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          localStorage.setItem(DATA_VERSION_KEY, 'v13');
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
        showToast('加载数据失败', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    // Secret Admin URL Trigger (?admin=true or #admin)
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || window.location.hash === '#admin' || window.location.pathname.endsWith('/admin')) {
        setIsAuthModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save Bookmarks
  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (e) {
      console.error(e);
    }
  }, [bookmarks]);

  // Save App Mode
  useEffect(() => {
    try {
      localStorage.setItem(APP_MODE_KEY, appMode);
    } catch (e) {
      console.error(e);
    }
  }, [appMode]);

  // Reset pagination when search / filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, selectedType, selectedCategory, selectedTag, isBookmarkOnly]);

  // Save Skills
  const saveSkillsData = (newSkills) => {
    setSkills(newSkills);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSkills));
    } catch (e) {
      console.error(e);
    }
  };

  // Dynamic Category & Type Counts & Unique Authors
  const { categories, typeCounts, categoryCounts, hotTags, uniqueAuthorsCount } = useMemo(() => {
    const catSet = new Set();
    const tagCountMap = {};
    const authorSet = new Set();
    const tCounts = { all: skills.length, style: 0, skill: 0, tool: 0 };
    const cCounts = { all: skills.length };

    skills.forEach((item) => {
      if (item.author) authorSet.add(item.author);
      if (item.category) {
        catSet.add(item.category);
        cCounts[item.category] = (cCounts[item.category] || 0) + 1;
      }
      if (item.type && tCounts[item.type] !== undefined) {
        tCounts[item.type]++;
      }
      if (Array.isArray(item.tags)) {
        item.tags.forEach((t) => {
          if (t && t.length < 15) {
            tagCountMap[t] = (tagCountMap[t] || 0) + 1;
          }
        });
      }
    });

    const sortedTags = Object.entries(tagCountMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([t]) => t);

    return {
      categories: Array.from(catSet),
      typeCounts: tCounts,
      categoryCounts: cCounts,
      hotTags: sortedTags,
      uniqueAuthorsCount: authorSet.size
    };
  }, [skills]);

  // Filtered skills
  const filteredSkills = useMemo(() => {
    return skills.filter((item) => {
      if (isBookmarkOnly && !bookmarks.includes(item.id)) return false;
      if (selectedType !== 'all' && item.type !== selectedType) return false;
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (selectedTag && (!item.tags || !item.tags.includes(selectedTag))) return false;
      if (searchQuery && !matchSearch(item, searchQuery)) return false;
      return true;
    });
  }, [skills, searchQuery, selectedType, selectedCategory, selectedTag, isBookmarkOnly, bookmarks]);

  // Slice for progressive rendering
  const displayedSkills = useMemo(() => {
    return filteredSkills.slice(0, visibleCount);
  }, [filteredSkills, visibleCount]);

  const hasMore = visibleCount < filteredSkills.length;

  const handleLoadMore = () => {
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
  }, [hasMore, loading, appMode, filteredSkills.length]);

  // Related items for detail modal
  const relatedItems = useMemo(() => {
    if (!selectedItem) return [];
    return skills.filter(
      (s) => s.id !== selectedItem.id && (s.category === selectedItem.category || s.type === selectedItem.type)
    );
  }, [skills, selectedItem]);

  // Actions
  const handleToggleBookmark = (id) => {
    setBookmarks((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((b) => b !== id) : [...prev, id];
      showToast(exists ? '已取消收藏' : '已添加至收藏夹', 'info');
      return next;
    });
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
      showToast('已退出管理模式', 'info');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleSaveItem = (savedItem) => {
    let updated;
    const exists = skills.some((s) => s.id === savedItem.id);
    if (exists) {
      updated = skills.map((s) => (s.id === savedItem.id ? savedItem : s));
      showToast('条目已更新成功！');
    } else {
      updated = [savedItem, ...skills];
      showToast('新条目已添加成功！');
    }
    saveSkillsData(updated);
    setIsEditOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id) => {
    if (window.confirm('确定要删除该条目吗？此操作将即时同步到本地数据库。')) {
      const updated = skills.filter((s) => s.id !== id);
      saveSkillsData(updated);
      showToast('条目已删除', 'info');
    }
  };

  const handleAppendItems = (newItems) => {
    const existingIds = new Set(skills.map((s) => s.id));
    const toAdd = newItems.filter((it) => !existingIds.has(it.id));
    const merged = [...toAdd, ...skills];
    saveSkillsData(merged);
    showToast(`成功新增 ${toAdd.length} 个条目！`);
  };

  const handleResetToDefault = async () => {
    try {
      const res = await fetch('/skills_data.json');
      if (res.ok) {
        const data = await res.json();
        saveSkillsData(data);
        localStorage.removeItem('SKILLS_DATA_CUSTOM_MODIFIED');
        showToast('已重置回官方初始精选数据！');
      }
    } catch (err) {
      showToast('重置失败', 'error');
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(skills, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `skills_gallery_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('已生成 JSON 备份并开始下载！');
  };

  const handleShuffle = () => {
    const shuffled = [...skills];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setSkills(shuffled);
    showToast(' 已随机打乱排序！');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedTag('');
    setIsBookmarkOnly(false);
  };

  const isFiltered = searchQuery || selectedType !== 'all' || selectedCategory !== 'all' || selectedTag || isBookmarkOnly;

  const types = [
    { id: 'all', label: '全量精选', icon: Sparkles, count: typeCounts.all || 0 },
    { id: 'style', label: '视觉风格', icon: Palette, count: typeCounts.style || 0 },
    { id: 'skill', label: '开源 Skill', icon: Terminal, count: (typeCounts.skill || 0) + (typeCounts.tool || 0) },
    { id: 'tool', label: '设计工具', icon: Wrench, count: typeCounts.tool || 0 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7] dark:bg-[#09090b] text-[#1d1d1f] dark:text-zinc-100 selection:bg-indigo-500/20 selection:text-indigo-900 transition-colors duration-200">
      
      {/* Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Standalone Full-Screen MengTo Sketchbook Mode */}
      {appMode === 'sketchbook' ? (
        <SketchbookView
          items={filteredSkills}
          onExit={() => setAppMode('gallery')}
          onSelect={handleSelectItem}
          onCopy={(it) => showToast(`${it.type === 'skill' ? '安装指令' : '提示词'}已复制！`)}
        />
      ) : (
        <>
      {/* Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalCount={skills.length}
        filteredCount={filteredSkills.length}
        isBookmarkOnly={isBookmarkOnly}
        setIsBookmarkOnly={setIsBookmarkOnly}
        bookmarkCount={bookmarks.length}
        isAdmin={isAdmin}
        onAdminToggle={handleAdminToggle}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenNewModal={() => {
          setEditingItem(null);
          setIsEditOpen(true);
        }}
        onExportJson={handleExportJson}
        onShuffle={handleShuffle}
        viewMode={viewMode}
        setViewMode={setViewMode}
        appMode={appMode}
        setAppMode={setAppMode}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Hero Section */}
      <div className="relative border-b border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#0d0d11] pt-6 pb-6 sm:pt-9 sm:pb-7 overflow-hidden transition-colors">
        {/* Subtle Ambient Background Gradient Light */}
        <div className="absolute top-0 right-0 w-[500px] h-[350px] bg-gradient-to-bl from-indigo-200/20 via-purple-100/10 to-transparent dark:from-indigo-900/15 dark:via-purple-900/10 pointer-events-none rounded-full blur-3xl -z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            
            {/* Headline, Intro, Stats, 4 Type Filter Cards */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-xs font-mono text-indigo-700 dark:text-indigo-300 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  <span>1,000+ 精选收录 · 真实来源溯源</span>
                </div>
                
                <div>
                  <h1 className="font-hero-serif text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-[#111113] dark:text-white leading-[1.12]">
                    Prompt <span className="font-serif font-normal italic text-[#111113] dark:text-white">&</span> Skill 风格大赏
                  </h1>
                </div>

                <p className="text-xs sm:text-sm md:text-base text-[#6e6e73] dark:text-zinc-400 leading-relaxed max-w-xl font-sans">
                  收录网络前沿 AI 视觉风格提示词与开源 Skill 工作流。
                  <br className="hidden sm:inline" />
                  一键复制 Prompt 与安装指令，支持在线增补与本地管理。
                </p>

                {/* 4 Stat Metrics Row with Vertical Dividers */}
                <div className="flex items-center gap-3 sm:gap-4.5 pt-1 text-left flex-wrap">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-bold font-mono text-[#111113] dark:text-white leading-none">{skills.length}</span>
                    <span className="text-xs text-[#86868b] dark:text-zinc-400 font-medium font-sans">条目</span>
                  </div>
                  <div className="w-[1px] h-4 bg-black/[0.1] dark:bg-white/[0.1]" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 leading-none">{typeCounts.style || 0}</span>
                    <span className="text-xs text-[#86868b] dark:text-zinc-400 font-medium font-sans">视觉风格</span>
                  </div>
                  <div className="w-[1px] h-4 bg-black/[0.1] dark:bg-white/[0.1]" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 leading-none">{(typeCounts.skill || 0) + (typeCounts.tool || 0)}</span>
                    <span className="text-xs text-[#86868b] dark:text-zinc-400 font-medium font-sans">开源 Skill</span>
                  </div>
                  <div className="w-[1px] h-4 bg-black/[0.1] dark:bg-white/[0.1]" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 leading-none">{uniqueAuthorsCount}+</span>
                    <span className="text-xs text-[#86868b] dark:text-zinc-400 font-medium font-sans">真实作者</span>
                  </div>
                </div>
              </div>

              {/* 4 Type Filter Cards */}
              <div className="pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {types.map((t) => {
                    const Icon = t.icon;
                    const isActive = selectedType === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedType(t.id)}
                        className={`flex items-center gap-2.5 p-3 rounded-2xl transition-all duration-200 text-left border ${
                          isActive
                            ? 'bg-[#18181b] dark:bg-white text-white dark:text-[#09090b] border-[#18181b] dark:border-white shadow-sm'
                            : 'bg-white dark:bg-[#141417] hover:bg-[#fafafc] dark:hover:bg-[#1a1a1e] border-black/[0.08] dark:border-white/[0.08] text-[#1d1d1f] dark:text-zinc-200 shadow-2xs hover:border-black/[0.14] dark:hover:border-white/[0.16]'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-white/15 dark:bg-black/10 text-white dark:text-black'
                            : 'bg-[#f5f5f7] dark:bg-white/[0.06] text-[#6e6e73] dark:text-zinc-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold truncate ${isActive ? 'text-white dark:text-black' : 'text-[#1d1d1f] dark:text-zinc-200'}`}>
                            {t.label}
                          </div>
                          <div className={`text-xs font-mono font-medium ${isActive ? 'text-white/70 dark:text-black/70' : 'text-[#86868b] dark:text-zinc-400'}`}>
                            {t.count}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Tech Frame Card with Dot Matrix Animation */}
            <div className="lg:col-span-5 flex items-stretch">
              <DashCascade />
            </div>

          </div>

          {/* Full-width Category & Hot Tags Section */}
          <div className="mt-6 pt-5 border-t border-black/[0.06] dark:border-white/[0.08]">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categoryCounts={categoryCounts}
              hotTags={hotTags}
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
              onResetFilters={handleResetFilters}
              isFiltered={isFiltered}
            />
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-4 md:px-6 lg:px-8 py-5 sm:py-8">
        
        {/* Results summary bar */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 text-[11px] sm:text-xs text-[#86868b] dark:text-zinc-400 px-1">
          <div className="flex items-center gap-1.5">
            <span>展示</span>
            <strong className="text-[#1d1d1f] dark:text-white font-mono font-semibold">{displayedSkills.length}</strong>
            <span>/</span>
            <span>共 {filteredSkills.length} 条</span>
            {isFiltered && <span className="text-[#86868b] dark:text-zinc-400 hidden sm:inline">（已应用筛选）</span>}
          </div>
          {isAdmin && (
            <div className="text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 sm:py-1 rounded-full border border-emerald-200 dark:border-emerald-800 text-[10px] sm:text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
              管理模式已解锁
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
            <div className="text-xs text-[#86868b] dark:text-zinc-400">正在载入数据...</div>
          </div>
        )}

        {/* Empty */}
        {!loading && filteredSkills.length === 0 && (
          <div className="py-20 text-center space-y-3 max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#141417] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center mx-auto text-[#86868b] dark:text-zinc-400 shadow-2xs">
              <SearchX className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-white">没有找到匹配结果</h3>
              <p className="text-xs text-[#86868b] dark:text-zinc-400 mt-1">请尝试更换关键词或重置筛选分类。</p>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-[#1d1d1f] dark:bg-white hover:bg-black dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-semibold shadow-xs transition-all"
            >
              清空所有筛选
            </button>
          </div>
        )}

        {/* Responsive Feed View (Mobile: 2 cols | iPad/Tablet: 3 cols | Desktop: 4 cols) */}
        {!loading && appMode === 'gallery' && viewMode === 'grid' && (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4.5">
            {displayedSkills.map((item) => (
              <CardItem
                key={item.id}
                item={item}
                viewMode="grid"
                onSelect={handleSelectItem}
                onCopy={(it) => showToast(`${it.type === 'skill' ? '安装指令' : '提示词'}已复制！`)}
                isBookmarked={bookmarks.includes(item.id)}
                onToggleBookmark={handleToggleBookmark}
                isAdmin={isAdmin}
                onEdit={(it) => {
                  setEditingItem(it);
                  setIsEditOpen(true);
                }}
                onDelete={handleDeleteItem}
                onTagClick={(tag) => setSelectedTag(tag)}
              />
            ))}
          </div>
        )}

        {/* List View (2-Column Responsive Grid) */}
        {!loading && appMode === 'gallery' && viewMode === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {displayedSkills.map((item) => (
              <CardItem
                key={item.id}
                item={item}
                viewMode="list"
                onSelect={handleSelectItem}
                onCopy={(it) => showToast(`${it.type === 'skill' ? '安装指令' : '提示词'}已复制！`)}
                isBookmarked={bookmarks.includes(item.id)}
                onToggleBookmark={handleToggleBookmark}
                isAdmin={isAdmin}
                onEdit={(it) => {
                  setEditingItem(it);
                  setIsEditOpen(true);
                }}
                onDelete={handleDeleteItem}
                onTagClick={(tag) => setSelectedTag(tag)}
              />
            ))}
          </div>
        )}

        {/* Infinite Scroll Sentinel & Auto-loader */}
        {!loading && appMode === "gallery" && (
          <div className="mt-8 mb-6 text-center">
            {hasMore ? (
              <div ref={sentinelRef} className="py-6 flex flex-col items-center justify-center gap-2 text-[#86868b] dark:text-zinc-400">
                <div className="w-5 h-5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                <span className="text-xs text-[#86868b] dark:text-zinc-400">下滑自动加载更多 · 剩余 {filteredSkills.length - visibleCount} 项</span>
              </div>
            ) : (
              <div className="py-8 text-xs text-[#86868b]/70 dark:text-zinc-500 flex items-center justify-center gap-3">
                <span className="h-px w-16 bg-black/[0.08] dark:bg-white/[0.08]" />
                <span>已呈现全部 {filteredSkills.length} 条精选灵感</span>
                <span className="h-px w-16 bg-black/[0.08] dark:bg-white/[0.08]" />
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#0d0d11] py-8 text-center text-xs text-[#86868b] dark:text-zinc-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <span className="text-[#1d1d1f] dark:text-white font-semibold">Prompt & Skill 风格大赏</span>
            <span>•</span>
            <span>致敬开源创作者</span>
          </div>
          <p className="text-[11px] text-[#86868b] dark:text-zinc-400">
            提示词与开源仓库归原作者所有 · 持续收录精选
          </p>
          <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-black/20 dark:text-white/20">
            <span>© 2026 Edition</span>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="hover:text-black/60 dark:hover:text-white/60 transition-colors p-1"
              title="Admin Entrance"
            >
              🔒
            </button>
          </div>
        </div>
      </footer>
        </>
      )}

      {/* Modals */}
      <DetailModal
        item={selectedItem}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedItem(null);
        }}
        onCopy={(msg) => showToast(msg)}
        onSelectRelated={(rel) => setSelectedItem(rel)}
        relatedItems={relatedItems}
      />

      <AdminAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticate={() => {
          setIsAdmin(true);
          showToast('管理模式已解锁！');
        }}
        correctPasscode="Wibi888"
      />

      <EditModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingItem(null);
        }}
        item={editingItem}
        onSave={handleSaveItem}
        categories={categories}
      />

      <AdminUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAppendItems={handleAppendItems}
        onResetToDefault={handleResetToDefault}
        onExportJson={handleExportJson}
        onShuffle={handleShuffle}
        totalCount={skills.length}
      />

    </div>
  );
}
