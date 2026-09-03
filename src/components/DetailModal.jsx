import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Bookmark, 
  Sparkles, 
  Terminal, 
  Tag, 
  Compass,
  Layers,
  ArrowRight,
  Maximize2,
  Download,
  Palette,
  Wrench,
  Edit3,
  Save,
  Trash2,
  Plus,
  Star,
  Hash,
  Upload,
  ImagePlus
} from 'lucide-react';
import { GithubIcon } from './Icons';
import { ImageLightbox } from './ImageLightbox';

export function DetailModal({
  item,
  isOpen,
  onClose,
  isAdmin = false,
  onSave,
  allTags = [],
  categories = [],
  isBookmarked,
  onToggleBookmark,
  onCopy,
  onSelectRelated,
  relatedItems = []
}) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedInstallCmd, setCopiedInstallCmd] = useState(false);
  const [copiedMotion, setCopiedMotion] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Admin Editing States
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    category: '',
    author: '',
    repo_url: '',
    description: '',
    prompt: '',
    tags: [],
    images: [],
    cover_image: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestionsOpen, setTagSuggestionsOpen] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const fileInputRef = useRef(null);
  const tagInputRef = useRef(null);

  // Sync editData when item changes or modal opens
  useEffect(() => {
    if (item) {
      const imgs = Array.isArray(item.images) && item.images.length > 0 
        ? [...item.images] 
        : (item.cover_image ? [item.cover_image] : []);
      setEditData({
        title: item.title || '',
        category: item.category || '未分类',
        author: item.author || '',
        repo_url: item.repo_url || item.install_command || '',
        description: item.description || '',
        prompt: item.prompt || '',
        tags: Array.isArray(item.tags) ? [...item.tags] : [],
        images: imgs,
        cover_image: item.cover_image || imgs[0] || ''
      });
    }
    setIsEditing(false);
    setTagInput('');
    setNewImageUrl('');
    setTagSuggestionsOpen(false);
  }, [item, isOpen]);

  // --- Obsidian-Style Tag Handlers ---
  const tagSuggestions = useMemo(() => {
    if (!tagInput.trim()) return [];
    const query = tagInput.trim().toLowerCase().replace(/^#/, '');
    return (allTags || [])
      .filter(t => t.toLowerCase().includes(query) && !editData.tags.includes(t))
      .slice(0, 8);
  }, [allTags, tagInput, editData.tags]);

  const handleAddTag = (rawTag) => {
    const cleaned = (rawTag || tagInput).trim().replace(/^#/, '').replace(/[,，]/g, '');
    if (!cleaned) return;
    if (!editData.tags.includes(cleaned)) {
      setEditData(prev => ({
        ...prev,
        tags: [...prev.tags, cleaned]
      }));
    }
    setTagInput('');
    setTagSuggestionsOpen(false);
    tagInputRef.current?.focus();
  };

  const handleRemoveTag = (tagToRemove) => {
    setEditData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagSuggestions.length > 0 && tagSuggestions[0].toLowerCase() === tagInput.trim().toLowerCase()) {
        handleAddTag(tagSuggestions[0]);
      } else if (tagInput.trim()) {
        handleAddTag(tagInput);
      }
    } else if (e.key === 'Backspace' && !tagInput && editData.tags.length > 0) {
      handleRemoveTag(editData.tags[editData.tags.length - 1]);
    } else if (e.key === 'Escape') {
      setTagSuggestionsOpen(false);
    }
  };

  // --- Image Upload & Delete Handlers ---
  const handleDeleteImage = (indexToDelete) => {
    setEditData(prev => {
      const updated = prev.images.filter((_, idx) => idx !== indexToDelete);
      let newCover = prev.cover_image;
      if (prev.cover_image === prev.images[indexToDelete]) {
        newCover = updated[0] || '';
      }
      return {
        ...prev,
        images: updated,
        cover_image: newCover
      };
    });
  };

  const handleSetCover = (imgUrl) => {
    setEditData(prev => ({
      ...prev,
      cover_image: imgUrl
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (result) {
          setEditData(prev => ({
            ...prev,
            images: [...prev.images, result],
            cover_image: prev.cover_image || result
          }));
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddImageUrl = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    setEditData(prev => ({
      ...prev,
      images: [...prev.images, trimmed],
      cover_image: prev.cover_image || trimmed
    }));
    setNewImageUrl('');
  };

  // --- Save Handler ---
  const handleSave = () => {
    if (!editData.title.trim()) {
      alert('请填写条目名称/标题');
      return;
    }
    const updatedItem = {
      ...item,
      title: editData.title.trim(),
      category: editData.category.trim() || item.category || '未分类',
      author: editData.author.trim() || item.author || '开源社区',
      repo_url: editData.repo_url.trim(),
      description: editData.description.trim(),
      prompt: editData.prompt.trim(),
      tags: editData.tags,
      images: editData.images,
      cover_image: editData.cover_image || editData.images[0] || ''
    };

    if (onSave) {
      onSave(updatedItem);
    }
    setIsEditing(false);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(item.prompt || item.description);
    setCopiedPrompt(true);
    if (onCopy) onCopy('提示词已完整复制到剪贴板');
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(item.command || item.prompt);
    setCopiedCmd(true);
    if (onCopy) onCopy('调用指令已复制');
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleCopyInstallCmd = () => {
    navigator.clipboard.writeText(item.install_command || item.command);
    setCopiedInstallCmd(true);
    if (onCopy) onCopy('安装指令已复制');
    setTimeout(() => setCopiedInstallCmd(false), 2000);
  };

  const handleCopyMotion = () => {
    if (!item?.motion_prompt) return;
    navigator.clipboard.writeText(item.motion_prompt);
    setCopiedMotion(true);
    if (onCopy) onCopy('运镜提示词已复制');
    setTimeout(() => setCopiedMotion(false), 2000);
  };

  if (!isOpen || !item) return null;

  const images = item.images && item.images.length > 0 
    ? item.images 
    : (item.cover_image ? [item.cover_image] : []);

  const openLightbox = (index = 0) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const seriesMatch = (item.title || '').match(/^\[([^\]]+)\]\s*(.*)$/);
  const seriesName = seriesMatch ? seriesMatch[1] : (item.category || '精选');
  const mainTitle = seriesMatch ? seriesMatch[2] : (item.title || '');

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-4xl lg:max-w-5xl bg-white dark:bg-[#101014] rounded-2xl sm:rounded-3xl shadow-2xl border border-black/[0.08] dark:border-white/[0.12] overflow-hidden my-auto max-h-[92vh] flex flex-col text-[#1d1d1f] dark:text-zinc-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-black/[0.06] dark:border-white/[0.08] shrink-0 bg-[#fafafc] dark:bg-[#141419]">
            {isEditing ? (
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  管理员编辑模式
                </span>
                <span className="text-xs font-mono text-[#86868b] dark:text-zinc-400 truncate">
                  ID: {item.id}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 shrink-0">
                  {seriesName}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-[#1d1d1f] dark:text-white truncate">
                  {mainTitle}
                </h2>
              </div>
            )}

            <div className="flex items-center gap-2 shrink-0">
              {isAdmin && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold shadow-2xs transition-all"
                  title="编辑此卡片信息与图片"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span>编辑卡片</span>
                </button>
              )}

              {isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/[0.08] hover:bg-[#f5f5f7] dark:hover:bg-white/[0.14] border border-black/[0.08] dark:border-white/[0.1] text-[#515154] dark:text-zinc-300 text-xs font-medium transition-all"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>保存修改</span>
                  </button>
                </>
              )}

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white dark:bg-white/[0.08] hover:bg-[#f5f5f7] dark:hover:bg-white/[0.14] border border-black/[0.08] dark:border-white/[0.1] text-[#86868b] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-white transition-all"
                title="关闭"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            
            {/* ========================================================= */}
            {/* EDIT MODE FORM                                             */}
            {/* ========================================================= */}
            {isEditing ? (
              <div className="space-y-5 animate-fadeIn">
                
                {/* 1. Image Upload & Management Section */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-[#fafafc] dark:bg-[#141419] border border-black/[0.06] dark:border-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-1.5">
                      <ImagePlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      样例与封面图片管理 ({editData.images.length})
                    </span>
                    <span className="text-[11px] text-[#86868b] dark:text-zinc-500">
                      支持上传本地图、粘贴 URL、设为封面、一键删除
                    </span>
                  </div>

                  {/* Images Grid with Delete & Set Cover */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    {editData.images.map((img, idx) => {
                      const isCover = editData.cover_image === img || (idx === 0 && !editData.cover_image);
                      return (
                        <div 
                          key={idx}
                          className={`group relative aspect-square rounded-xl overflow-hidden bg-[#f0f0f4] dark:bg-[#1c1c22] border ${isCover ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-black/[0.08] dark:border-white/[0.1]'} shadow-xs flex items-center justify-center`}
                        >
                          <img src={img} alt={`样例 ${idx + 1}`} className="w-full h-full object-cover" />
                          
                          {/* Delete Button (Top Right) */}
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(idx)}
                            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white shadow-md transition-all opacity-90 group-hover:opacity-100 scale-95 group-hover:scale-105"
                            title="删除此图片"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Cover indicator / Set Cover button (Top Left) */}
                          {isCover ? (
                            <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <span>封面</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetCover(img)}
                              className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 hover:bg-black text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              设为封面
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Upload New Image Box */}
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-black/[0.12] dark:border-white/[0.14] hover:border-indigo-500 dark:hover:border-indigo-400 bg-black/[0.01] dark:bg-white/[0.02] hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all group"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                        <Upload className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-[#1d1d1f] dark:text-white">上传本地图片</span>
                      <span className="text-[10px] text-[#86868b] dark:text-zinc-500 mt-0.5">JPG / PNG / WebP</span>
                    </div>
                  </div>

                  {/* Hidden File Input */}
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileUpload} 
                  />

                  {/* Add via URL row */}
                  <div className="flex items-center gap-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
                    <input 
                      type="text" 
                      value={newImageUrl} 
                      onChange={(e) => setNewImageUrl(e.target.value)} 
                      placeholder="或粘贴网络图片 URL 链接..." 
                      className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#18181d] border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#1d1d1f] dark:text-zinc-100 placeholder-[#86868b] dark:placeholder-zinc-500 outline-none focus:border-indigo-500"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageUrl(); }}}
                    />
                    <button 
                      type="button" 
                      onClick={handleAddImageUrl}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-medium transition-all"
                    >
                      添加
                    </button>
                  </div>
                </div>

                {/* 2. Core Fields Grid */}
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#1d1d1f] dark:text-white">
                        条目名称 / 风格标题 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        placeholder="如：[赛博流体] 霓虹光泽..."
                        className="w-full px-3.5 py-2 rounded-xl bg-[#f8f8fa] dark:bg-[#16161c] border border-black/[0.08] dark:border-white/[0.1] text-xs sm:text-sm text-[#1d1d1f] dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#1d1d1f] dark:text-white">
                        所属分类
                      </label>
                      <input
                        list="cat-datalist"
                        type="text"
                        value={editData.category}
                        onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                        placeholder="选择或直接输入分类..."
                        className="w-full px-3.5 py-2 rounded-xl bg-[#f8f8fa] dark:bg-[#16161c] border border-black/[0.08] dark:border-white/[0.1] text-xs sm:text-sm text-[#1d1d1f] dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <datalist id="cat-datalist">
                        {categories.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#1d1d1f] dark:text-white">
                        创作者 / 来源
                      </label>
                      <input
                        type="text"
                        value={editData.author}
                        onChange={(e) => setEditData({ ...editData, author: e.target.value })}
                        placeholder="@作者名称"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#f8f8fa] dark:bg-[#16161c] border border-black/[0.08] dark:border-white/[0.1] text-xs sm:text-sm text-[#1d1d1f] dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#1d1d1f] dark:text-white">
                        安装地址 / 仓库链接 (Repo URL)
                      </label>
                      <input
                        type="text"
                        value={editData.repo_url}
                        onChange={(e) => setEditData({ ...editData, repo_url: e.target.value })}
                        placeholder="https://github.com/..."
                        className="w-full px-3.5 py-2 rounded-xl bg-[#f8f8fa] dark:bg-[#16161c] border border-black/[0.08] dark:border-white/[0.1] text-xs sm:text-sm font-mono text-[#1d1d1f] dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1d1d1f] dark:text-white">
                      简介说明 (Description)
                    </label>
                    <textarea
                      rows={3}
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      placeholder="输入此条目的详细说明、应用场景或设计背景..."
                      className="w-full p-3.5 rounded-xl bg-[#f8f8fa] dark:bg-[#16161c] border border-black/[0.08] dark:border-white/[0.1] text-xs sm:text-sm text-[#1d1d1f] dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-y"
                    />
                  </div>

                  {/* Prompt */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1d1d1f] dark:text-white">
                      完整提示词 / 调用指令 (Prompt / Command)
                    </label>
                    <textarea
                      rows={4}
                      value={editData.prompt}
                      onChange={(e) => setEditData({ ...editData, prompt: e.target.value })}
                      placeholder="输入完整的生图 Prompt、调用指令或安装代码..."
                      className="w-full p-3.5 rounded-xl bg-[#f8f8fa] dark:bg-[#16161c] border border-black/[0.08] dark:border-white/[0.1] text-xs sm:text-sm font-mono text-[#1d1d1f] dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-y"
                    />
                  </div>
                </div>

                {/* 3. Obsidian-Style Tag Manager */}
                <div className="space-y-2 p-3.5 sm:p-4 rounded-2xl bg-[#fafafc] dark:bg-[#141419] border border-black/[0.06] dark:border-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      标签管理 (Obsidian 实时索引与搜索)
                    </label>
                    <span className="text-[11px] text-[#86868b] dark:text-zinc-500">
                      按回车或逗号添加 · 退格键快捷删除
                    </span>
                  </div>

                  {/* Tags Container with Inline Input */}
                  <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#18181d] border border-black/[0.08] dark:border-white/[0.1] focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all min-h-[46px]">
                    {editData.tags.map((tg) => (
                      <span
                        key={tg}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 text-xs font-medium"
                      >
                        <span>#{tg}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tg)}
                          className="text-indigo-400 hover:text-rose-600 dark:hover:text-rose-400 ml-0.5 transition-colors"
                          title="删除标签"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}

                    {/* Inline Input with Live Suggestions Dropdown */}
                    <div className="relative flex-1 min-w-[180px]">
                      <input
                        ref={tagInputRef}
                        type="text"
                        value={tagInput}
                        onChange={(e) => {
                          setTagInput(e.target.value);
                          setTagSuggestionsOpen(true);
                        }}
                        onFocus={() => setTagSuggestionsOpen(true)}
                        onKeyDown={handleTagKeyDown}
                        placeholder={editData.tags.length === 0 ? "输入标签... (按回车添加，支持索引现有标签)" : "添加标签..."}
                        className="w-full py-1 text-xs text-[#1d1d1f] dark:text-zinc-100 placeholder-[#86868b] dark:placeholder-zinc-500 bg-transparent outline-none"
                      />

                      {/* Obsidian Suggestions Popover */}
                      {tagSuggestionsOpen && tagInput.trim() && (
                        <div className="absolute left-0 top-full mt-1.5 w-64 max-h-52 overflow-y-auto rounded-xl bg-white dark:bg-[#1a1a20] border border-black/[0.08] dark:border-white/[0.12] shadow-xl z-50 p-1.5 text-xs">
                          <div className="px-2.5 py-1 text-[10px] font-mono text-[#86868b] dark:text-zinc-500 uppercase tracking-wider">
                            匹配现有标签 ({tagSuggestions.length})
                          </div>

                          {/* Create new tag option */}
                          {!allTags.includes(tagInput.trim()) && (
                            <button
                              type="button"
                              onClick={() => handleAddTag(tagInput)}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-1.5 transition-colors font-medium"
                            >
                              <Plus className="w-3 h-3" />
                              <span>创建新标签: <strong>#{tagInput.trim()}</strong></span>
                            </button>
                          )}

                          {/* Existing Tag Suggestions */}
                          {tagSuggestions.map((sug) => (
                            <button
                              key={sug}
                              type="button"
                              onClick={() => handleAddTag(sug)}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg text-[#1d1d1f] dark:text-zinc-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-between transition-colors"
                            >
                              <span className="flex items-center gap-1.5">
                                <Tag className="w-3 h-3 opacity-60" />
                                #{sug}
                              </span>
                              <span className="text-[10px] font-mono opacity-50">Enter 选择</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              /* ========================================================= */
              /* READ-ONLY VIEW MODE                                        */
              /* ========================================================= */
              <>
                {/* 1. Images Gallery Area (If images exist) */}
                {images.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#86868b] dark:text-zinc-400 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        效果展示与样例 ({images.length})
                      </span>
                      <span className="text-[11px] text-[#86868b] dark:text-zinc-500">
                        点击图片查看全屏无损大图
                      </span>
                    </div>

                    <div className={`grid gap-2.5 sm:gap-3 ${
                      images.length === 1 
                        ? 'grid-cols-1 max-w-sm mx-auto' 
                        : images.length === 2 
                          ? 'grid-cols-2' 
                          : images.length === 3 
                            ? 'grid-cols-3' 
                            : 'grid-cols-2 lg:grid-cols-4'
                    }`}>
                      {images.map((img, idx) => (
                        <div 
                          key={idx}
                          onClick={() => openLightbox(idx)}
                          className="group relative aspect-square rounded-xl overflow-hidden bg-[#f5f5f7] dark:bg-[#18181d] border border-black/[0.06] dark:border-white/[0.08] cursor-zoom-in flex items-center justify-center shadow-xs"
                        >
                          <img
                            src={img}
                            alt={`${mainTitle} 样例 ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="p-2 rounded-full bg-white/90 dark:bg-zinc-800/90 text-[#1d1d1f] dark:text-white shadow-md backdrop-blur-md">
                              <Maximize2 className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Metadata Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 sm:p-3.5 bg-[#f8f8fa] dark:bg-[#16161c] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] text-xs">
                  <div>
                    <span className="text-[#86868b] dark:text-zinc-400 block text-[11px]">内容类型</span>
                    <span className="font-semibold text-[#1d1d1f] dark:text-white mt-0.5 inline-flex items-center gap-1">
                      {item.type === 'style' ? '🎨 视觉风格' : (item.type === 'skill' ? '⚡ 智能体技能' : '🛠️ 设计工具')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#86868b] dark:text-zinc-400 block text-[11px]">所属分类</span>
                    <span className="font-semibold text-[#1d1d1f] dark:text-white mt-0.5 block">{item.category}</span>
                  </div>
                  <div>
                    <span className="text-[#86868b] dark:text-zinc-400 block text-[11px]">创作者 / 来源</span>
                    <span className="font-semibold text-[#1d1d1f] dark:text-white mt-0.5 block truncate">
                      @{item.author === 'Vie' || item.author === 'vie' || item.author === 'Vie (威比)' ? '威比 Hunter Wei.' : (item.author || '开源社区')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#86868b] dark:text-zinc-400 block text-[11px]">{item.type === 'style' ? '建议画幅' : '系统编号'}</span>
                    <span className="font-mono font-semibold text-[#1d1d1f] dark:text-white mt-0.5 block">
                      {item.type === 'style' ? (item.aspect_ratio || '3:4 / 自适应') : item.id}
                    </span>
                  </div>
                </div>

                {/* 3. TYPE-SPECIFIC SECTIONS */}

                {/* A. Style Details (Prompt Box) */}
                {item.type === 'style' && (
                  <div className="space-y-3.5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          完整生图提示词 (Prompt)
                        </label>
                        <button
                          onClick={handleCopyPrompt}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            copiedPrompt 
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' 
                              : 'bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                          }`}
                        >
                          {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedPrompt ? '已复制' : '一键复制 Prompt'}</span>
                        </button>
                      </div>
                      <div className="relative p-3.5 sm:p-4 rounded-2xl bg-[#f5f5f7] dark:bg-black/60 border border-black/[0.06] dark:border-white/[0.08] text-xs sm:text-sm text-[#1d1d1f] dark:text-zinc-100 font-mono leading-relaxed whitespace-pre-wrap select-all max-h-[300px] overflow-y-auto">
                        {item.prompt}
                      </div>
                    </div>

                    {/* Motion Prompt */}
                    {item.is_motion && item.motion_prompt && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                            动态视频运镜提示词 (Motion Prompt)
                          </label>
                          <button
                            onClick={handleCopyMotion}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                              copiedMotion 
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' 
                                : 'bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            }`}
                          >
                            {copiedMotion ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedMotion ? '已复制' : '复制运镜词'}</span>
                          </button>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-200 font-mono leading-relaxed select-all">
                          {item.motion_prompt}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* B. Skill Details (Call & Install Command & Repo) */}
                {item.type === 'skill' && (
                  <div className="space-y-3.5">
                    {/* Description */}
                    {item.description && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-[#1d1d1f] dark:text-white">技能说明</span>
                        <div className="p-3.5 rounded-2xl bg-[#f8f8fa] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] text-xs sm:text-sm text-[#515154] dark:text-zinc-300 leading-relaxed">
                          {item.description}
                        </div>
                      </div>
                    )}

                    {/* 1. Install Command (PRIMARY & PROMINENT) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5" />
                          安装指令 (在终端运行以安装 Skill)
                        </span>
                        <button
                          onClick={handleCopyInstallCmd}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            copiedInstallCmd
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {copiedInstallCmd ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedInstallCmd ? '已复制' : '复制安装指令'}</span>
                        </button>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-950 dark:text-emerald-200 font-mono select-all break-all flex items-center justify-between gap-2">
                        <span>{item.install_command || (item.repo_url ? `请在终端执行安装：${item.repo_url}` : '通用标准 Agent 技能包')}</span>
                      </div>
                    </div>

                    {/* 2. Chat Trigger Command */}
                    {item.command && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#86868b] dark:text-zinc-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                            对话调用指令 (安装后在对话中触发)
                          </span>
                          <button
                            onClick={handleCopyCmd}
                            className="text-xs text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white flex items-center gap-1 transition-colors"
                          >
                            {copiedCmd ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedCmd ? '已复制' : '复制'}</span>
                          </button>
                        </div>
                        <div className="p-3 rounded-xl bg-[#f5f5f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#515154] dark:text-zinc-300 font-mono select-all break-all">
                          {item.command}
                        </div>
                      </div>
                    )}

                    {/* 3. GitHub Source Link */}
                    {item.repo_url && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8f8fa] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08]">
                        <span className="text-xs text-[#86868b] dark:text-zinc-400 flex items-center gap-1.5">
                          <GithubIcon className="w-3.5 h-3.5" />
                          开源代码仓库
                        </span>
                        <a
                          href={item.repo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <span>查看 GitHub 仓库</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* C. Tool Details */}
                {item.type === 'tool' && (
                  <div className="space-y-3.5">
                    {item.description && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-[#1d1d1f] dark:text-white">工具描述</span>
                        <div className="p-3.5 rounded-2xl bg-[#f8f8fa] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] text-xs sm:text-sm text-[#515154] dark:text-zinc-300 leading-relaxed">
                          {item.description}
                        </div>
                      </div>
                    )}

                    {item.repo_url && (
                      <a
                        href={item.repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>立即打开并使用该工具</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Tags Row */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-xs text-[#86868b] dark:text-zinc-400 font-medium flex items-center gap-1 mr-1">
                      <Tag className="w-3.5 h-3.5" />
                      标签:
                    </span>
                    {item.tags.map((tg, i) => (
                      <span 
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg bg-[#f5f5f7] dark:bg-white/[0.06] text-[#515154] dark:text-zinc-300 font-medium"
                      >
                        #{tg}
                      </span>
                    ))}
                  </div>
                )}

                {/* Related Recommendations */}
                {relatedItems && relatedItems.length > 0 && (
                  <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2.5">
                    <span className="text-xs font-semibold text-[#86868b] dark:text-zinc-400 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      同分类灵感推荐
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {relatedItems.slice(0, 3).map((rel) => (
                        <button
                          key={rel.id}
                          onClick={() => onSelectRelated(rel)}
                          className="p-2.5 rounded-xl bg-[#f8f8fa] dark:bg-[#16161c] hover:bg-[#f0f0f4] dark:hover:bg-[#1e1e24] border border-black/[0.04] dark:border-white/[0.06] text-left transition-all group"
                        >
                          <div className="text-xs font-semibold text-[#1d1d1f] dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                            {rel.title.replace(/^\[[^\]]+\]\s*/, '')}
                          </div>
                          <div className="text-[11px] text-[#86868b] dark:text-zinc-400 mt-0.5">
                            @{rel.author || '开源社区'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

          </div>

          {/* Footer Action Bar */}
          <div className="p-4 sm:p-5 border-t border-black/[0.06] dark:border-white/[0.08] bg-[#fafafc] dark:bg-[#141419] flex items-center justify-between gap-3 shrink-0">
            <span className="text-xs text-[#86868b] dark:text-zinc-500 font-mono hidden sm:inline">
              ID: {item.id} {isEditing && <span className="text-amber-600 dark:text-amber-400 ml-1">· 管理员编辑中</span>}
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-white/[0.08] hover:bg-[#f5f5f7] dark:hover:bg-white/[0.14] border border-black/[0.08] dark:border-white/[0.1] text-[#515154] dark:text-zinc-300 text-xs font-semibold transition-all"
                  >
                    取消修改
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>保存修改并生效</span>
                  </button>
                </>
              ) : (
                <>
                  {isAdmin && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold shadow-2xs transition-all"
                      title="编辑此卡片信息与图片"
                    >
                      <Edit3 className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                      <span>编辑卡片</span>
                    </button>
                  )}

                  {item.type === 'skill' ? (
                    <button
                      onClick={handleCopyCmd}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all"
                    >
                      {copiedCmd ? <Check className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
                      <span>{copiedCmd ? '已复制安装指令' : '复制安装指令'}</span>
                    </button>
                  ) : item.type === 'tool' && item.repo_url ? (
                    <a
                      href={item.repo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>访问工具</span>
                    </a>
                  ) : (
                    <button
                      onClick={handleCopyPrompt}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
                    >
                      {copiedPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedPrompt ? '已复制 Prompt' : '复制生图 Prompt'}</span>
                    </button>
                  )}

                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-white/[0.08] hover:bg-[#f5f5f7] dark:hover:bg-white/[0.14] border border-black/[0.08] dark:border-white/[0.1] text-[#515154] dark:text-zinc-300 hover:text-[#1d1d1f] dark:hover:text-white text-xs font-semibold transition-all"
                  >
                    关闭
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Standalone Fullscreen Lightbox */}
      <ImageLightbox
        isOpen={lightboxOpen}
        images={images}
        currentIndex={lightboxIndex}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
