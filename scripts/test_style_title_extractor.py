# -*- coding: utf-8 -*-
import docx
import re

doc = docx.Document("网络热门风格➕Skill开源提示词(9.3).docx")

all_lines = []
for p_idx, p in enumerate(doc.paragraphs):
    raw = p.text.replace("\r", "\n").replace("\x0b", "\n")
    for l in raw.split("\n"):
        all_lines.append((p_idx, p.style.name, l.strip()))

# Extract candidate style entries along with the immediate header above each entry
styles_raw = []
curr_text = []
curr_header = ""

# Track last seen short title/heading line
last_header = ""

for i, (p_idx, p_style, line) in enumerate(all_lines):
    if p_idx >= 2045:
        break # Skills section starts around p2045
    
    if not line:
        if curr_text:
            styles_raw.append((curr_header, "\n".join(curr_text)))
            curr_text = []
            curr_header = ""
        continue

    # Detect header line: short line (<30 chars) that looks like a title or section
    is_header = False
    if len(line) < 35 and (
        line.endswith("风格") or line.endswith("插画") or line.endswith("海报") or 
        line.endswith("明信片") or line.endswith("冰箱贴") or line.endswith("版画") or
        line.endswith("画") or line.endswith("风") or line.startswith("图") or 
        line.startswith("【") and line.endswith("】") or
        re.match(r'^\d+[\.、\s]', line) or re.match(r'^[一二三四五六七八九十]+[、\s]', line)
    ):
        if not any(bad in line for bad in ["例如", "第一步", "在对话框", "帮我安装", "点击", "提示词", "禁止商用"]):
            is_header = True

    if is_header:
        if curr_text:
            styles_raw.append((curr_header, "\n".join(curr_text)))
            curr_text = []
        last_header = line
        curr_header = line
        continue

    # Skip author note
    if "禁止商用" in line or "抖音作者" in line:
        continue

    curr_text.append(line)

if curr_text:
    styles_raw.append((curr_header, "\n".join(curr_text)))

print(f"Total raw style blocks extracted: {len(styles_raw)}")

# Now let us test title generation for each
def clean_header(h):
    h = re.sub(r'^[图\d\s一二三四五六七八九十\.\、\(\)\（\）]+', '', h).strip()
    h = re.sub(r'[【】\[\]]', '', h).strip()
    return h

def extract_title_from_prompt(prompt, fallback_header):
    if fallback_header:
        cl = clean_header(fallback_header)
        if 2 <= len(cl) <= 20 and not any(b in cl for b in ["提示词", "例如", "第一步", "请将", "根据"]):
            return cl

    # Try to extract quoted style names like 「...」 or “...” or "..."
    quote_match = re.search(r'[「“"『]([^」”"』]{2,18})[」”"』]', prompt)
    if quote_match:
        cand = quote_match.group(1).strip()
        if not any(b in cand for b in ["http", "例如", "输入", "上传", "请将", "根据"]):
            return cand

    # Pattern: 转化为“...风格” or 生成“...”
    conv_match = re.search(r'(?:制作成|转化为|风格为|重构为|生成一张|创作一张)[「“"']?([^，。；\n”"']{2,16}(?:风|风格|插画|海报|明信片|拼贴|设计图|微缩|版画|肖像|色卡))[」”"']?', prompt)
    if conv_match:
        return conv_match.group(1).strip()

    # Fallback to key aesthetic phrases in first 50 chars
    first_part = prompt[:60].replace("\n", " ")
    for k in ["二分构图，哑光米白", "极简水彩色块", "复古印刷校样", "复古纸质蒙太奇", "高级珐琅质感冰箱贴", "东方立体派极简纸拼贴", "新表现主义人物肖像", "彩色铅笔手绘", "莫兰迪色系纯色", "解构复古明信片", "手工手帐拼贴", "黑白主视觉彩色", "油画明信片风格", "吉卜力工作室原画", "祖母绿哑光烫金浮雕", "深朱砂红中式金色版画", "深蓝建筑蓝图线稿", "酸性青柠街头多巴胺", "千禧 Y2K 甜酷少女", "日本琳派装饰画", "青绿重彩敦煌矿物画", "宋代青绿山水典雅意境"]:
        if k in first_part:
            return k.replace("，", "·")

    return "精选视觉设计风格"

test_results = []
for h, p in styles_raw[:50]:
    t = extract_title_from_prompt(p, h)
    test_results.append((h, t, p[:60].replace('\n', ' ')))

print("\nSample 25 Extracted Titles:")
for h, t, p in test_results[:25]:
    print(f"  [Header: {h:15}] -> Title: {t:24} | Prompt: {p[:40]}...")
