import json
import re

with open("public/skills_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print(f"Total items in current JSON: {len(data)}")

bad_titles = []
duplicates = {}
for item in data:
    title = item.get("title", "")
    raw_title = re.sub(r"^\[[^\]]+\]\s*", "", title)
    if any(k in raw_title for k in [
        "第一步", "第二步", "第三步", "在对话框", "帮我安装", "安装好之后", 
        "例如：", "例如", "人像设定为", "二分构图，哑光", "人物类型/职业", 
        "🔗地址", "http://", "https://", "地址：", "github.com", 
        "【用这个", "请使用我上传", "请将我上传", "根据提供的图片", 
        "以上传图片为", "画面主体：", "画布垂直", "严格套用"
    ]) or len(raw_title) > 30 or raw_title.startswith("“") or raw_title.startswith("‘"):
        bad_titles.append((item["id"], title, raw_title))
    
    key = raw_title.strip()
    duplicates.setdefault(key, []).append(item["id"])

print(f"Found {len(bad_titles)} items with bad/instruction-like titles:")
for i, t, rt in bad_titles[:30]:
    print(f"  {i}: {t}  -->  raw: {rt[:50]}")

dup_groups = {k: v for k, v in duplicates.items() if len(v) > 1 and len(k) > 2}
print(f"\nFound {len(dup_groups)} duplicate title groups (total duplicated count: {sum(len(v) for v in dup_groups.values())}):")
for k, v in list(dup_groups.items())[:15]:
    print(f"  [{k}]: {v}")
