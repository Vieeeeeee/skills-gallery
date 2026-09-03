import json
import os

with open('public/skills_data.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

real_img_count = 0
gradient_card_count = 0

for item in items:
    imgs = item.get('images', [])
    cover = item.get('cover_image', '')
    
    # Check if image is a REAL image (docx image or gh_ github image or local asset)
    real_imgs = []
    for img in imgs:
        if img.startswith('/images/image') or 'gh_' in img or 'assets/' in img:
            if os.path.exists(os.path.join('public', img.lstrip('/'))):
                real_imgs.append(img)
            
    if cover and (cover.startswith('/images/image') or 'gh_' in cover or 'assets/' in cover):
        if os.path.exists(os.path.join('public', cover.lstrip('/'))):
            item['cover_image'] = cover
            item['images'] = real_imgs if real_imgs else [cover]
            real_img_count += 1
        else:
            item['cover_image'] = ""
            item['images'] = []
            gradient_card_count += 1
    elif real_imgs:
        item['cover_image'] = real_imgs[0]
        item['images'] = real_imgs
        real_img_count += 1
    else:
        item['cover_image'] = ""
        item['images'] = []
        gradient_card_count += 1

with open('public/skills_data.json', 'w', encoding='utf-8') as f:
    json.dump(items, f, ensure_ascii=False, indent=2)

print(f"Total: {len(items)}, Real images kept: {real_img_count}, Clean gradient cards: {gradient_card_count}")
