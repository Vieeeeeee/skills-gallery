import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Download, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  Layers
} from 'lucide-react';

export function AdminUploadModal({
  isOpen,
  onClose,
  onAppendItems,
  onResetToDefault,
  onExportJson,
  totalCount
}) {
  const [dragActive, setDragActive] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file) => {
    if (!file) return;
    setParsing(true);
    setParseResult(null);

    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const json = JSON.parse(text);
        if (!Array.isArray(json) || json.length === 0) {
          throw new Error('JSON 格式必须为包含条目对象的数组');
        }
        // 逐项容错：条目会直接进渲染管线（React key={item.id}），
        // 缺 id / 重复 id / 缺标题会导致列表错乱，这里补齐并如实统计
        const seen = new Set();
        const valid = [];
        let skipped = 0;
        json.forEach((raw, i) => {
          if (!raw || typeof raw !== 'object' || !raw.title) { skipped++; return; }
          let id = typeof raw.id === 'string' && raw.id ? raw.id : `import-${Date.now()}-${i}`;
          while (seen.has(id)) id = `${id}-${i}`;
          seen.add(id);
          valid.push({ ...raw, id, type: raw.type || 'style' });
        });
        if (valid.length === 0) throw new Error('文件里没有可用条目（每条至少需要 title 字段）');
        onAppendItems(valid);
        setParseResult({
          success: true,
          count: valid.length,
          message: skipped > 0
            ? `导入 ${valid.length} 条，跳过 ${skipped} 条格式不合法的条目。`
            : `成功解析并导入 ${valid.length} 个 JSON 条目！`
        });
      } else if (file.name.endsWith('.docx')) {
        const mammothModule = await import('mammoth');
        const mammoth = mammothModule.default || mammothModule;
        
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const rawText = result.value;
        
        const paras = rawText.split('\n').map(p => p.trim()).filter(Boolean);
        const extracted = [];
        
        for (let i = 0; i < paras.length; i++) {
          const p = paras[i];
          if (p.length > 30 && (p.startsWith('请') || p.startsWith('将') || p.startsWith('以') || p.startsWith('把') || p.startsWith('参考') || p.startsWith('根据') || p.startsWith('创作') || p.startsWith('8K') || p.includes('风格') || p.includes('skill') || p.includes('github.com'))) {
            const firstLine = p.split('\n')[0];
            const title = firstLine.slice(0, 24).replace(/[，。]/g, ' ').trim();
            const isSkill = p.includes('github.com') || p.toLowerCase().includes('skill') || p.includes('帮我安装');
            
            extracted.push({
              id: `upload-${Date.now()}-${extracted.length+1}`,
              title: `[增补] ${title || '增补条目'}`,
              type: isSkill ? 'skill' : 'style',
              category: isSkill ? '开源 Skill' : '视觉风格提示词',
              tags: ['增补上传', isSkill ? 'Skill' : '风格'],
              prompt: p,
              command: isSkill ? `帮我安装 ${title}` : `复制提示词：${p.slice(0, 80)}...`,
              author: '上传导入',
              repo_url: p.match(/https?:\/\/github\.com\/[^\s]+/)?.[0] || '',
              description: p.slice(0, 130),
              usage_guide: '上传图片并应用该提示词。',
              aspect_ratio: p.includes('3:4') ? '3:4' : (p.includes('1:1') ? '1:1' : '自适应'),
              images: [],
              gradient: 'from-zinc-900/90 via-slate-900/80 to-zinc-950'
            });
          }
        }

        if (extracted.length > 0) {
          onAppendItems(extracted);
          setParseResult({
            success: true,
            count: extracted.length,
            message: `成功从 Docx 文档中解析并追加 ${extracted.length} 条新内容！`
          });
        } else {
          setParseResult({
            success: false,
            message: '未能从该 docx 中提取到有效提示词/Skill段落，请检查文件格式。'
          });
        }
      } else {
        throw new Error('仅支持 .docx 或 .json 格式文件');
      }
    } catch (err) {
      setParseResult({
        success: false,
        message: err.message || '文件解析失败'
      });
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white dark:bg-[#101014] border border-black/[0.08] dark:border-white/[0.1] rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden z-10 animate-scale-in max-h-[90vh] flex flex-col text-[#1d1d1f] dark:text-white">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between bg-white dark:bg-[#101014] sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-white">
              数据维护与增补管理
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-[#f5f5f7] dark:bg-white/[0.06] hover:bg-[#e8e8ed] dark:hover:bg-white/[0.12] text-[#6e6e73] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs">
          
          <div className="p-4 rounded-2xl bg-[#f5f5f7] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center">
                <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <div className="font-semibold text-[#1d1d1f] dark:text-white">当前画廊数据库</div>
                <div className="text-[#86868b] dark:text-zinc-400 text-[11px]">包含视觉风格、Skill、工具</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">{totalCount}</span>
              <span className="text-[#86868b] dark:text-zinc-400 ml-1">条</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              上传新 Docx / JSON 文件增补
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-black/[0.1] dark:border-white/[0.12] hover:border-black/[0.2] dark:hover:border-white/[0.24] bg-[#fafafc] dark:bg-[#141419] hover:bg-white dark:hover:bg-white/[0.08]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.json"
                onChange={handleChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-1">
                <UploadCloud className="w-6 h-6 animate-bounce" />
              </div>
              <div className="font-semibold text-sm text-[#1d1d1f] dark:text-white">
                点击选择文件 或 将文件拖拽至此处
              </div>
              <div className="text-[#86868b] dark:text-zinc-400 text-[11px]">
                支持 《网络热门风格➕Skill(x).docx》 文档 或 标准 .json 备份文件
              </div>
            </div>
          </div>

          {parsing && (
            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
              <span>正在智能解析文档结构与条目段落...</span>
            </div>
          )}

          {parseResult && (
            <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
              parseResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
            }`}>
              {parseResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-semibold text-xs">{parseResult.message}</div>
                {parseResult.success && (
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400">已自动存入本地存储并在页面中即时生效！</div>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] space-y-3">
            <div className="font-semibold text-[#1d1d1f] dark:text-white">
              数据备份与系统重置
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={onExportJson}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#f5f5f7] dark:bg-white/[0.06] hover:bg-[#e8e8ed] dark:hover:bg-white/[0.12] border border-black/[0.06] dark:border-white/[0.08] text-[#1d1d1f] dark:text-white transition-all font-semibold shadow-2xs"
              >
                <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>导出全量 JSON 备份</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm('确定要清空本地修改并重置回官方初始数据吗？')) {
                    onResetToDefault();
                    setParseResult({
                      success: true,
                      message: '已重置回官方初始纯净数据集！'
                    });
                  }
                }}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 transition-all font-semibold shadow-2xs"
              >
                <RotateCcw className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>重置回初始数据</span>
              </button>
            </div>
          </div>

        </div>

        <div className="px-6 py-3.5 border-t border-black/[0.06] dark:border-white/[0.08] bg-[#fafafc] dark:bg-[#141419] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1d1d1f] hover:bg-black text-xs font-semibold text-white transition-colors"
          >
            完成并关闭
          </button>
        </div>

      </div>
    </div>
  );
}

