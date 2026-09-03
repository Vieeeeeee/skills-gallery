# -*- coding: utf-8 -*-
"""
Merge 27 Wibi Skills into skills_data.json:
- Removes dummy reference images (/images/image1~5.jpg)
- Unifies prompt + negative_prompt into a single ready-to-use prompt
- Removes obsolete target_model field
- Deduplicates raw prompt drafts that duplicate the 27 Wibi Skills
- Inserts 27 official Wibi Skills at top of Skills collection
"""

import json
import re

with open("public/skills_data.json", "r", encoding="utf-8") as f:
    existing_items = json.load(f)

with open("scripts/wibi_skills_extracted.json", "r", encoding="utf-8") as f:
    wibi_skills = json.load(f)

print(f"Initial items: {len(existing_items)} (Wibi skills to insert: {len(wibi_skills)})")

# 1. Slugs / Titles of Wibi skills for deduplication
wibi_keywords = [
    '电蓝网点', '粗线条漫画头像', '蜡笔手绘', '暗夜红黑', '虹彩柔焦', '蓝底复古', 
    '地下试镜', '颗粒绒感', '冷蓝失真', '蜡笔极简', '蛇发游线', '暖纸蜡笔',
    '钻牙萌娃', '童年大头', '鱼眼城市', '牛来电影', '宠物极简', '马克笔童画',
    '怪趣波普', '照片拼豆', '像素切片', '乱码像素', '牛马宇宙', '晴空都市',
    '复古餐桌', '复古家居', '框景漫画'
]

# Identify styles that duplicate Wibi Skills
filtered_existing = []
dedup_count = 0

for it in existing_items:
    # Remove dummy reference images from styles
    if it.get("cover_image", "").startswith("/images/image"):
        it["cover_image"] = ""
    if it.get("images"):
        it["images"] = [img for img in it["images"] if not img.startswith("/images/image")]

    # Check if this is an existing raw style that duplicates one of the 27 official skills
    if it["type"] == "style":
        title = it.get("title", "")
        prompt = it.get("prompt", "")
        is_dup = False
        for kw in wibi_keywords:
            if kw in title or (kw in prompt[:60] and any(k in prompt for k in ["Skill", "skill", "Wibi", "wibi"])):
                is_dup = True
                break
        if is_dup:
            dedup_count += 1
            continue

    # Unify prompt and negative_prompt into single prompt
    neg = it.get("negative_prompt", "").strip()
    p = it.get("prompt", "").strip()
    if neg and neg not in p:
        it["prompt"] = f"{p}\n\n【负向过滤约束】\n{neg}"
    
    # Remove separate negative_prompt & obsolete target_model
    it.pop("negative_prompt", None)
    it.pop("target_model", None)

    filtered_existing.append(it)

print(f"Deduplicated {dedup_count} raw styles that duplicate official Wibi skills.")

# Separate existing into skills, tools, styles
existing_skills = [x for x in filtered_existing if x["type"] == "skill"]
existing_tools = [x for x in filtered_existing if x["type"] == "tool"]
existing_styles = [x for x in filtered_existing if x["type"] == "style"]

# Prepare final skills: 27 Wibi Skills first, then other verified open source skills
all_skills = wibi_skills + existing_skills
final_dataset = all_skills + existing_tools + existing_styles

print(f"Final dataset stats:")
print(f"  Total items: {len(final_dataset)}")
print(f"  Skills: {len(all_skills)} (Official Wibi: {len(wibi_skills)}, Community: {len(existing_skills)})")
print(f"  Tools: {len(existing_tools)}")
print(f"  Styles: {len(existing_styles)}")

with open("public/skills_data.json", "w", encoding="utf-8") as f:
    json.dump(final_dataset, f, ensure_ascii=False, indent=2)

print("Saved clean merged dataset to public/skills_data.json successfully!")
