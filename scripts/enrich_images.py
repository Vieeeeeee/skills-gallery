#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
真实图片维护与校验脚本
- 仅保留真实 GitHub 抓取图与 DOCX 提取图
- 无图条目保持纯净渐变背景与文字水印，严禁生成伪图
"""

import json

def main():
    json_path = 'public/skills_data.json'
    with open(json_path, 'r', encoding='utf-8') as f:
        items = json.load(f)

    real_imgs = 0
    clean_prompts = 0

    for item in items:
        cover = item.get('cover_image', '')
        if cover.startswith('/images/covers/gh_') or cover.startswith('/images/image'):
            real_imgs += 1
        else:
            item['cover_image'] = ''
            item['images'] = []
            clean_prompts += 1

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

    print(f"数据校验完成：真实配图条目 {real_imgs} 条，纯净文字卡片 {clean_prompts} 条")

if __name__ == '__main__':
    main()
