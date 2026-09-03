import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles } from 'lucide-react';

export function EditModal({
  isOpen,
  onClose,
  item,
  onSave,
  categories = []
}) {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    type: 'style',
    category: '海报拼贴',
    tags: '',
    author: '',
    repo_url: '',
    aspect_ratio: '3:4',
    prompt: '',
    command: '',
    usage_guide: '',
    image_url: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id || '',
        title: item.title || '',
        type: item.type || 'style',
        category: item.category || '海报拼贴',
        tags: (item.tags || []).join(', '),
        author: item.author || '',
        repo_url: item.repo_url || '',
        aspect_ratio: item.aspect_ratio || '3:4',
        prompt: item.prompt || '',
        command: item.command || '',
        usage_guide: item.usage_guide || '',
        image_url: (item.images && item.images[0]) || '',
      });
    } else {
      setFormData({
        id: `custom-${Date.now()}`,
        title: '',
        type: 'style',
        category: '海报拼贴',
        tags: '热门风格, 提示词',
        author: '威比 / 自定义',
        repo_url: '',
        aspect_ratio: '3:4',
        prompt: '',
        command: '',
        usage_guide: '',
        image_url: '',
      });
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.prompt.trim()) {
      alert('请填写标题和提示词/内容');
      return;
    }

    const savedItem = {
      id: formData.id || `custom-${Date.now()}`,
      title: formData.title.trim(),
      type: formData.type,
      category: formData.category.trim() || '未分类',
      tags: formData.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean),
      author: formData.author.trim() || '开源社区',
      repo_url: formData.repo_url.trim(),
      aspect_ratio: formData.aspect_ratio,
      prompt: formData.prompt.trim(),
      command: formData.command.trim(),
      description: formData.prompt.slice(0, 140).trim(),
      cover_image: formData.image_url.trim() || item?.cover_image || '',
      images: formData.image_url.trim() ? [formData.image_url.trim()] : (item?.images || []),
      target_model: item?.target_model || '通用大模型',
      negative_prompt: item?.negative_prompt || '',
      is_motion: item?.is_motion || false,
      motion_prompt: item?.motion_prompt || '',
      accent_color: item?.accent_color || '#4A6FA5',
      gradient: item?.gradient || 'from-zinc-900/90 via-slate-900/80 to-zinc-950'
    };

    onSave(savedItem);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white border border-black/[0.08] rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden z-10 animate-scale-in max-h-[90vh] flex flex-col text-[#1d1d1f]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-[#1d1d1f]">
              {item ? '编辑条目' : '新增 Skill / 风格提示词'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#6e6e73] hover:text-[#1d1d1f]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-[#1d1d1f]">条目标题 *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="例如：[旅行海报] 二分构图·哑光米白艺术纸明信片"
                className="w-full px-3.5 py-2.5 bg-[#f5f5f7] focus:bg-white border border-black/[0.06] focus:border-indigo-500 rounded-xl text-[#1d1d1f] outline-none text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#1d1d1f]">类型 *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#f5f5f7] focus:bg-white border border-black/[0.06] focus:border-indigo-500 rounded-xl text-[#1d1d1f] outline-none text-xs"
              >
                <option value="style">🎨 视觉风格提示词</option>
                <option value="skill">⚡️ 开源 Skill</option>
                <option value="tool">🛠️ 辅助设计工具</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#1d1d1f]">分类 *</label>
              <input
                type="text"
                required
                list="category-suggestions"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="例如：海报拼贴 / 视频生成"
                className="w-full px-3.5 py-2.5 bg-[#f5f5f7] focus:bg-white border border-black/[0.06] focus:border-indigo-500 rounded-xl text-[#1d1d1f] outline-none text-xs"
              />
              <datalist id="category-suggestions">
                {categories.map((c, i) => (
                  <option key={i} value={c} />
                ))}
              </datalist>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#1d1d1f]">画幅比例 / 格式</label>
              <select
                value={formData.aspect_ratio}
                onChange={(e) => setFormData({ ...formData, aspect_ratio: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#f5f5f7] focus:bg-white border border-black/[0.06] focus:border-indigo-500 rounded-xl text-[#1d1d1f] outline-none text-xs"
              >
                <option value="3:4">3:4 竖版海报</option>
                <option value="1:1">1:1 正方形</option>
                <option value="16:9">16:9 横版视频</option>
                <option value="9:16">9:16 短视频</option>
                <option value="自适应">自适应 / 通用</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#1d1d1f]">真实作者 / 来源</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="例如：Zeejay0 / 卡兹克 / 开源社区"
                className="w-full px-3.5 py-2.5 bg-[#f5f5f7] focus:bg-white border border-black/[0.06] focus:border-indigo-500 rounded-xl text-[#1d1d1f] outline-none text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#1d1d1f]">GitHub 仓库 / 链接</label>
              <input
                type="url"
                value={formData.repo_url}
                onChange={(e) => setFormData({ ...formData, repo_url: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full px-3.5 py-2.5 bg-[#f5f5f7] focus:bg-white border border-black/[0.06] focus:border-indigo-500 rounded-xl text-[#1d1d1f] outline-none text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#1d1d1f]">标签 (逗号分隔)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="例如：二分构图, 水彩插画, 3:4竖版"
              className="w-full px-3.5 py-2.5 bg-[#f5f5f7] focus:bg-white border border-black/[0.06] focus:border-indigo-500 rounded-xl text-[#1d1d1f] outline-none text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#1d1d1f]">一键调用 / 安装指令</label>
            <input
              type="text"
              value={formData.command}
              onChange={(e) => setFormData({ ...formData, command: e.target.value })}
              placeholder="例如：帮我安装 github 上 LiamGvchi 的 gc-minimal-zine-poster skill"
              className="w-full px-3.5 py-2.5 bg-[#f5f5f7] focus:bg-white border border-black/[0.06] font-mono focus:border-indigo-500 rounded-xl text-[#1d1d1f] outline-none text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#1d1d1f]">完整提示词 / 风格描述 *</label>
            <textarea
              required
              rows={6}
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              placeholder="输入完整的生图 Prompt、负向提示词或 Skill 工作流要求..."
              className="w-full p-3.5 bg-[#f5f5f7] focus:bg-white border border-black/[0.06] rounded-2xl text-[#1d1d1f] font-mono focus:border-indigo-500 outline-none text-xs leading-relaxed"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#1d1d1f]">使用指南与参数建议</label>
            <textarea
              rows={2}
              value={formData.usage_guide}
              onChange={(e) => setFormData({ ...formData, usage_guide: e.target.value })}
              placeholder="例如：上传原图，比例建议 3:4..."
              className="w-full p-3 bg-[#f5f5f7] focus:bg-white border border-black/[0.06] rounded-xl text-[#1d1d1f] focus:border-indigo-500 outline-none text-xs leading-relaxed"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#1d1d1f]">图片预览路径或外链 (可选)</label>
            <input
              type="text"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="例如：/images/image1.jpg 或 https://..."
              className="w-full px-3.5 py-2.5 bg-[#f5f5f7] focus:bg-white border border-black/[0.06] focus:border-indigo-500 rounded-xl text-[#1d1d1f] outline-none text-xs"
            />
          </div>

          <div className="pt-4 border-t border-black/[0.06] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#f5f5f7] hover:bg-[#e8e8ed] font-semibold text-[#515154] hover:text-[#1d1d1f] transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1d1d1f] hover:bg-black font-semibold text-white shadow-xs transition-all"
            >
              <Save className="w-4 h-4" />
              <span>保存条目</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

