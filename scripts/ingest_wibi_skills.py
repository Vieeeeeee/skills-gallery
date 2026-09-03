# -*- coding: utf-8 -*-
"""
Ingest all 27 Wibi Skills from https://github.com/Vieeeeeee/wibi-style
- Fetches metadata from README of each skill
- Downloads example images into public/images/wibi/ as optimized WebP
- Returns 27 production-ready Skill records
"""

import os
import re
import json
import urllib.request
from PIL import Image

SKILL_SLUGS = [
    'electric-blue-halftone-poster',
    'alt-manga-avatar',
    'art-print-poster',
    'dark-red-black-cel-shaded',
    'iridescent-long-exposure',
    'blue-retro-print',
    'underground-audition',
    'textile-toy-portrait',
    'cold-blue-glitch-anime',
    'crayon-flat-naive',
    'serpent-line-ink',
    'warm-paper-crayon-street',
    'diamond-kid-head-card',
    'kid-head-card',
    'fisheye-city-cover',
    'niulai-movie-poster',
    'minimal-pet-doodle',
    'marker-child-doodle',
    'quirky-pop-doodle-sticker',
    'photo-perler-charm',
    'pixel-stretch',
    'glitch-pixel-collage',
    'office-animals',
    'clear-sky-urban-cel',
    'retro-table-print',
    'home-journal',
    'wibi-frame'
]

WIBI_DIR = "public/images/wibi"
os.makedirs(WIBI_DIR, exist_ok=True)

def fetch_skill(slug):
    url = f"https://raw.githubusercontent.com/Vieeeeeee/wibi-style/main/skills/{slug}/README.md"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read().decode('utf-8')
    except Exception as e:
        print(f"Failed to fetch {slug}: {e}")
        return None

    # Title
    m_title = re.search(r'#\s*(.*?)\n', content)
    raw_title = m_title.group(1).strip() if m_title else slug
    # Clean title (keep Wibi Style · X)
    title = raw_title if raw_title.startswith("Wibi Style") else f"Wibi Style · {raw_title}"

    # Description (first meaningful paragraph)
    paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
    desc = ""
    for p in paragraphs:
        if p.startswith('#') or p.startswith('<') or '当前版本' in p or '作者：' in p:
            continue
        clean_p = re.sub(r'\[.*?\]\(.*?\)', '', p).replace('\n', ' ').strip()
        if len(clean_p) > 15:
            desc = clean_p
            break
    if not desc:
        desc = f"Wibi Style 官方出品：{slug} 视觉 Skill，上传单张照片一键执行风格化重绘。"

    # Images
    raw_imgs = re.findall(r'<img[^>]+src=[\"\']([^\"\']+)[\"\']', content)
    local_imgs = []
    
    # Download up to 4 showcase images per skill for lightweight fast loading
    for idx, img_url in enumerate(raw_imgs[:4], 1):
        ext_filename = f"{slug}_{idx}.webp"
        target_path = os.path.join(WIBI_DIR, ext_filename)
        public_url = f"/images/wibi/{ext_filename}"
        
        if not os.path.exists(target_path):
            try:
                img_req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
                temp_file = f"/tmp/{slug}_{idx}.tmp"
                with urllib.request.urlopen(img_req, timeout=12) as img_resp:
                    with open(temp_file, "wb") as tf:
                        tf.write(img_resp.read())
                
                # Convert to WebP with PIL, resize to max 800px width/height for fast web loading
                with Image.open(temp_file) as im:
                    im.thumbnail((800, 800), Image.Resampling.LANCZOS)
                    im.save(target_path, "WEBP", quality=88)
                if os.path.exists(temp_file):
                    os.remove(temp_file)
                print(f"  [+] Downloaded & compressed {ext_filename}")
            except Exception as e:
                print(f"  [!] Failed to download {img_url}: {e}")
                # Fallback to direct URL if download fails
                local_imgs.append(img_url)
                continue
        
        local_imgs.append(public_url)

    # Determine tags
    tags = ["Wibi 官方出品", "威比", "视觉Skill"]
    if any(k in slug for k in ['kid', 'child', 'doodle', 'toy', 'pet']):
        tags.append("治愈插画")
    elif any(k in slug for k in ['glitch', 'pixel', 'halftone', 'poster', 'cover']):
        tags.append("波普海报")
    elif any(k in slug for k in ['urban', 'cel', 'journal', 'table', 'street']):
        tags.append("生活纪实")
    else:
        tags.append("人物肖像")

    return {
        "id": f"wibi-{slug}",
        "slug": slug,
        "title": title,
        "type": "skill",
        "category": "开源 Skill",
        "author": "Vie (威比)",
        "repo_url": f"https://github.com/Vieeeeeee/wibi-style/tree/main/skills/{slug}",
        "command": f"使用 ${slug} 处理这张照片",
        "install_command": f"请安装这个 Skill：https://github.com/Vieeeeeee/wibi-style/tree/main/skills/{slug}",
        "tags": tags,
        "description": desc,
        "cover_image": local_imgs[0] if local_imgs else "",
        "images": local_imgs,
        "aspect_ratio": "1:1" if any(k in slug for k in ['halftone', 'avatar', 'charm', 'sticker']) else "3:4",
        "accent_color": "#4F46E5",
        "gradient": "from-[#2A2B4A]/90 via-[#36385C]/80 to-[#1C1D33]"
    }

def main():
    print(f"Starting ingestion of {len(SKILL_SLUGS)} Wibi Skills...")
    wibi_records = []
    for slug in SKILL_SLUGS:
        print(f"Processing: {slug}")
        rec = fetch_skill(slug)
        if rec:
            wibi_records.append(rec)

    output_path = "scripts/wibi_skills_extracted.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(wibi_records, f, ensure_ascii=False, indent=2)
    print(f"\nSuccessfully saved {len(wibi_records)} Wibi skills to {output_path}!")

if __name__ == "__main__":
    main()
