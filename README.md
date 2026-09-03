<div align="center">

# 🎨 Prompt & Skill 风格大赏
### Skills Gallery · 工业级视觉生图提示词与开源智能体技能灵感字典

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![收录总计](https://img.shields.io/badge/%E6%94%B6%E5%BD%95%E6%80%BB%E9%87%8F-1%2C000%2B%20%E6%9D%A1-indigo.svg)](public/skills_data.json)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Vite 6](https://img.shields.io/badge/Vite-6.1-646cff.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-orange.svg)](https://skills-gallery-bs1.pages.dev)

**[👉 立即访问在线版 (Live Demo)](https://skills-gallery-bs1.pages.dev)** · **[📖 提交新风格/技能 (投稿指引)](CONTRIBUTING.md)** · **[💬 讨论与建议](../../issues)**

<br/>

</div>

---

## 🌟 核心特色 (Highlights)

- 🎨 **1,000+ 工业级视觉生图 Prompt**
  精选收录国风水墨、纸艺拼贴、极简解构、水彩插画、动漫波普、AI 视频等 **12 大主流灵感分类**。每一款均经过实测出图，支持**一键复制完整生图提示词与动态运镜词**。
- ⚡ **开箱即用 Agent Skills 技能库**
  深度适配 Claude Code、Cursor、OpenAI Codex、Google Antigravity 等现代化 AI 编程与创意工作流。收录上百款优质生态 Skill，提供**一键安装指令与详细应用场景说明**。
- 📖 **MengTo 风格 3D 实体手账速写本模式 (Sketchbook 3D)**
  跳脱千篇一律的网格布局，极致还原**实体艺术设计手账**——拟真双页缝线、冷压纸水彩边缘晕染、中文字朱砂印章、弹簧拟真物理翻页算法，以及支持微距画质检视的 **3D 实体放大镜 (Loupe)**。
- 🌓 **双重极简质感设计**
  精心调配的**浅色自然纸张质感**与**赛博深黑微柔光模式**，无缝跟随系统偏好或一键自由切换。
- 🚀 **100% 纯静态架构，0 成本全球秒开**
  完全基于前端纯静态数据驱动（Vite + React 19），无需配置复杂后端数据库，全球 CDN 秒级加载，支持**一键免运维部署至 Cloudflare Pages、Vercel 或 GitHub Pages**。
- 🔍 **毫秒级模糊检索与智能筛选**
  全新自适应微型胶囊（Micro-Pills），彻底告别丑陋的横向拖动条；支持标题、描述、标签、创作者多维度实时检索与收藏夹持久化。

---

## 🛠️ 本地开发与快速上手

只需要标准 Node.js 环境（推荐 Node >= 18）：

```bash
# 1. 克隆本项目
git clone https://github.com/Vieeeeeee/skills-gallery.git
cd skills-gallery

# 2. 安装项目依赖
npm install

# 3. 启动本地开发服务 (极速热重载)
npm run dev
```

在浏览器中打开 `http://localhost:5173` 即可立即预览。

### 常用命令脚本

| 命令 | 说明 |
| :--- | :--- |
| `npm run dev` | 启动本地 Vite 开发服务器 |
| `npm run build` | 编译构建生产环境静态站点包 (输出至 `dist/`) |
| `npm run preview` | 本地预览构建后的生产静态包 |
| `npm run validate:data` | 自动化校验 `skills_data.json` 数据完整性、ID 唯一性与格式规范 |

---

## 🚀 0 成本一键部署 (Deploy to Cloud)

本项目为标准无状态静态前端项目，您可以自由分发与部署：

### 部署到 Cloudflare Pages (推荐)
1. Fork 本仓库到您的 GitHub；
2. 打开 Cloudflare Dashboard -> **Workers & Pages** -> **Create application** -> **Pages**；
3. 连接 GitHub 仓库并选择该项目；
4. 构建配置设置：
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. 点击 **Save and Deploy**，即可获得永久免费全球 CDN 域名！

### 部署到 Vercel
直接导入 GitHub 仓库，Vercel 会自动检测 Vite 项目并一键完成静态托管。

---

## 🤝 社区与群友共建 (Community & Contributing)

### 💖 特别鸣谢：威比🙂↔️AIGC学习群
本项目精选收录的众多优秀视觉风格中，大量极具实战价值的 Prompt、垫图调优配方与出图样张，凝聚了 **「威比🙂↔️AIGC学习群」** 诸位创作者群友的无私分享与灵感共创！向每一位参与探讨、实测与素材贡献的群友致以最诚挚的感谢！

无论是发现了一款惊艳的画风 Prompt、自研了一个好用的 Agent 技能，还是修复了一个样式细节，我们都热烈欢迎您的贡献：

- **零代码创作者**：直接在 GitHub 的 **[Issues 投稿表单](../../issues)** 填写风格名与提示词即可；
- **极客与开发者**：欢迎提交 Pull Request（提交前请运行 `npm run validate:data` 确保数据校验通过）。

详细指引请阅读我们的 👉 **[《贡献者指南 (CONTRIBUTING.md)》](CONTRIBUTING.md)**。

---

## 🏷️ 原创保护与创作者认领机制 (Author Claim Policy)

我们坚决捍卫并尊重每一位创作者的劳动成果与署名权：

1. **溯源与社区收录说明**：
   本项目致力于汇聚并传播前沿的 AI 视觉美学。库中部分早期条目来源于开源社区讨论、网络整理与技术交流，部分未查明原始首发作者的条目暂时标记为了*“开源社区 / 网络整理”*；
2. **一键原创认领流程**：
   如果您是某款视觉风格 Prompt、参数配方或 Agent Skill 的原创作者，请随时前往我们的 👉 **[创作者认领通道](../../issues/new?template=claim_author.yml)** 提交首发证明（如带有时间戳的推文、小红书、公众号或博客发布截图）。审核通过后，我们将在 24 小时内为您回填官方署名，并在大赏卡片及致谢墙中直接展示您的个人主页！
3. **下架与更正承诺 (Takedown Guarantee)**：
   若您是原创作者且不希望相关条目被公开索引，请随时通过 Issue 联系我们，我们承诺在核验后 **24 小时内无条件完成条目下架或修改**。

---

## 🎨 致敬与设计灵感 (Design Credits & Inspirations)

本项目 **MengTo 风格 3D 实体速写本模式 (Sketchbook 3D)** 的核心交互灵感、水彩纸张自然质感与拟真物理翻页算法，深受著名设计师 **[MengTo](https://twitter.com/MengTo)** 先生的设计手账概念（Interactive Sketchbook）启发。

在此向 MengTo 先生在数字界面艺术、触感物理动效与设计教育领域的卓越探索致以崇高敬意！✨

---

## 📫 创作者与交流联系 (Contact & Connect)

欢迎技术交流、Prompt 商业定制合作、申请加入微信交流群或创作者认领沟通：

- 💬 **微信 (WeChat)**：`Wibi2077` *(添加请备注：**进AIGC学习群**，拉您加入「威比🙂↔️AIGC学习群」共同交流探讨！)*
- 📮 **联系邮箱 (Email)**：[wuwei5986@gmail.com](mailto:wuwei5986@gmail.com)
- 📱 **社交主页**：
  - **小红书 / 抖音**：同名 `@威比 Hunter Wei.`
  - **GitHub**：[@Vieeeeeee](https://github.com/Vieeeeeee)
  - **X (Twitter)**：[@Vieeeeeee](https://twitter.com/Vieeeeeee)

---

## 📄 开源许可证与免责声明 (License & Disclaimer)

- **代码授权**：本项目核心源代码遵循 **[MIT License](LICENSE)** 开源协议，您可以自由地学习、自部署或衍生；
- **免责声明**：本项目收录的生图提示词与工具链旨在为 AI 爱好者、设计师与开发者提供学习与灵感参考，不构成任何商业投资或法律保证。

---

<div align="center">

**Curated with ❤️ by [Hunter Wei (威比)](https://github.com/Vieeeeeee) & Open Source Community**

如果这个项目对您有所启发或帮助，欢迎点击右上角点亮一颗 ⭐️ **Star** 支持我们！

</div>
