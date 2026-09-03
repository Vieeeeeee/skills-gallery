import json
import re

with open("public/skills_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

styles = [x for x in data if x["type"] == "style"]
print("Total styles:", len(styles))

# Let us inspect duplicate title groups and their prompts
grouped = {}
for s in styles:
    t = s["title"]
    grouped.setdefault(t, []).append(s)

dup_groups = {k: v for k, v in grouped.items() if len(v) > 1}
print(f"Duplicate title groups in styles: {len(dup_groups)}")

for title, group in dup_groups.items():
    print(f"\nGroup: {title} ({len(group)} items):")
    for item in group[:8]:
        # print first 100 chars of prompt
        p = item["prompt"].replace("\n", " ")
        # check what distinctive keywords appear
        print(f"  [{item['id']}] {p[:120]}")
