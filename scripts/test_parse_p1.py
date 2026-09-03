import os
import sys
import json
import re
import hashlib
import zipfile
import docx

def clean_text(t):
    if not t:
        return ""
    return t.replace("\xa0", " ").replace("\u3000", " ").replace("\r", "").strip()

def extract_docx_images(docx_path, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    with zipfile.ZipFile(docx_path, "r") as z:
        for filename in z.namelist():
            if filename.startswith("word/media/"):
                base_name = os.path.basename(filename)
                target_path = os.path.join(out_dir, base_name)
                with open(target_path, "wb") as f:
                    f.write(z.read(filename))

def parse_docx(docx_path="网络热门风格➕Skill开源提示词(3).docx", out_json_path="public/skills_data.json"):
    if not os.path.exists(docx_path):
        raise FileNotFoundError(f"Missing docx file: {docx_path}")
        
    extract_docx_images(docx_path, "public/images")
    doc = docx.Document(docx_path)
    paras = [clean_text(p.text) for p in doc.paragraphs]
    
    # ---------------------------------------------------------
    # 1. PARSE PART 1: 视觉风格提示词 (Styles)
    # ---------------------------------------------------------
    p1_paras = paras[:1025]
    style_items = []
    seen_prompt_hashes = set()
    
    curr_section = "热门风格"
    curr_lines = []
    
    def flush_style():
        nonlocal curr_lines, curr_section
        if not curr_lines:
            return
        full_prompt = "\n\n".join(curr_lines).strip()
        curr_lines = []
        if len(full_prompt) < 15:
            return
        if full_prompt in ["《提示词禁止商用，抖音作者威比》", "提示词禁止商用，抖音作者威比", "网络热门风格提示词"]:
            return
            
        # Deduplicate identical prompts
        prompt_norm = re.sub(r"\s+", "", full_prompt)
        p_hash = hashlib.md5(prompt_norm.encode("utf-8")).hexdigest()
        if p_hash in seen_prompt_hashes:
            return
        seen_prompt_hashes.add(p_hash)
        
        # Categorize Style
        cat = "海报与画册"
        if any(k in full_prompt for k in ["水彩", "淡彩", "彩铅", "蜡笔", "水粉", "手绘插画"]):
            cat = "水彩与插画"
        elif any(k in full_prompt for k in ["撕纸", "纸雕", "毛毡", "拼布", "折纸", "蒙太奇", "拼贴", "纸境", "手工纸"]):
            cat = "纸艺与拼贴"
        elif any(k in full_prompt for k in ["国风", "水墨", "工笔", "宣纸", "篆刻", "景泰蓝", "青绿山水", "色卡", "古风", "国潮"]):
            cat = "国风与水墨"
        elif any(k in full_prompt for k in ["动漫", "赛璐璐", "波普", "Y2K", "吉卜力", "美漫", "漫画", "多巴胺"]):
            cat = "动漫与波普"
        elif any(k in full_prompt for k in ["极简", "几何", "包豪斯", "浮雕", "线稿", "解构", "CAD", "建筑研究"]):
            cat = "极简与解构"
        elif any(k in full_prompt for k in ["二分", "明信片", "双联", "四联", "画册", "海报", "旅行摄影"]):
            cat = "海报与画册"
            
        # Determine Aspect Ratio
        aspect = "自适应"
        if "3:4" in full_prompt or "3：4" in full_prompt:
            aspect = "3:4"
        elif "1:1" in full_prompt or "1：1" in full_prompt:
            aspect = "1:1"
        elif "9:16" in full_prompt or "9：16" in full_prompt:
            aspect = "9:16"
        elif "4:3" in full_prompt or "4：3" in full_prompt:
            aspect = "4:3"
        elif "16:9" in full_prompt or "16：9" in full_prompt:
            aspect = "16:9"
            
        # Extract clean, elegant title
        title = ""
        # 1. Match 「...」, “...”, 『...』
        q_match = re.search(r"[「“『《]([^」”』》\n]{3,22})[」”』》]", full_prompt)
        if q_match:
            cand = q_match.group(1).strip()
            if not any(k in cand for k in ["人物类型", "任务", "整体", "身份锁定", "构图", "职责"]):
                title = cand
                
        # 2. Known style patterns
        if not title:
            patterns = [
                r"(国风传统城市色卡[^\s，。]*)",
                r"(先锋多巴胺潮流[^\s，。]*)",
                r"(高级多巴胺都市[^\s，。]*)",
                r"(复古纸质蒙太奇拼贴[^\s，。]*)",
                r"(极简独立绘本封面[^\s，。]*)",
                r"(双层手工纸[^\s，。]*)",
                r"(东方立体派极简纸拼贴[^\s，。]*)",
                r"(地下漫画粗粝肖像[^\s，。]*)",
                r"(彩色铅笔手绘艺术字[^\s，。]*)",
                r"(旅行摄影冰箱贴[^\s，。]*)",
                r"(立体折纸设计海报[^\s，。]*)",
                r"(莫兰迪纯色邮票水彩[^\s，。]*)",
                r"(油画明信片扁平重构[^\s，。]*)",
                r"(极简水彩色块画[^\s，。]*)",
                r"(黑白原色玛瑙波纹海报[^\s，。]*)",
                r"(IP分身日常手账海报[^\s，。]*)",
                r"(水墨建筑明信片[^\s，。]*)",
                r"(哑光米白艺术纸画册[^\s，。]*)",
                r"(冷蓝失真动漫海报[^\s，。]*)",
                r"(复古印刷校样感海报[^\s，。]*)",
                r"(高级珐琅质感冰箱贴[^\s，。]*)",
                r"(水墨扁平重构插画[^\s，。]*)",
                r"(多巴胺[^\s，。]{2,10}海报)",
                r"(浮雕[^\s，。]{2,10}插画)",
                r"(国潮[^\s，。]{2,10}插画)",
                r"(古风[^\s，。]{2,10}插画)",
                r"(线稿[^\s，。]{2,10}风格)",
                r"(实景[^\s，。]{2,10}插画)",
            ]
            for pat in patterns:
                pm = re.search(pat, full_prompt)
                if pm:
                    title = pm.group(1).strip()
                    break
                    
        # 3. Clean first line fallback
        if not title:
            first_line = full_prompt.split("\n")[0].strip()
            cleaned = re.sub(r"^(请将我上传的|请把我上传的|请根据|请使用我上传的|为上传每张照片制作一张独立的设计海报|根据提供的图片|以上传图片为|以原图为参考|参考我发你的原图|画面主体：|画布垂直对半分割|请|将|以|把|参考|根据|创作|在|为|【任务】|【职责】|【整体】|【构图】|【文字排版】)[\s:：]*", "", first_line)
            cleaned = re.sub(r"[「」“”《》【】\[\]#*]", "", cleaned).strip()
            if len(cleaned) >= 4:
                cut = re.split(r"[,，。；;：:\s]", cleaned)[0]
                if len(cut) >= 3 and not any(k in cut for k in ["人物类型", "冷峻女拳手", "整张图", "第一步", "第二步", "严格保留"]):
                    title = cut[:18]
                    
        if not title or any(k in title for k in ["例如", "人物类型", "冷峻女拳手", "整张图", "第一步", "第二步", "严格保留"]):
            sec_clean = curr_section.replace("提示词", "").replace("：", "").strip()
            title = f"{sec_clean} #{len(style_items)+1:02d}"
            
        # Series Prefix
        prefix_map = {
            "海报与画册": "旅行海报",
            "水彩与插画": "水彩手绘",
            "纸艺与拼贴": "纸艺拼贴",
            "国风与水墨": "国风水墨",
            "动漫与波普": "动漫波普",
            "极简与解构": "极简解构",
        }
        p_tag = prefix_map.get(cat, "精选风格")
        final_title = f"[{p_tag}] {title}"
        
        # Tags
        tags = [cat]
        if "二分" in full_prompt or "上下" in full_prompt: tags.append("二分构图")
        if "手绘" in full_prompt: tags.append("手绘质感")
        if "水彩" in full_prompt: tags.append("水彩淡彩")
        if "拼贴" in full_prompt or "撕纸" in full_prompt: tags.append("艺术拼贴")
        if "摄影" in full_prompt or "原图" in full_prompt: tags.append("摄影重构")
        if "留白" in full_prompt: tags.append("极简留白")
        if "复古" in full_prompt or "胶片" in full_prompt: tags.append("复古胶片")
        if "多巴胺" in full_prompt: tags.append("多巴胺色彩")
        if "国风" in full_prompt or "水墨" in full_prompt: tags.append("东方美学")
        if "浮雕" in full_prompt or "纸雕" in full_prompt: tags.append("立体纸雕")
        if len(tags) < 2: tags.append("视觉灵感")
        
        style_id = f"style-{len(style_items)+1:03d}"
        
        cover_img = ""
        imgs = []
        if len(style_items) < 5:
            docx_img = f"/images/image{len(style_items)+1}.jpg"
            if os.path.exists(f"public{docx_img}"):
                cover_img = docx_img
                imgs = [docx_img]
                
        style_items.append({
            "id": style_id,
            "title": final_title,
            "type": "style",
            "category": cat,
            "tags": list(dict.fromkeys(tags))[:4],
            "prompt": full_prompt,
            "aspect_ratio": aspect,
            "author": "开源社区",
            "repo_url": "",
            "description": full_prompt[:120].replace("\n", " ") + ("..." if len(full_prompt) > 120 else ""),
            "images": imgs,
            "cover_image": cover_img
        })

    for p in p1_paras:
        if not p:
            continue
        if any(p.startswith(k) for k in [
            "七种图片转插画X一种冰箱贴", "八种多巴胺海报", "九种海报拼贴", 
            "照片转插画", "国风插画风格", "三种浮雕插画提示词：", 
            "全新插画风格", "四种线稿风格", "四种国潮插画", 
            "实景转绘插画", "四种古风插画", "三组旅行海报拼贴", "光影提示词"
        ]):
            flush_style()
            curr_section = p.replace("提示词：", "").replace("：", "").strip()
            continue
        if re.match(r"^\d+$", p) or p in ["8冰箱贴", "11"]:
            flush_style()
            continue
        if len(curr_lines) > 0 and len(p) > 40:
            if any(p.startswith(k) for k in [
                "将我上传", "参考上传", "请基于我", "【任务】", "画布垂直对半", 
                "复古纸质蒙太奇", "请把我上传", "上下各占", "图片1 =", "将上传的照片", 
                "画面主体：", "请将我上传", "请使用我上传", "一幅时尚拼接", "为上传每张照片", 
                "国风传统城市色卡", "严格套用固定旅行海报", "以原图为参考", "将这张照片抽象", 
                "真实摄影潮流音乐", "实拍摄影照片", "极简独立绘本", "你是一名“IP", 
                "请将上传的照片重新制作成以下风格", "参考我发你的原图", "请根据真实照片生成"
            ]):
                flush_style()
                curr_lines.append(p)
                continue
        curr_lines.append(p)
    flush_style()

    print(f"Extracted {len(style_items)} unique style prompts from Part 1.")
    return style_items
