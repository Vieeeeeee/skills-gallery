import docx
import re
import json

doc = docx.Document("网络热门风格➕Skill开源提示词(3).docx")
paras = [p.text.strip() for p in doc.paragraphs]

# Let us inspect all skills mentioned in Part 2 in detail
p2_text = "\n".join([p for p in paras[1025:] if p])

# Find all GitHub URLs in Part 2
gh_links = re.findall(r"https?://github\.com/[a-zA-Z0-9_\-\.]+/[a-zA-Z0-9_\-\.]+", p2_text)
unique_gh = sorted(list(set(gh_links)))
print(f"Found {len(unique_gh)} unique GitHub repos in Part 2:")
for u in unique_gh:
    print("  ", u)

# Find all Skill names mentioned in Part 2
skill_names = re.findall(r"([a-zA-Z0-9_\-]+(?:-skill|-zine|-poster|-card|-tools?|-editorial|-abstraction|-generator|-remover|-enhancer|-charts?|-model|-probes|-echo|-knit|-distill|-revival|-studio)?[a-zA-Z0-9_\-]*)", p2_text)
print(f"\nSample skill tokens found: {len(set(skill_names))}")
