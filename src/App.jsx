import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
import { AboutModal } from './components/AboutModal';
import { matchSearch } from './utils/search';
import { copyText, COPY_FAIL_MSG } from './utils/copy';
import { assertSkillsData } from './utils/data';
import { STORAGE_KEYS, readStorage, writeStorage, removeStorage } from './utils/storage';
import { Sparkles, Palette, Terminal, Wrench, SearchX, RefreshCw, ChevronDown, X, QrCode, ArrowUp, AlertTriangle } from 'lucide-react';

const PAGE_SIZE = 24;
// 发布新数据时把这个版本号 +1：所有做过本地编辑的用户会被解锁回官方数据。
const DATA_VERSION = 'v14';

// Helper to check if an item is created by Wibi
export const isWibiItem = (item) => {
  if (!item) return false;
  const author = (item.author || '').toLowerCase();
  const id = (item.id || '').toLowerCase();
  return author.includes('vie') || author.includes('威比') || id.startsWith('wibi-');
};

// Helper to check if an item has a rich visual cover
export const hasCoverImage = (item) => {
  if (!item) return false;
  return Boolean(item.cover_image || (Array.isArray(item.images) && item.images.length > 0));
};

// Curation & Interleaving Engine:
// 1. Items with covers ALWAYS come first
// 2. Interleave Wibi styles and other creators/community styles (3:2 balanced ratio)
// 3. Support randomizing within buckets when clicking "换一批" (Shuffle)
export const curateAndInterleaveSkills = (items, randomize = false) => {
  if (!Array.isArray(items) || items.length === 0) return items;

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  let wibiCovers = items.filter((d) => hasCoverImage(d) && isWibiItem(d));
  let otherCovers = items.filter((d) => hasCoverImage(d) && !isWibiItem(d));
  let withoutCovers = items.filter((d) => !hasCoverImage(d));

  if (randomize) {
    wibiCovers = shuffle(wibiCovers);
    otherCovers = shuffle(otherCovers);
    withoutCovers = shuffle(withoutCovers);
  }

  const interleaved = [];
  let w = 0;
  let o = 0;

  // Interleave with 3 Wibi : 2 Other pattern: W, O, W, O, W...
  while (w < wibiCovers.length || o < otherCovers.length) {
    if (w < wibiCovers.length) interleaved.push(wibiCovers[w++]);
    if (o < otherCovers.length) interleaved.push(otherCovers[o++]);
    if (w < wibiCovers.length) interleaved.push(wibiCovers[w++]);
    if (o < otherCovers.length) interleaved.push(otherCovers[o++]);
    if (w < wibiCovers.length) interleaved.push(wibiCovers[w++]);
  }

  return [...interleaved, ...withoutCovers];
};

export function App() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('');
  const [isBookmarkOnly, setIsBookmarkOnly] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  // Tailwind sm 断点（640px）：决定只挂载移动端 2 列版还是桌面端 masonry 版，避免两套同时渲染
  const [isNarrow, setIsNarrow] = useState(() => window.innerWidth < 640);
  const [appMode, setAppMode] = useState(() => {
    const saved = readStorage(STORAGE_KEYS.appMode);
    return saved === 'sketchbook' ? 'sketchbook' : 'gallery';
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
  const [isWeChatModalOpen, setIsWeChatModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // Bookmarks & Toast
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = readStorage(STORAGE_KEYS.bookmarks);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
    } catch {
      return [];
    }
  });

  // Theme (Dark Mode vs Light Mode)
  const [theme, setTheme] = useState(() => {
    const saved = readStorage(STORAGE_KEYS.theme);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    writeStorage(STORAGE_KEYS.theme, theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };
  // useCallback：稳定 onClose 的引用，否则 Toast.jsx 的自动关闭计时器每次 App 重渲染都会被重置
  const handleCloseToast = useCallback(() => setToast(null), []);

  // Initial Load: Always load fresh clean dataset on startup; preserve only explicit admin edits
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const isCustomModified = readStorage(STORAGE_KEYS.dataModified) === 'true';
        const currentVersion = readStorage(STORAGE_KEYS.dataVersion);
        const localData = readStorage(STORAGE_KEYS.data);

        if (isCustomModified && currentVersion === DATA_VERSION && localData) {
          try {
            const parsed = assertSkillsData(JSON.parse(localData));
            setSkills(curateAndInterleaveSkills(parsed, false));
            setLoading(false);
            return;
          } catch {
            // 本地备份损坏时回退官方数据，不让可选的本地持久化拖垮整站。
            removeStorage(STORAGE_KEYS.data);
            removeStorage(STORAGE_KEYS.dataModified);
          }
        }

        // 不加时间戳：时间戳会击穿浏览器与 CDN 缓存，每次访问都重下 638KB。
        // Cloudflare Pages 会带 ETag，数据更新后浏览器自动重新校验。
        const res = await fetch('/skills_data.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = assertSkillsData(await res.json());
        const curated = curateAndInterleaveSkills(data, false);
        setSkills(curated);
        setLoadError(null);
        // 清掉本地快照与修改标记：否则下次发布新版本号时，已修改过本地数据的用户
        // 会被 isCustomModified 守卫拦住，只解锁一次又退回旧快照，永久错过新内容。
        removeStorage(STORAGE_KEYS.data);
        removeStorage(STORAGE_KEYS.dataModified);
        writeStorage(STORAGE_KEYS.dataVersion, DATA_VERSION);
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setLoadError(err.message || '未知错误');
        showToast('数据加载失败，请检查网络后重试', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    // Secret Admin URL Trigger (?admin=true or #admin)
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || window.location.hash === '#admin') {
        setIsAuthModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save App Mode (skip when the mobile safety guard force-switched it below — that's
  // a device limitation, not the user changing their mind, so it must not be persisted)
  const forcedGalleryRef = useRef(false);
  useEffect(() => {
    if (forcedGalleryRef.current) {
      forcedGalleryRef.current = false;
      return;
    }
    writeStorage(STORAGE_KEYS.appMode, appMode);
  }, [appMode]);

  // Reset pagination when search / filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, selectedType, selectedCategory, selectedTag, isBookmarkOnly]);

  // Save Skills
  const saveSkillsData = (newSkills) => {
    setSkills(newSkills);
    const dataSaved = writeStorage(STORAGE_KEYS.data, JSON.stringify(newSkills));
    const markerSaved = dataSaved && writeStorage(STORAGE_KEYS.dataModified, 'true');
    if (!dataSaved || !markerSaved) {
      showToast('浏览器本地存储已满，修改仅在当前会话生效，请及时点击导出全量 JSON 备份！', 'info');
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

  // Filtered skills (Always prioritizing cover images first while preserving curated order)
  const filteredSkills = useMemo(() => {
    const matched = skills.filter((item) => {
      if (isBookmarkOnly && !bookmarks.includes(item.id)) return false;
      if (selectedType !== 'all' && item.type !== selectedType) return false;
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (selectedTag && (!item.tags || !item.tags.includes(selectedTag))) return false;
      if (searchQuery && !matchSearch(item, searchQuery)) return false;
      return true;
    });

    // Ensure items with visual covers always appear first
    return [...matched].sort((a, b) => {
      const aHas = hasCoverImage(a) ? 1 : 0;
      const bHas = hasCoverImage(b) ? 1 : 0;
      return bHas - aHas;
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

  // Related items for detail modal: prefer same category, only fall back to same type to fill up to 3
  const relatedItems = useMemo(() => {
    if (!selectedItem) return [];
    const pool = skills.filter((s) => s.id !== selectedItem.id);
    const sameCat = pool.filter((s) => s.category === selectedItem.category);
    if (sameCat.length >= 3) return sameCat.slice(0, 3);
    const sameType = pool.filter((s) => s.type === selectedItem.type && s.category !== selectedItem.category);
    return [...sameCat, ...sameType].slice(0, 3);
  }, [skills, selectedItem]);

  // Actions
  const handleToggleBookmark = (id) => {
    const exists = bookmarks.includes(id);
    const next = exists ? bookmarks.filter((bookmarkId) => bookmarkId !== id) : [...bookmarks, id];
    setBookmarks(next);
    const persisted = writeStorage(STORAGE_KEYS.bookmarks, JSON.stringify(next));
    const message = exists ? '已取消收藏' : '已添加至收藏夹';
    showToast(persisted ? message : `${message}（仅当前会话，浏览器禁止了本地存储）`, 'info');
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
    if (selectedItem && selectedItem.id === savedItem.id) {
      setSelectedItem(savedItem);
    }
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
    if (toAdd.length === 0) {
      showToast('没有新增条目：上传的内容已全部存在', 'info');
      return 0; // 一条都没新增就不落库，避免白白把用户钉死在当前数据快照上
    }
    saveSkillsData([...toAdd, ...skills]);
    showToast(`成功新增 ${toAdd.length} 个条目！`);
    return toAdd.length;
  };

  const handleResetToDefault = async () => {
    try {
      const res = await fetch('/skills_data.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = assertSkillsData(await res.json());
      saveSkillsData(data);
      removeStorage(STORAGE_KEYS.dataModified);
      const message = '已重置回官方初始精选数据！';
      showToast(message);
      return { success: true, message };
    } catch (err) {
      const message = `重置失败：${err.message}`;
      showToast(message, 'error');
      return { success: false, message };
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
    const shuffled = curateAndInterleaveSkills(skills, true);
    setSkills(shuffled);
    showToast('✨ 精选风格已换一批！');
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
    { id: 'skill', label: '开源 Skill', icon: Terminal, count: typeCounts.skill || 0 },
    { id: 'tool', label: '设计工具', icon: Wrench, count: typeCounts.tool || 0 },
  ];

  // Mobile Safety Guard: The 3D Sketchbook is optimized for Desktop & iPad screens with high-performance GPUs.
  // On mobile (< 768px), automatically stay in buttery-smooth native gallery view.
  useEffect(() => {
    const handleResize = () => {
      setIsNarrow(window.innerWidth < 640);
      if (window.innerWidth < 768 && appMode === 'sketchbook') {
        forcedGalleryRef.current = true;
        setAppMode('gallery');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [appMode]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7] dark:bg-[#09090b] text-[#1d1d1f] dark:text-zinc-100 selection:bg-indigo-500/20 selection:text-indigo-900 transition-colors duration-200 overflow-x-hidden w-full max-w-[100vw]">
      
      {/* Toast */}
      <Toast toast={toast} onClose={handleCloseToast} />

      {/* Standalone Full-Screen MengTo Sketchbook Mode */}
      {appMode === 'sketchbook' ? (
        <SketchbookView
          items={filteredSkills}
          onExit={() => setAppMode('gallery')}
          onSelect={handleSelectItem}
          onCopy={(it) => showToast(`${it.type === 'skill' ? '安装指令' : '提示词'}已复制！`)}
          onCopyFail={() => showToast(COPY_FAIL_MSG, 'error')}
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
        onOpenAbout={() => setIsAboutModalOpen(true)}
      />

      {/* Hero Section */}
      <div className="relative border-b border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#0d0d11] pt-3 pb-2.5 sm:pt-9 sm:pb-7 overflow-hidden transition-colors">
        {/* Subtle Ambient Background Gradient Light */}
        <div className="absolute top-0 right-0 w-[500px] h-[350px] bg-gradient-to-bl from-indigo-200/20 via-purple-100/10 to-transparent dark:from-indigo-900/15 dark:via-purple-900/10 pointer-events-none rounded-full blur-3xl -z-0" />

        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-8 items-stretch">
            
            {/* Headline, Intro, Stats, 4 Type Filter Cards */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-2.5 sm:space-y-4">
              
              {/* Mobile Dynamic Animation Bar ("星那个大那个长条的动画") */}
              <div className="lg:hidden w-full">
                <DashCascade compact={true} />
              </div>

              <div className="space-y-2 sm:space-y-3">
                {/* Desktop badge */}
                <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-xs font-mono text-indigo-700 dark:text-indigo-300 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  <span>1,000+ 精选收录 · 真实来源溯源</span>
                </div>
                
                {/* Title (Strictly 1 Single Line across Mobile & Desktop, Max Edge-to-Edge) */}
                <div>
                  <h1 className="font-hero-serif font-black tracking-tight text-[#111113] dark:text-white leading-none whitespace-nowrap">
                    <span className="text-[clamp(30px,9.1vw,40px)] sm:text-4xl lg:text-[46px] xl:text-[52px] tracking-tight inline-block">
                      Prompt <span className="font-serif font-normal italic text-[#111113] dark:text-white">&</span> Skill 风格大赏
                    </span>
                  </h1>
                </div>

                {/* Desktop Subtitle */}
                <p className="hidden sm:block text-xs sm:text-sm md:text-base text-[#6e6e73] dark:text-zinc-400 leading-relaxed max-w-xl font-sans">
                  收录网络前沿 AI 视觉风格提示词与开源 Skill 工作流。
                  <br className="hidden sm:inline" />
                  一键复制 Prompt 与安装指令，支持在线增补与本地管理。
                </p>

                {/* Colored Stat Metrics Row (Visible on both Mobile & Desktop) */}
                <div className="flex items-center gap-2.5 sm:gap-4.5 pt-0.5 text-left flex-wrap">
                  <div className="flex items-baseline gap-1">
                    <span className="text-base sm:text-2xl font-bold font-mono text-[#111113] dark:text-white leading-none">{skills.length}</span>
                    <span className="text-xs text-[#86868b] dark:text-zinc-400 font-medium font-sans">条目</span>
                  </div>
                  <div className="w-[1px] h-3 sm:h-4 bg-black/[0.1] dark:bg-white/[0.1]" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-base sm:text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 leading-none">{typeCounts.style || 0}</span>
                    <span className="text-xs text-[#86868b] dark:text-zinc-400 font-medium font-sans">视觉风格</span>
                  </div>
                  <div className="w-[1px] h-3 sm:h-4 bg-black/[0.1] dark:bg-white/[0.1]" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-base sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 leading-none">{typeCounts.skill || 0}</span>
                    <span className="text-xs text-[#86868b] dark:text-zinc-400 font-medium font-sans">开源 Skill</span>
                  </div>
                  <div className="w-[1px] h-3 sm:h-4 bg-black/[0.1] dark:bg-white/[0.1]" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-base sm:text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 leading-none">{uniqueAuthorsCount}+</span>
                    <span className="text-xs text-[#86868b] dark:text-zinc-400 font-medium font-sans">真实作者</span>
                  </div>
                </div>
              </div>

              {/* 4 Type Filter Cards (Desktop grid vs Mobile clean 1-row tabs) */}
              <div className="pt-0.5 sm:pt-2">
                {/* Desktop Grid (sm+) */}
                <div className="hidden sm:grid sm:grid-cols-4 gap-2.5">
                  {types.map((t) => {
                    const Icon = t.icon;
                    const isActive = selectedType === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedType(t.id)}
                        className={`flex items-center gap-2.5 p-3 rounded-2xl transition-all duration-200 text-left border cursor-pointer ${
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

                {/* Mobile: 4 Horizontal Buttons with Unified Height */}
                <div className="sm:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {types.map((t) => {
                    const Icon = t.icon;
                    const isActive = selectedType === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedType(t.id)}
                        className={`h-7 px-2.5 rounded-lg text-[11px] font-medium transition-all shrink-0 border flex items-center gap-1 cursor-pointer ${
                          isActive
                            ? 'bg-[#18181b] dark:bg-white text-white dark:text-black font-semibold border-[#18181b] dark:border-white shadow-2xs'
                            : 'bg-white dark:bg-[#141417] border-black/[0.08] dark:border-white/[0.08] text-[#515154] dark:text-zinc-300'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{t.label}</span>
                        <span className="font-mono text-[9.5px] opacity-75">({t.count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Tech Frame Card with Dot Matrix Animation (Desktop only) */}
            <div className="hidden lg:flex lg:col-span-5 items-stretch">
              <DashCascade compact={false} />
            </div>

          </div>

          {/* Full-width Category & Hot Tags Section */}
          <div className="mt-2.5 pt-2.5 sm:mt-6 sm:pt-5 border-t border-black/[0.06] dark:border-white/[0.08]">
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-8">
        
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

        {/* Load failure (must not masquerade as "no search results") */}
        {!loading && loadError && skills.length === 0 && (
          <div className="py-20 text-center space-y-3 max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400 shadow-2xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-white">数据加载失败</h3>
              <p className="text-xs text-[#86868b] dark:text-zinc-400 mt-1">网络异常或数据源暂时不可用（{loadError}）。</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-[#1d1d1f] dark:bg-white hover:bg-black dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-semibold shadow-xs transition-all"
            >
              重新加载
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !loadError && filteredSkills.length === 0 && (
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

        {/* Responsive Feed View (Mobile: 2 Flex Columns | Tablet: 3 Multi-Columns | Desktop: 4 Multi-Columns) */}
        {!loading && appMode === 'gallery' && viewMode === 'grid' && (
          isNarrow ? (
            /* Mobile View: Dedicated 2-Column Flexbox Waterfall (100% immune to WebKit multi-column paint bugs) */
            <div className="flex gap-2 items-start w-full">
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                {displayedSkills
                  .filter((_, i) => i % 2 === 0)
                  .map((item, colIdx) => (
                    <CardItem
                      key={item.id}
                      item={item}
                      index={colIdx * 2}
                      viewMode="grid"
                      onSelect={handleSelectItem}
                      onCopy={(it) => showToast(`${it.type === 'skill' ? '安装指令' : '提示词'}已复制！`)}
                      onCopyFail={() => showToast(COPY_FAIL_MSG, 'error')}
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
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                {displayedSkills
                  .filter((_, i) => i % 2 === 1)
                  .map((item, colIdx) => (
                    <CardItem
                      key={item.id}
                      item={item}
                      index={colIdx * 2 + 1}
                      viewMode="grid"
                      onSelect={handleSelectItem}
                      onCopy={(it) => showToast(`${it.type === 'skill' ? '安装指令' : '提示词'}已复制！`)}
                      onCopyFail={() => showToast(COPY_FAIL_MSG, 'error')}
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
            </div>
          ) : (
            /* Desktop View (sm+): Multi-column Masonry (3 cols on tablet, 4 cols on desktop) */
            <div className="columns-3 lg:columns-4 gap-4.5">
              {displayedSkills.map((item, index) => (
                <CardItem
                  key={item.id}
                  item={item}
                  index={index}
                  viewMode="grid"
                  onSelect={handleSelectItem}
                  onCopy={(it) => showToast(`${it.type === 'skill' ? '安装指令' : '提示词'}已复制！`)}
                  onCopyFail={() => showToast(COPY_FAIL_MSG, 'error')}
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
          )
        )}

        {/* List View (2-Column Responsive Grid) */}
        {!loading && appMode === 'gallery' && viewMode === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {displayedSkills.map((item, index) => (
              <CardItem
                key={item.id}
                item={item}
                index={index}
                viewMode="list"
                onSelect={handleSelectItem}
                onCopy={(it) => showToast(`${it.type === 'skill' ? '安装指令' : '提示词'}已复制！`)}
                onCopyFail={() => showToast(COPY_FAIL_MSG, 'error')}
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
        {!loading && !loadError && filteredSkills.length > 0 && appMode === "gallery" && (
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
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div 
            className="flex flex-wrap items-center justify-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
            onClick={() => setIsAboutModalOpen(true)}
            title="点击查看社群与致谢详情"
          >
            <span className="text-[#1d1d1f] dark:text-white font-semibold">Prompt & Skill 风格大赏</span>
            <span>•</span>
            <span className="text-[#515154] dark:text-zinc-300 font-medium">致谢「威比🙂↔️AIGC学习群」群友倾情共建</span>
            <span>•</span>
            <span className="text-[#515154] dark:text-zinc-300 font-medium">原始资料整理：@我的世界皓宸</span>
          </div>

          {/* Contact & WeChat Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
            {/* WeChat with QR popup & copy */}
            <div className="relative group inline-flex items-center">
              <button
                onClick={() => setIsAboutModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f5f7] dark:bg-[#18181d] border border-black/[0.06] dark:border-white/[0.08] text-[#1d1d1f] dark:text-zinc-200 shadow-2xs hover:border-black/[0.18] dark:hover:border-white/[0.2] transition-all cursor-pointer"
                title="点击查看社群与微信二维码"
              >
                <span className="text-[#515154] dark:text-zinc-400 font-medium">微信:</span>
                <strong className="font-mono text-[#1d1d1f] dark:text-white select-all">Wibi2077</strong>
                <span className="text-[11px] text-[#71717a] dark:text-zinc-400 flex items-center gap-0.5">
                  <QrCode className="w-3 h-3" />
                  <span>扫码进群</span>
                </span>
              </button>

              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  const ok = await copyText('Wibi2077');
                  showToast(ok ? '微信号已复制！添加请备注：进AIGC学习群' : COPY_FAIL_MSG, ok ? 'success' : 'error');
                }}
                className="ml-1 text-[10.5px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#1d1d1f] dark:text-white hover:bg-black/10 dark:hover:bg-white/15 transition-colors cursor-pointer"
                title="复制微信号"
              >
                复制
              </button>

              {/* Desktop Hover Floating QR Card */}
              <div 
                onClick={() => setIsAboutModalOpen(true)}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 p-3 bg-white dark:bg-[#18181d] rounded-2xl shadow-2xl border border-black/[0.08] dark:border-white/[0.12] text-center w-48 cursor-pointer animate-fadeIn"
              >
                <div className="bg-white p-1 rounded-xl shadow-xs">
                  <img src="/wechat-qr.jpg" alt="微信二维码" className="w-40 h-auto mx-auto rounded-lg" />
                </div>
                <p className="text-[11.5px] font-bold text-[#1d1d1f] dark:text-white mt-2">扫码加微信 Wibi2077</p>
                <p className="text-[10px] text-[#86868b] dark:text-zinc-400">备注：进AIGC学习群</p>
              </div>
            </div>

            <a
              href="mailto:wuwei5986@gmail.com"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f5f7] dark:bg-[#18181d] border border-black/[0.06] dark:border-white/[0.08] text-[#1d1d1f] dark:text-zinc-200 hover:border-black/[0.18] dark:hover:border-white/[0.2] transition-all shadow-2xs"
              title="发送邮件"
            >
              <span className="text-[#515154] dark:text-zinc-400 font-medium">邮箱:</span>
              <span className="font-mono">wuwei5986@gmail.com</span>
            </a>

            <a
              href="https://x.com/wsiwsii"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f5f7] dark:bg-[#18181d] border border-black/[0.06] dark:border-white/[0.08] text-[#1d1d1f] dark:text-zinc-200 hover:border-black/[0.18] dark:hover:border-white/[0.2] transition-all shadow-2xs"
              title="访问 X (Twitter)"
            >
              <span className="font-medium">𝕏 Wibi X (@wsiwsii)</span>
            </a>

            <a
              href="https://github.com/Vieeeeeee/skills-gallery"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f5f7] dark:bg-[#18181d] border border-black/[0.06] dark:border-white/[0.08] text-[#1d1d1f] dark:text-zinc-200 hover:border-black/[0.18] dark:hover:border-white/[0.2] transition-all shadow-2xs"
            >
              <span>🐙 GitHub 开源主页</span>
            </a>
          </div>

          <p className="text-[11px] text-[#86868b] dark:text-zinc-400">
            提示词与开源仓库归原作者所有 · 欢迎创作者认领署名与交流合作
          </p>
          <div className="pt-1 flex items-center justify-center gap-2 text-[10px] text-black/20 dark:text-white/20">
            <span>© 2026 Edition · Curated by 威比 Hunter Wei.（抖音、小红书同名）</span>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="hover:text-black/60 dark:hover:text-white/60 transition-colors p-1 cursor-pointer"
              title="Admin Entrance"
            >
              🔒
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Back to Top Button (Only visible after scrolling down) */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-5 right-5 z-40 w-9 h-9 rounded-full bg-white/95 dark:bg-[#18181d]/95 hover:bg-white dark:hover:bg-[#22222a] text-[#1d1d1f] dark:text-zinc-100 shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-black/[0.08] dark:border-white/[0.12] backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer animate-fadeIn"
          title="回到顶部"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
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
        isAdmin={isAdmin}
        onSave={handleSaveItem}
        allTags={hotTags}
        categories={categories}
        onCopy={(msg, type) => showToast(msg, type)}
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
        correctPasscode={import.meta.env.VITE_ADMIN_PASSCODE || 'wibi888'}
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

      {/* About & Community Modal (Credits, WeChat QR, Contact, Claim) */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        onCopy={showToast}
      />

    </div>
  );
}
