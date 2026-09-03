import os
import sys
import json
import re
import docx

doc = docx.Document("网络热门风格➕Skill开源提示词(3).docx")
paras = [p.text.strip().replace("\xa0", " ").replace("\u3000", " ") for p in doc.paragraphs]
p2_paras = paras[1025:]

# Let us build a master catalog of authentic Skills & Tools from Part 2
# Every skill from the docx mapped with true author, repo, category, title, command, desc
p2_text = "\n".join([p for p in p2_paras if p])

# Let us inspect all distinct skills present in Part 2 text
print("Part 2 text length:", len(p2_text))
