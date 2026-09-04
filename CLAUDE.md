# Prompt & Skill 风格大赏 (Skills Gallery)

工业级视觉生图提示词与开源智能体技能灵感字典。纯前端无状态单页架构，托管于 Cloudflare Pages。

## 常用命令速查

```bash
# 开发环境启动 (Vite 默认端口 5173)
npm run dev

# 数据健康度与规范校验 (修改数据前后必跑)
npm run validate:data

# 生产环境编译打包 (产物输出至 dist/)
npm run build

# 本地预览生产构建产物
npm run preview

# 部署至 Cloudflare Pages (生产分发)
npx wrangler pages deploy dist --project-name=skills-gallery
```

## 技术栈与架构核心

- **核心框架**: React 19 + Vite 6 + TailwindCSS 3.4
- **图标系统**: Lucide React
- **数据单源**: `public/skills_data.json` (1,079 条目，含 999 视觉风格、72 Agent 技能、8 工具)
- **部署平台**: Cloudflare Pages (`https://skills-gallery-bs1.pages.dev`)

## 核心组件与布局分工

- `src/App.jsx`: 主入口、模式调度（画廊 vs 速写本）、主题管理（亮色/暗黑）、全局弹窗调度、浮动交流群入口。
- `src/components/Navbar.jsx`: 顶部常驻导航栏，支持全局搜索（`/` 快捷聚焦）、速写本模式切换、分类筛选、交流群入口。
- `src/components/CardItem.jsx`: 画廊瀑布流卡片，分流渲染 Style（海报）、Skill（智能体终端卡）、Tool（工具卡）。
- `src/utils/copy.js`: **全站唯一的剪贴板出口**。`navigator.clipboard` 在微信内置浏览器等 WebView 里可能不存在或被拒绝，直接调用会静默失败甚至让 UI 谎报「已复制」。任何新增的复制动作都必须走 `copyText()` 并处理它的 false 返回值，禁止直接调 `navigator.clipboard`。
- `src/utils/search.js`: 搜索语料按条目缓存在 WeakMap 里（不缓存的话每次按键要为 1079 条重拼全文，实测 20ms/键）。新增可搜字段时记得同步 `getCorpus()`。
- `src/components/AboutModal.jsx`: 聚合呈现社群共建致谢（@我的世界皓宸）、微信二维码与微信号 `Wibi2077` 复制、Wibi X 及原创认领通道。
- `src/components/sketchbook/SketchbookView.jsx`: MengTo 拟真 3D 实体手账速写本，支持 18-Strip 真实纸弧度弯曲翻页、28px 统一精致控件、纯文字下划线动效与右下角实体放大镜。
- `src/components/sketchbook/sketchbook.css`: 速写本核心物理样式。**注意：`.sb-3d` 采用视口反推尺寸公式 `calc((100vh - 260px) * 1.419)`，严禁改为定高 flex-grow，否则会导致书本垂直穿透溢出打架。**

## 数据编辑与防破坏红线

1. **单源权威**: 严禁直接在代码中 hardcode mock 数据替换 `public/skills_data.json`。数据修改后必须通过 `npm run validate:data` 自动化体检。
2. **黄金备份**: `backups/skills_data_master_gold.json` 为初始纯净黄金副本，可通过 `scripts/rollback.sh` 实现一键回滚。
3. **署名规范**:
   - 官方署名: `威比 Hunter Wei.（抖音、小红书同名）`
   - 社群命名: `威比🙂↔️AIGC学习群`
   - 资料整理贡献者: `@我的世界皓宸`
   - 官方 X 账号: `Wibi X (@wsiwsii)` (https://x.com/wsiwsii)
   - 微信联系: `Wibi2077` (备注: 进AIGC学习群)
4. **原创保护**: 所有公开条目均配套 GitHub Issue 认领机制 (`claim_author.yml`)，提供 24 小时内更正与无条件更正/下架承诺。
5. **编辑模式不是权限系统**: `VITE_ADMIN_PASSCODE` 是 `VITE_` 前缀变量，必然会打进公开 bundle，任何人都能从 JS 里读到。它只防手滑。所有编辑只写当前浏览器的 localStorage，不影响其他访客。不要在文档或 UI 里把它描述成安全边界。
6. **不要加 `?t=Date.now()` 这类缓存击穿参数**: `skills_data.json` gzip 后 638KB，加时间戳会让浏览器和 CDN 缓存全部失效、每次访问重下。数据更新靠 Cloudflare Pages 的 ETag 自动校验。
7. **暗色模式是一等公民**: 新增组件必须成对写 `dark:` 变体。EditModal / AdminUploadModal / Toast 曾经整个漏掉，在暗色下是纯白板。
