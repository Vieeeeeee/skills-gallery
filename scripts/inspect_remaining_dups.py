import json

with open("public/skills_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

dup_ids = [
    "style-038", "style-132", "style-115", "style-057", "style-051",
    "style-046", "style-030",
    "style-016", "style-040",
    "style-013", "style-035",
    "style-045", "style-044",
    "style-114", "style-143",
    "style-110", "style-033",
    "style-123", "style-122",
    "style-125", "style-042",
    "style-100", "style-093"
]

for i in dup_ids:
    item = next(x for x in data if x["id"] == i)
    p = item["prompt"].replace("\n", " ")
    print(f"=== {i} ===\n{p[:140]}\n")
