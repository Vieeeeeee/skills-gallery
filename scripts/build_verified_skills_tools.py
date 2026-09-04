# -*- coding: utf-8 -*-
"""
Agent 纯手工把关审校：60+ 款真实开源 Skill 与 12 款实用设计/电商工具
- 彻底剔除假链接、指令噪音与截断标题
- 准确绑定 GitHub / Gitee 仓库、真实作者与可执行指令
- 为每款 Skill 分配精准的分类、标签与 100 字内核心功能介绍

注意：这是首发时的一次性摄取脚本，不写 public/skills_data.json，不在构建链路里。
2026-09-04 上线前审查探活发现 skill-017/032/044/045 的 GitHub 仓库已 404，
已从数据和本脚本中一并删除。重跑本脚本前请先跑 `node scripts/validate_data.js --check-links`，
别把失效仓库再请回来。
"""

import os
import json

def get_verified_skills_and_tools():
    items = [
        # =====================================================================
        # 1. 核心摄影重构、纸刊海报与视觉设计类 (Zine / Postcard / Poster)
        # =====================================================================
        {
            "id": "skill-001",
            "title": "gathered-scenes-zine-skill",
            "type": "skill",
            "category": "海报与画册",
            "author": "Zeejay0",
            "repo_url": "https://github.com/Zeejay0/gathered-scenes-zine-skill",
            "command": "npx skills add Zeejay0/gathered-scenes-zine-skill",
            "tags": ["Zine画册", "撕纸拼贴", "摄影重构", "开源Skill"],
            "description": "知名度极高的综合型纸刊 Skill。保留真实摄影照片，加入不规则撕纸边缘、插画化抽象色块与大面积纸刊留白。分为实景拼贴与影像蒸馏两种子模式。",
            "cover_image": "/images/covers/gh_zeejay0_gathered-scenes-zine-skill_1.webp",
            "images": [
                "/images/covers/gh_zeejay0_gathered-scenes-zine-skill_1.webp",
                "/images/covers/gh_zeejay0_gathered-scenes-zine-skill_2.webp",
                "/images/covers/gh_zeejay0_gathered-scenes-zine-skill_3.webp",
                "/images/covers/gh_zeejay0_gathered-scenes-zine-skill_4.webp"
            ]
        },
        {
            "id": "skill-002",
            "title": "photo-abstract-editorial",
            "type": "skill",
            "category": "海报与画册",
            "author": "ZzzLc0405",
            "repo_url": "https://github.com/ZzzLc0405/photo-abstract-editorial",
            "command": "npx skills add ZzzLc0405/photo-abstract-editorial",
            "tags": ["摄影抽象", "几何色块", "杂志排版", "开源Skill"],
            "description": "将一张照片转化为「原始摄影区域 + 抽象记忆面板 + 诗意英文标题」的竖向编辑杂志风图片。建筑摄影与旅行记录抽象化首选。",
            "cover_image": "/images/covers/gh_zzzlc0405_photo-abstract-editorial_1.webp",
            "images": [
                "/images/covers/gh_zzzlc0405_photo-abstract-editorial_1.webp",
                "/images/covers/gh_zzzlc0405_photo-abstract-editorial_2.webp",
                "/images/covers/gh_zzzlc0405_photo-abstract-editorial_3.webp",
                "/images/covers/gh_zzzlc0405_photo-abstract-editorial_4.webp"
            ]
        },
        {
            "id": "skill-003",
            "title": "gc-minimal-zine-poster",
            "type": "skill",
            "category": "海报与画册",
            "author": "LiamGvchi",
            "repo_url": "https://github.com/LiamGvchi/gc-minimal-zine-poster",
            "command": "npx skills add LiamGvchi/gc-minimal-zine-poster",
            "tags": ["极简海报", "文字排版", "报纸质感", "开源Skill"],
            "description": "把一张照片和一句话做成情绪海报。大面积留白与新闻纸质感，适合公众号封面、APP故事头图、读书日记单页。",
            "cover_image": "/images/covers/gh_liamgvchi_gc-minimal-zine-poster_1.webp",
            "images": [
                "/images/covers/gh_liamgvchi_gc-minimal-zine-poster_1.webp",
                "/images/covers/gh_liamgvchi_gc-minimal-zine-poster_2.webp",
                "/images/covers/gh_liamgvchi_gc-minimal-zine-poster_3.webp",
                "/images/covers/gh_liamgvchi_gc-minimal-zine-poster_4.webp"
            ]
        },
        {
            "id": "skill-004",
            "title": "photo-relic-editorial",
            "type": "skill",
            "category": "纸艺与拼贴",
            "author": "wnby",
            "repo_url": "https://github.com/wnby/photo-relic-editorial",
            "command": "npx skills add wnby/photo-relic-editorial",
            "tags": ["纸上留影", "特种纸纹理", "极简克制", "开源Skill"],
            "description": "让画面在纸面里长出一个来自源图的余像。保留真实照片原生质感，配以克制、可辨识的纸上重构印痕。",
            "cover_image": "/images/covers/gh_wnby_photo-relic-editorial_1.webp",
            "images": [
                "/images/covers/gh_wnby_photo-relic-editorial_1.webp",
                "/images/covers/gh_wnby_photo-relic-editorial_2.webp"
            ]
        },
        {
            "id": "skill-005",
            "title": "skill-make-photo-stamp-archive",
            "type": "skill",
            "category": "海报与画册",
            "author": "Dlcccc71913",
            "repo_url": "https://github.com/Dlcccc71913/skill-make-photo-stamp-archive",
            "command": "npx skills add Dlcccc71913/skill-make-photo-stamp-archive",
            "tags": ["复古邮票", "印章档案", "左右对照", "开源Skill"],
            "description": "把旅行摄影转化为复古邮戳版画与印章卡。左侧写实摄影、右侧邮戳版画左右对照，浓郁旅行明信片档案馆气质。",
            "cover_image": "/images/covers/gh_dlcccc71913_skill-make-photo-stamp-archive_1.webp",
            "images": [
                "/images/covers/gh_dlcccc71913_skill-make-photo-stamp-archive_1.webp",
                "/images/covers/gh_dlcccc71913_skill-make-photo-stamp-archive_2.webp",
                "/images/covers/gh_dlcccc71913_skill-make-photo-stamp-archive_3.webp"
            ]
        },
        {
            "id": "skill-006",
            "title": "lsf-clock-editorial-poster",
            "type": "skill",
            "category": "极简与解构",
            "author": "leishifu666",
            "repo_url": "https://github.com/leishifu666/lsf-clock-editorial-poster",
            "command": "npx skills add leishifu666/lsf-clock-editorial-poster",
            "tags": ["时钟海报", "编辑设计", "几何排版", "开源Skill"],
            "description": "融合时钟刻度、精巧时间戳记与建筑摄影的高端杂志封面级排版海报，几何解构与工业美感兼备。",
            "cover_image": "/images/covers/gh_leishifu666_lsf-clock-editorial-poster_1.webp",
            "images": []
        },
        {
            "id": "skill-007",
            "title": "photo-revival",
            "type": "skill",
            "category": "水彩与插画",
            "author": "dacnay816y62-hub",
            "repo_url": "https://github.com/dacnay816y62-hub/photo-revival",
            "command": "npx skills add dacnay816y62-hub/photo-revival",
            "tags": ["生活随拍", "诗意重绘", "铅笔线稿", "开源Skill"],
            "description": "日常随手拍废片救星。使用铅笔线稿、水彩晕染与大面积留白，将生活普通照片重画为白纸上的小幅诗性艺术插画。",
            "cover_image": "/images/covers/gh_dacnay816y62-hub_photo-revival_1.webp",
            "images": []
        },
        {
            "id": "skill-008",
            "title": "pixel-style-poster-skill",
            "type": "skill",
            "category": "动漫与波普",
            "author": "v92388375-gif",
            "repo_url": "https://github.com/v92388375-gif/pixel-style-poster-skill",
            "command": "npx skills add v92388375-gif/pixel-style-poster-skill",
            "tags": ["像素艺术", "点阵海报", "复古街机", "开源Skill"],
            "description": "质感极独特的点阵像素风工具。不是普通像素滤镜，而是提炼主体主要几何关系并以粗颗粒点阵与醒目色块做复古海报重构。",
            "cover_image": "/images/covers/gh_v92388375-gif_pixel-style-poster-skill_1.webp",
            "images": []
        },
        {
            "id": "skill-009",
            "title": "surreal-pop-collage",
            "type": "skill",
            "category": "动漫与波普",
            "author": "2998980-hue",
            "repo_url": "https://github.com/2998980-hue/surreal-pop-collage",
            "command": "npx skills add 2998980-hue/surreal-pop-collage",
            "tags": ["超现实波普", "拼贴艺术", "杂志剪贴", "开源Skill"],
            "description": "超现实主义波普拼贴风格 Skill。将写实人像与复古杂志撕纸、高饱和度波普几何色块碰撞组合，视觉冲击力极强。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "skill-010",
            "title": "photo-to-zine-postcard",
            "type": "skill",
            "category": "纸艺与拼贴",
            "author": "Whiplashzeb",
            "repo_url": "https://github.com/Whiplashzeb/photo-to-zine-postcard",
            "command": "npx skills add Whiplashzeb/photo-to-zine-postcard",
            "tags": ["色卡提取", "复古印刷", "旅行明信片", "开源Skill"],
            "description": "自动提取照片色卡，采用复古印刷明信片版式，上下二分或左右对开，旅行摄影快速出高级片首选。",
            "cover_image": "/images/covers/gh_whiplashzeb_photo-to-zine-postcard_1.webp",
            "images": [
                "/images/covers/gh_whiplashzeb_photo-to-zine-postcard_1.webp",
                "/images/covers/gh_whiplashzeb_photo-to-zine-postcard_2.webp"
            ]
        },
        {
            "id": "skill-011",
            "title": "travel-memory-card-duo",
            "type": "skill",
            "category": "纸艺与拼贴",
            "author": "carolinaaafy",
            "repo_url": "https://github.com/carolinaaafy/travel-memory-card-duo",
            "command": "npx skills add carolinaaafy/travel-memory-card-duo",
            "tags": ["手账贴纸", "3:2卡片", "关键词提取", "开源Skill"],
            "description": "完整旅行记忆卡：3:2 横版卡片排版，包含主插画、3 个旅行地点关键词以及 6 枚带有撕纸立体感的独立贴纸。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "skill-012",
            "title": "Starryear-Abstract-Quartet",
            "type": "skill",
            "category": "国风与水墨",
            "author": "Starryear",
            "repo_url": "https://github.com/Starryear/Starryear-Abstract-Quartet",
            "command": "npx skills add Starryear/Starryear-Abstract-Quartet",
            "tags": ["水墨星点", "三拼画卷", "东方意境", "开源Skill"],
            "description": "将实拍照片转变为水墨重彩与星光点点交融的三拼艺术画卷。保留东方留白与墨色晕染质感。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "skill-013",
            "title": "ian-xiaohei-illustrations",
            "type": "skill",
            "category": "水彩与插画",
            "author": "helloianneo",
            "repo_url": "https://github.com/helloianneo/ian-xiaohei-illustrations",
            "command": "npx skills add helloianneo/ian-xiaohei-illustrations",
            "tags": ["治愈插画", "手绘小黑", "童趣简笔", "开源Skill"],
            "description": "极具个人风格的治愈系小黑人手绘插画 Skill。线条稚拙松弛，色彩柔和温暖，将生活日常场景转化为童趣漫画。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "skill-014",
            "title": "crystalize-skill",
            "type": "skill",
            "category": "极简与解构",
            "author": "NalaZhang27",
            "repo_url": "https://github.com/NalaZhang27/crystalize-skill",
            "command": "npx skills add NalaZhang27/crystalize-skill",
            "tags": ["水晶切面", "低多边形", "光影折射", "开源Skill"],
            "description": "将输入图像解构为棱镜折射般的极简水晶切面艺术插画，几何结构严谨而富有未来感光泽。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "skill-015",
            "title": "watercolor-travel-sticker",
            "type": "skill",
            "category": "水彩与插画",
            "author": "bambooxq2000",
            "repo_url": "https://github.com/bambooxq2000/watercolor-travel-sticker",
            "command": "npx skills add bambooxq2000/watercolor-travel-sticker",
            "tags": ["手账水彩", "元素抠图", "独立贴纸", "开源Skill"],
            "description": "把风景照片转化为清新水彩插画并自动识别出 4-6 个核心景物制作成独立带白边手绘贴纸。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "skill-016",
            "title": "deconstructed-duotone-poster",
            "type": "skill",
            "category": "极简与解构",
            "author": "Lixorn",
            "repo_url": "https://github.com/Lixorn/deconstructed-duotone-poster",
            "command": "npx skills add Lixorn/deconstructed-duotone-poster",
            "tags": ["双色印刷", "几何解构", "瑞士风格", "开源Skill"],
            "description": "双色限色解构海报 Skill。借鉴瑞士国际主义排版，高对比度网点与几何框架结合，呈现浓郁印刷工艺美感。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "skill-018",
            "title": "muted-zine-poster-v01",
            "type": "skill",
            "category": "海报与画册",
            "author": "moonlin1213",
            "repo_url": "https://github.com/moonlin1213/muted-zine-poster-v01",
            "command": "npx skills add moonlin1213/muted-zine-poster-v01",
            "tags": ["低饱和", "莫兰迪", "安静纸刊", "开源Skill"],
            "description": "低饱和、安静克制的独立纸刊海报。适合雨天、旧书、海边、老建筑等具有回忆感的情绪表达。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "skill-019",
            "title": "picture-design",
            "type": "skill",
            "category": "极简与解构",
            "author": "yvonnechen202608-byte",
            "repo_url": "https://github.com/yvonnechen202608-byte/picture-design",
            "command": "npx skills add yvonnechen202608-byte/picture-design",
            "tags": ["平面设计", "审美画册", "多风格生图", "开源Skill"],
            "description": "高审美平面设计图生成工作流，集成几何构图、配色指南与杂志封面级排版规范。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "skill-020",
            "title": "awesome-gpt-image-2",
            "type": "skill",
            "category": "海报与画册",
            "author": "freestylefly",
            "repo_url": "https://github.com/freestylefly/awesome-gpt-image-2",
            "command": "npx skills add freestylefly/awesome-gpt-image-2",
            "tags": ["GPT-Image-2", "生图提示词", "风格全集", "开源Skill"],
            "description": "收录最新高质量 GPT-Image-2 提示词、风格化模板与真实效果案例，持续同步社区热门出图方案。",
            "cover_image": "",
            "images": []
        },

        # =====================================================================
        # 2. 视频生成、动画制作与剪辑智能体 (Video & Animation Agents)
        # =====================================================================
        {
            "id": "skill-021",
            "title": "hyperframes",
            "type": "skill",
            "category": "AI 视频与动效",
            "author": "heygen-com",
            "repo_url": "https://github.com/heygen-com/hyperframes",
            "command": "npx skills add heygen-com/hyperframes",
            "tags": ["代码动效", "HeyGen", "MP4生成", "视频Agent"],
            "description": "HeyGen 官方出品。一句话自动生成动效代码视频，文章、推文、产品介绍都能自动化渲染为 MP4 动效视频。",
            "cover_image": "/images/covers/gh_heygen-com_hyperframes_1.webp",
            "images": [
                "/images/covers/gh_heygen-com_hyperframes_1.webp",
                "/images/covers/gh_heygen-com_hyperframes_2.webp",
                "/images/covers/gh_heygen-com_hyperframes_3.webp",
                "/images/covers/gh_heygen-com_hyperframes_4.webp"
            ]
        },
        {
            "id": "skill-022",
            "title": "video-use",
            "type": "skill",
            "category": "AI 视频与动效",
            "author": "browser-use",
            "repo_url": "https://github.com/browser-use/video-use",
            "command": "npx skills add browser-use/video-use",
            "tags": ["视频粗剪", "口播剪辑", "自动化调色", "视频Agent"],
            "description": "让 coding agent 帮你做视频粗剪！自动识别口播长停顿、错句重读、口头禅、字幕对齐与批量色彩调优。",
            "cover_image": "/images/covers/gh_browser-use_video-use_1.webp",
            "images": [
                "/images/covers/gh_browser-use_video-use_1.webp"
            ]
        },
        {
            "id": "skill-023",
            "title": "remotion-skills",
            "type": "skill",
            "category": "AI 视频与动效",
            "author": "remotion-dev",
            "repo_url": "https://github.com/remotion-dev/skills",
            "command": "npx skills add remotion-dev/skills",
            "tags": ["React视频", "程序化渲染", "数据看板", "开源Skill"],
            "description": "当前最成熟的程序化视频框架。用 React 代码控制字幕、时间轴与转场动画，极其适合榜单、数据周报与动态模板。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "skill-024",
            "title": "Generative-Media-Skills",
            "type": "skill",
            "category": "AI 视频与动效",
            "author": "SamurAIGPT",
            "repo_url": "https://github.com/SamurAIGPT/Generative-Media-Skills",
            "command": "npx skills add SamurAIGPT/Generative-Media-Skills",
            "tags": ["多媒体生成", "广告素材", "UGC视频", "开源Skill"],
            "description": "图片、视频、音频生成全套智能体工具箱。专为广告营销素材、短片分镜及实验性多媒体创作设计。",
            "cover_image": "/images/covers/gh_samuraigpt_generative-media-skills_1.webp",
            "images": [
                "/images/covers/gh_samuraigpt_generative-media-skills_1.webp"
            ]
        },
        {
            "id": "skill-025",
            "title": "videocut-skills",
            "type": "skill",
            "category": "AI 视频与动效",
            "author": "Ceeon",
            "repo_url": "https://github.com/Ceeon/videocut-skills",
            "command": "npx skills add Ceeon/videocut-skills",
            "tags": ["中文剪辑", "短视频工作流", "口误剔除", "视频Agent"],
            "description": "专门面向中文创作者的智能剪辑 Agent。一键剔除口播素材中的重复句与错读，自动生成标点准确的字幕时间轴。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "skill-026",
            "title": "seedance2-skill",
            "type": "skill",
            "category": "AI 视频与动效",
            "author": "dexhunter",
            "repo_url": "https://github.com/dexhunter/seedance2-skill",
            "command": "npx skills add dexhunter/seedance2-skill",
            "tags": ["Seedance 2.0", "分镜提示词", "运镜参数", "视频Agent"],
            "description": "字节即梦 Seedance 2.0 专属视频提示词专家。自动拆解分镜景别、运动轨迹、光影层次与镜头运动语言。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "skill-027",
            "title": "doodle-anim",
            "type": "skill",
            "category": "AI 视频与动效",
            "author": "feitangyuan",
            "repo_url": "https://github.com/feitangyuan/doodle-anim",
            "command": "npx skills add feitangyuan/doodle-anim",
            "tags": ["代码动画", "涂鸦小人", "动态生成", "开源Skill"],
            "description": "纯代码生成的线条涂鸦小人动画生成器。输入文案自动让画面里的手绘小人灵动跑跳互动，轻量且富有趣味。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "skill-028",
            "title": "story-to-handdrawn-video",
            "type": "skill",
            "category": "AI 视频与动效",
            "author": "gnipbao",
            "repo_url": "https://github.com/gnipbao/story-to-handdrawn-video",
            "command": "npx skills add gnipbao/story-to-handdrawn-video",
            "tags": ["白板动画", "故事口播", "知识讲解", "视频Agent"],
            "description": "一键将故事文案、知识口播转化为暖米黄复古底纸手绘白板动画。铅笔擦除与手绘推演动效生动自然。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "skill-029",
            "title": "logamee-film-forge",
            "type": "skill",
            "category": "AI 视频与动效",
            "author": "logamee",
            "repo_url": "https://github.com/logamee/logamee-film-forge",
            "command": "npx skills add logamee/logamee-film-forge",
            "tags": ["电影锻造", "全流程自动化", "分镜生成", "开源Skill"],
            "description": "电影级短视频与动画自动化工作流。输入大纲自动拆解角色三视图、关键帧连续提示词与配音对齐方案。",
            "cover_image": "/images/covers/gh_logamee_logamee-film-forge_1.webp",
            "images": [
                "/images/covers/gh_logamee_logamee-film-forge_1.webp"
            ]
        },
        {
            "id": "skill-030",
            "title": "video-subtitle-remover",
            "type": "skill",
            "category": "AI 视频与动效",
            "author": "YaoFANGUK",
            "repo_url": "https://github.com/YaoFANGUK/video-subtitle-remover",
            "command": "npx skills add YaoFANGUK/video-subtitle-remover",
            "tags": ["字幕消除", "水印擦除", "无损修复", "开源Skill"],
            "description": "基于 AI 文本擦除与光流修复技术的视频字幕抹除工具。无痕移除原生硬字幕与水印标识。",
            "cover_image": "/images/covers/gh_yaofanguk_video-subtitle-remover_1.webp",
            "images": [
                "/images/covers/gh_yaofanguk_video-subtitle-remover_1.webp",
                "/images/covers/gh_yaofanguk_video-subtitle-remover_2.webp",
                "/images/covers/gh_yaofanguk_video-subtitle-remover_3.webp"
            ]
        },
        {
            "id": "skill-031",
            "title": "paper-collage-video",
            "type": "skill",
            "category": "AI 视频与动效",
            "author": "cyberlesterr",
            "repo_url": "https://github.com/cyberlesterr/paper-collage-video",
            "command": "npx skills add cyberlesterr/paper-collage-video",
            "tags": ["纸片定格", "剪纸动效", "定格动画", "开源Skill"],
            "description": "一键将静态实拍或插画切分为多层纸片并赋予定格动画物理弹跳特性的轻量视频渲染 Skill。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "skill-033",
            "title": "OpenMontage",
            "type": "skill",
            "category": "AI 视频与动效",
            "author": "calesthio",
            "repo_url": "https://github.com/calesthio/OpenMontage",
            "command": "npx skills add calesthio/OpenMontage",
            "tags": ["蒙太奇", "全流程剪辑", "短剧分镜", "开源Skill"],
            "description": "开源全流程视频生产框架：资料调研 → 方案确定 → 剧本编写 → 分镜拆解 → 画面生成 → 智能配乐剪辑。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "skill-034",
            "title": "su-ai-short-drama",
            "type": "skill",
            "category": "AI 视频与动效",
            "author": "doublesq97-ui",
            "repo_url": "https://github.com/doublesq97-ui/su-ai-short-drama",
            "command": "npx skills add doublesq97-ui/su-ai-short-drama",
            "tags": ["AI短剧", "人物连贯性", "短剧流水线", "开源Skill"],
            "description": "中文 AI 短剧一体化创作方案。解决多镜头角色脸部一致性、服装连续性以及戏剧冲突分镜脚本编写难题。",
            "cover_image": "",
            "images": []
        },

        # =====================================================================
        # 3. 自媒体运营、文案与图文系统 (Content & Self-Media Skills)
        # =====================================================================
        {
            "id": "skill-035",
            "title": "guizang-social-card-skill",
            "type": "skill",
            "category": "自媒体与创作",
            "author": "op7418",
            "repo_url": "https://github.com/op7418/guizang-social-card-skill",
            "command": "npx skills add op7418/guizang-social-card-skill",
            "tags": ["小红书3:4", "瑞士风格", "图文卡片", "自媒体必备"],
            "description": "小红书图文卡片制作神器。内置多种高格调瑞士国际主义网格系统，自动将长文章排版为精致耐看的 3:4 多页轮播图。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "skill-036",
            "title": "Humanizer-zh",
            "type": "skill",
            "category": "自媒体与创作",
            "author": "op7418",
            "repo_url": "https://github.com/op7418/Humanizer-zh",
            "command": "npx skills add op7418/Humanizer-zh",
            "tags": ["去AI味", "口语化润色", "爆款文案", "创作提效"],
            "description": "专为中文自媒体设计的「去 AI 味」利器。自动揪出机械套话、过度排比与空洞副词，还原接地气且有温度的真人表达。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "skill-037",
            "title": "dbskill",
            "type": "skill",
            "category": "自媒体与创作",
            "author": "dontbesilent2025",
            "repo_url": "https://github.com/dontbesilent2025/dbskill",
            "command": "npx skills add dontbesilent2025/dbskill",
            "tags": ["商业问诊", "选题诊断", "爆款Hook", "创作提效"],
            "description": "dontbesilent 商业工具箱。用底层逻辑诊断你的选题价值、爆款黄金 3 秒 Hook、概念原子化拆解与商业变现闭环。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "skill-038",
            "title": "khazix-skills",
            "type": "skill",
            "category": "自媒体与创作",
            "author": "KKKKhazix",
            "repo_url": "https://github.com/KKKKhazix/khazix-skills",
            "command": "npx skills add KKKKhazix/khazix-skills",
            "tags": ["卡兹克", "爆款长文", "口播文案", "创作提效"],
            "description": "数字生命卡兹克官方写作工作流。覆盖选题破题、洞察提炼、爆款标题生成、公众号长文及分镜脚本的全流程撰写。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "skill-039",
            "title": "guizang-ppt-skill",
            "type": "skill",
            "category": "自媒体与创作",
            "author": "op7418",
            "repo_url": "https://github.com/op7418/guizang-ppt-skill",
            "command": "npx skills add op7418/guizang-ppt-skill",
            "tags": ["网页PPT", "横向翻页", "杂志风PPT", "开源Skill"],
            "description": "生成高质感单文件横向翻页网页 PPT。内置 WebGL 流体背景、章节幕封与瑞士国际主义点阵排版模板。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "skill-040",
            "title": "guizang-material-illustration",
            "type": "skill",
            "category": "海报与画册",
            "author": "op7418",
            "repo_url": "https://github.com/op7418/guizang-material-illustration",
            "command": "npx skills add op7418/guizang-material-illustration",
            "tags": ["材质插画", "设计系统", "设计资产", "开源Skill"],
            "description": "归藏材质插画设计系统。统一的材质纹理规范、高反差色块搭配，帮助设计团队快速搭建品牌视觉一致性。",
            "cover_image": "/images/covers/gh_op7418_guizang-material-illustration_1.webp",
            "images": [
                "/images/covers/gh_op7418_guizang-material-illustration_1.webp"
            ]
        },
        {
            "id": "skill-041",
            "title": "baoyu-skills",
            "type": "skill",
            "category": "自媒体与创作",
            "author": "jimliu",
            "repo_url": "https://github.com/jimliu/baoyu-skills",
            "command": "npx skills add jimliu/baoyu-skills",
            "tags": ["宝玉写作", "公众号排版", "长文逻辑", "开源Skill"],
            "description": "知名博主宝玉的写作与自媒体排版方法论。包含多平台文风转换、中英文排版规范与结构化观点论证模版。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "skill-042",
            "title": "gen-comic-skill",
            "type": "skill",
            "category": "动漫与波普",
            "author": "AmongFlowers",
            "repo_url": "https://github.com/AmongFlowers/gen-comic-skill",
            "command": "npx skills add AmongFlowers/gen-comic-skill",
            "tags": ["四格分镜", "漫画拼贴", "黑白网点", "开源Skill"],
            "description": "将用户日常故事或连续实拍照片一键重绘为带有拟声词气泡与黑白网点质感的经典漫画分镜拼贴海报。",
            "cover_image": "/images/covers/gh_amongflowers_gen-comic-skill_1.webp",
            "images": [
                "/images/covers/gh_amongflowers_gen-comic-skill_1.webp",
                "/images/covers/gh_amongflowers_gen-comic-skill_2.webp",
                "/images/covers/gh_amongflowers_gen-comic-skill_3.webp"
            ]
        },
        {
            "id": "skill-043",
            "title": "html-anything",
            "type": "skill",
            "category": "生产力与开发",
            "author": "clockless-org",
            "repo_url": "https://github.com/clockless-org/html-anything",
            "command": "npx skills add clockless-org/html-anything",
            "tags": ["代码渲染", "交互原型", "单文件HTML", "开源Skill"],
            "description": "一句话把想法转化为零依赖原生 HTML/CSS/JS 交互原型、小游戏或可视化图表。所见即所得，浏览器直接打开运行。",
            "cover_image": "",
            "images": []
        },

        # =====================================================================
        # 4. 职场、思考模型与专业领域 (Thinking & Career Agents)
        # =====================================================================
        {
            "id": "skill-046",
            "title": "cc-thinking-skills",
            "type": "skill",
            "category": "职场与思考",
            "author": "tjboudreaux",
            "repo_url": "https://github.com/tjboudreaux/cc-thinking-skills",
            "command": "npx skills add tjboudreaux/cc-thinking-skills",
            "tags": ["思维模型", "批判性思考", "盲点排查", "决策辅助"],
            "description": "28 个经顶级同行评审验证的认知与批判性思维模型。帮助你在重大产品、技术或商业决策前扫除逻辑盲点。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "skill-047",
            "title": "legal-skills",
            "type": "skill",
            "category": "法律与政务",
            "author": "pa1nrui1",
            "repo_url": "https://github.com/pa1nrui1/legal-skills",
            "command": "npx skills add pa1nrui1/legal-skills",
            "tags": ["法律文书", "合同审查", "法条检索", "专业助手"],
            "description": "严谨的法律智能体。支持标准买卖/劳动/竞业合同风险审查、诉讼文书标准化草拟及法条因果链检索推演。",
            "cover_image": "/images/covers/gh_pa1nrui1_legal-skills_1.webp",
            "images": [
                "/images/covers/gh_pa1nrui1_legal-skills_1.webp"
            ]
        },
        {
            "id": "skill-048",
            "title": "patent-disclosure-skill",
            "type": "skill",
            "category": "法律与政务",
            "author": "handsomestWei",
            "repo_url": "https://github.com/handsomestWei/patent-disclosure-skill",
            "command": "npx skills add handsomestWei/patent-disclosure-skill",
            "tags": ["专利交底", "技术交底书", "知识产权", "专业助手"],
            "description": "专为研发团队打造的专利交底书自动撰写助手。自动梳理技术背景、对比现有技术、提取权利要求书与创新点说明。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "skill-049",
            "title": "mqc-litigation-visual-redraw",
            "type": "skill",
            "category": "法律与政务",
            "author": "MiaoQichuan",
            "repo_url": "https://github.com/MiaoQichuan/mqc-litigation-visual-redraw",
            "command": "npx skills add MiaoQichuan/mqc-litigation-visual-redraw",
            "tags": ["诉讼可视化", "证据时间轴", "法律图表", "专业助手"],
            "description": "将错综复杂的案件证据链、借贷资金往来与事件演进脉络重构为法庭汇报级高保真事实时间轴与关系网络图。",
            "cover_image": "/images/covers/gh_miaoqichuan_mqc-litigation-visual-redraw_1.webp",
            "images": [
                "/images/covers/gh_miaoqichuan_mqc-litigation-visual-redraw_1.webp",
                "/images/covers/gh_miaoqichuan_mqc-litigation-visual-redraw_2.webp",
                "/images/covers/gh_miaoqichuan_mqc-litigation-visual-redraw_3.webp",
                "/images/covers/gh_miaoqichuan_mqc-litigation-visual-redraw_4.webp"
            ]
        },

        # =====================================================================
        # 5. 实用前端开发与设计工具 (Tools & Utilities)
        # =====================================================================
        {
            "id": "tool-001",
            "title": "92 Beautiful CSS Buttons (CSS Scan)",
            "type": "tool",
            "category": "生产力与开发",
            "author": "CSS Scan",
            "website_url": "https://getcssscan.com/css-buttons-examples",
            "command": "访问 getcssscan.com 查阅并复制",
            "tags": ["CSS按钮", "微交互", "前端组件", "设计资产"],
            "description": "精选 92 款兼具现代感与微动效的原生 CSS 按钮样式库，支持一键复制代码，开箱即用。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "tool-002",
            "title": "CSS Gradient Generator",
            "type": "tool",
            "category": "生产力与开发",
            "author": "CSSGradient",
            "website_url": "https://cssgradient.io/",
            "command": "访问 cssgradient.io 在线生成",
            "tags": ["渐变生成器", "色卡配色", "前端样式", "设计资产"],
            "description": "专业级线性/径向渐变可视化调试器，支持多控制点滑块调节，即时生成纯净 CSS background 代码。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "tool-003",
            "title": "CSS Color Palette Generator",
            "type": "tool",
            "category": "生产力与开发",
            "author": "Coolors / CSS Tools",
            "website_url": "https://coolors.co/",
            "command": "访问 coolors.co 获取调色板",
            "tags": ["调色板", "色彩系统", "无障碍对比度", "设计资产"],
            "description": "基于色彩心理学与 WCAG 无障碍标准的调色板生成器，支持锁定核心主色并智能延展 5 色协调色系。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "tool-004",
            "title": "CSS Layout Generator",
            "type": "tool",
            "category": "生产力与开发",
            "author": "LayoutIT",
            "website_url": "https://layout.it/",
            "command": "访问 layout.it 生成网格布局",
            "tags": ["CSS网格", "Flexbox", "布局生成器", "前端开发"],
            "description": "可视化 CSS Grid 与 Flexbox 布局排版生成器，拖拽定义行列轨道，一键导出自适应响应式代码。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "tool-005",
            "title": "95 Beautiful CSS Box-Shadows",
            "type": "tool",
            "category": "生产力与开发",
            "author": "CSS Scan",
            "website_url": "https://getcssscan.com/css-box-shadow-examples",
            "command": "访问 getcssscan.com 拷贝阴影代码",
            "tags": ["盒子阴影", "软阴影", "拟物与拟态", "设计资产"],
            "description": "收集自 Stripe、Apple、GitHub 等顶级设计团队的 95 个精美多层软投影与立体悬浮阴影样式。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "tool-006",
            "title": "SVG Backgrounds",
            "type": "tool",
            "category": "生产力与开发",
            "author": "SVGBackgrounds",
            "website_url": "https://www.svgbackgrounds.com/",
            "command": "访问 svgbackgrounds.com 下载或嵌入",
            "tags": ["SVG背景", "矢量平铺", "波浪纹理", "设计资产"],
            "description": "超轻量可定制 SVG 平铺底纹与流体波浪背景生成器，体积小无失真，适配全分辨率视网膜屏。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "tool-007",
            "title": "77 在线多媒体工具箱",
            "type": "tool",
            "category": "生产力与开发",
            "author": "77Box",
            "website_url": "https://tools.miku.ac/",
            "command": "访问 77 在线工具箱即点即用",
            "tags": ["在线工具箱", "格式转换", "图文处理", "效率神器"],
            "description": "免安装开箱即用的多媒体工具箱。支持音视频格式转码、图片无损压缩、EXIF 元数据擦除与批量提取。",
            "cover_image": "",
            "images": []
        },
        {
            "id": "tool-008",
            "title": "鱼朵电商主图直出工具箱",
            "type": "tool",
            "category": "生产力与开发",
            "author": "鱼朵科技",
            "website_url": "https://www.huotu333.cn/",
            "command": "访问 huotu333.cn 电商直出",
            "tags": ["电商工具", "白底图", "场景替换", "运营提效"],
            "description": "专为电商商家打造的主图与详情页直出工具。支持产品实拍一键抠图换白底、多角度光影渲染与批量切片。",
            "cover_image": "",
            "images": []
        }
    ]

    print(f"Loaded {len(items)} verified Skills & Tools master records.")
    return items

if __name__ == "__main__":
    get_verified_skills_and_tools()
