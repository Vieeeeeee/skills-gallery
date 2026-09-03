import json
import re

with open("public/skills_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print(f"Total items in JSON: {len(data)}")

# 1. Check title quality and any bad words
bad_items = []
for item in data:
    title = item["title"]
    if any(k in title for k in ["第一步", "第二步", "第三步", "在对话框", "例如", "http", "github.com", "帮我安装", "请将我", "请使用", "根据提供"]):
        bad_items.append((item["id"], title))

print(f"Bad instruction titles count: {len(bad_items)}")
for i, t in bad_items:
    print("  BAD:", i, t)

# 2. Check title duplicates
titles = {}
for item in data:
    t = item["title"]
    titles.setdefault(t, []).append(item["id"])

dup_titles = {k: v for k, v in titles.items() if len(v) > 1}
print(f"\nDuplicate titles count: {len(dup_titles)}")
for k, v in dup_titles.items():
    print(f"  DUP: {k} -> {v}")

# 3. Check categories distribution
cats = {}
for item in data:
    c = item["category"]
    cats[c] = cats.get(c, 0) + 1

print(f"\nCategory distribution: {cats}")

# 4. Check types distribution
types = {}
for item in data:
    tp = item["type"]
    types[tp] = types.get(tp, 0) + 1

print(f"Type distribution: {types}")

# 5. Check authors count
authors = set(x["author"] for x in data)
print(f"Unique authors count: {len(authors)}")
