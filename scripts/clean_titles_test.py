import docx
import json
import re

doc = docx.Document("网络热门风格➕Skill开源提示词(3).docx")
print("Total paragraphs in docx:", len(doc.paragraphs))

with open("public/skills_data.json", "r", encoding="utf-8") as f:
    items = json.load(f)

print("Total items:", len(items))
for i, item in enumerate(items):
    p = item["prompt"]
    # check if title has generic patterns
    t = item["title"]
    # Look for style description in prompt
    lower_m = re.search(r'下半部分[：|｜s]*([^
。；]{4,50})', p)
    quote_m = re.search(r'[「“]([^」”
]+)[」”]', p)
    style_kw_m = re.search(r'(?:风格|插画|设计|重构|质感)[：|｜s]*([^
。；]{4,40})', p)
    
    if i < 40 or "1:1" in t or "二分" in t or "海报" in t and t.count("海报") > 1:
        pass

