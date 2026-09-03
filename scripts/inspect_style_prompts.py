import json
import re

with open("public/skills_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Inspect all style items that have identical titles
styles = [x for x in data if x["type"] == "style"]
print("Total styles:", len(styles))

for idx, s in enumerate(styles[:40]):
    p = s["prompt"].replace("\n", " ")
    print(f"[{s['id']}] {s['title']}  --> Prompt excerpt: {p[:90]}")
