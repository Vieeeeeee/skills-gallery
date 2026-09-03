# -*- coding: utf-8 -*-
"""
Skills & 风格大赏 全量全要素解析引擎
- 彻底扁平化解析 9.3 docx (包含单段内嵌入的上千行软回车)
- 提取并规范化开源 Skills (GitHub / Gitee / 智能体技能)
- 提取并规范化实用设计工具与在线工具箱 (Tools)
- 提取并深度清洗生图风格提示词 (Styles: 正反向提示词、推荐画幅、适用模型、动态标记)
- 杜绝标题截断与脏指令，生成完全结构化标准 JSON
"""

import os
import re
import json
import docx

DOCX_PATH = "网络热门风格➕Skill开源提示词(9.3).docx"

def clean_str(s):
    if not s:
        return ""
    return s.replace("\xa0", " ").replace("\u3000", " ").replace("\r", "").strip()

def extract_expanded_lines(doc_path):
    doc = docx.Document(doc_path)
    expanded = []
    for p_idx, p in enumerate(doc.paragraphs):
        text = p.text.replace("\r", "\n").replace("\x0b", "\n")
        lines = text.split("\n")
        for line_idx, line in enumerate(lines):
            t = clean_str(line)
            expanded.append({
                "p_idx": p_idx,
                "line_idx": line_idx,
                "style": p.style.name,
                "text": t
            })
    return expanded

if __name__ == "__main__":
    lines = extract_expanded_lines(DOCX_PATH)
    print(f"Loaded {len(lines)} total lines, non-empty: {sum(1 for x in lines if x['text'])}")
