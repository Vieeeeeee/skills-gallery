import json
import re

with open("public/skills_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

styles = [x for x in data if x["type"] == "style"]
g_styles = [s for s in styles if "东方古风" in s["title"] or "每一张照片分别" in s["title"]]
print("Count of template styles:", len(g_styles))

for idx, s in enumerate(g_styles):
    p = s["prompt"]
    # extract下半部分 / 下半区 keywords
    lower_m = re.search(r"(?:下半部分|下半区|下半)[^。；\n]{5,80}", p)
    lower_desc = lower_m.group(0) if lower_m else "无下半部分关键字"
    first_few = p.replace("\n", " ")[:70]
    print(f"[{s['id']}] lower: {lower_desc[:60]} | excerpt: {first_few}")
