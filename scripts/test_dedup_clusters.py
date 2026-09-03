# -*- coding: utf-8 -*-
import docx
import re
import json

doc = docx.Document("网络热门风格➕Skill开源提示词(9.3).docx")

all_lines = []
for p_idx, p in enumerate(doc.paragraphs):
    raw = p.text.replace("\r", "\n").replace("\x0b", "\n")
    for l in raw.split("\n"):
        all_lines.append((p_idx, p.style.name, l.strip()))

# Extract raw blocks
blocks = []
curr_text = []
curr_header = ""

for i, (p_idx, p_style, line) in enumerate(all_lines):
    if p_idx >= 2045:
        break
    if not line:
        if curr_text:
            blocks.append((curr_header, "\n".join(curr_text)))
            curr_text = []
            curr_header = ""
        continue

    # Detect header
    if len(line) < 35 and (
        line.endswith("风格") or line.endswith("插画") or line.endswith("海报") or 
        line.endswith("明信片") or line.endswith("冰箱贴") or line.endswith("版画") or
        line.endswith("画") or line.endswith("风") or line.startswith("图") or 
        (line.startswith("【") and line.endswith("】")) or
        re.match(r'^\d+[\.、\s]', line) or re.match(r'^[一二三四五六七八九十]+[、\s]', line)
    ):
        if not any(bad in line for bad in ["例如", "第一步", "在对话框", "帮我安装", "点击", "提示词", "禁止商用"]):
            if curr_text:
                blocks.append((curr_header, "\n".join(curr_text)))
                curr_text = []
            curr_header = line
            continue

    if "禁止商用" in line or "抖音作者" in line:
        continue
    curr_text.append(line)

if curr_text:
    blocks.append((curr_header, "\n".join(curr_text)))

def get_fingerprint(text):
    # Strip whitespace, numbers, punctuations
    t = re.sub(r'[\s\d，。、：:；;！!？?《》「」“”【】\[\]#*—\-—\.\(\)\/]+', '', text)
    # Strip common leading boilerplate
    t = re.sub(r'^(请将上传的(任意)?照片|将我上传的(实拍)?照片|根据提供的图片|参考上传的照片|生成一张|制作一张|请把我上传的照片|画面主体|以原图为参考|以上传图片为唯一内容源)+', '', t)
    return t[:60]

clusters = {}
for header, text in blocks:
    if len(text) < 35:
        continue
    fp = get_fingerprint(text)
    if not fp:
        continue
    clusters.setdefault(fp, []).append((header, text))

print(f"Total raw blocks: {len(blocks)}")
print(f"Unique style clusters: {len(clusters)}")
print(f"Redundant copies eliminated: {sum(len(v) - 1 for v in clusters.values())}")
