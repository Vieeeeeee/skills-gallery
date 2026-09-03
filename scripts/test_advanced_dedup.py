import docx
import re
import json
import hashlib
import sys
sys.path.append(".")

doc = docx.Document("网络热门风格➕Skill开源提示词(3).docx")
paras = [p.text.strip().replace("\xa0", " ").replace("\u3000", " ") for p in doc.paragraphs]

from scripts.parse_docx import parse_style_prompts
styles = parse_style_prompts(paras)
print("Raw extracted styles before advanced dedup:", len(styles))

clean_styles = []
seen_keys = set()

def get_prompt_fingerprint(p):
    p_clean = re.sub(r"小红书[^s]*", "", p)
    p_clean = re.sub(r"抖音作者[^s]*", "", p_clean)
    p_clean = re.sub(r"[sd，。、：:；;！!？?《》「」“”【】\[\]#*]+", "", p_clean)
    return p_clean[:70]

for s in styles:
    fp = get_prompt_fingerprint(s["prompt"])
    if fp in seen_keys:
        continue
    seen_keys.add(fp)
    clean_styles.append(s)

print("Unique styles after advanced fingerprint dedup:", len(clean_styles))
for idx, s in enumerate(clean_styles[:25]):
    print(f"[{idx+1:03d}] {s['title']}")
