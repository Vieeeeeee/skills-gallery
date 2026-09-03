import docx
import re
import json

doc = docx.Document("网络热门风格➕Skill开源提示词(3).docx")
paras = [p.text.strip() for p in doc.paragraphs]

p2_paras = paras[1025:]

print(f"Total lines in Part 2: {len(p2_paras)}")

# Let us inspect all non-empty lines in Part 2
p2_non_empty = [(1025+i, p) for i, p in enumerate(p2_paras) if p]
print(f"Non-empty lines in Part 2: {len(p2_non_empty)}")

# Let us see how skills/tools are mentioned
# We can extract all distinct skill blocks or references
for idx, line in p2_non_empty[:40]:
    print(f"{idx:04d}: {line[:90]}")
