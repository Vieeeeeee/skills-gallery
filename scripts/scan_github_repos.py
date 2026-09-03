import json
import re
import urllib.request
import urllib.error
import os
import time

with open('public/skills_data.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

repo_map = {}
for item in items:
    url = item.get('repo_url', '')
    text = item.get('prompt', '')
    matches = re.findall(r'github.com/([a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+)', url + ' ' + text)
    for m in matches:
        clean_repo = m.rstrip('.git').rstrip('/')
        if '/' in clean_repo and not clean_repo.endswith('/blob') and not clean_repo.startswith('topics/'):
            parts = clean_repo.split('/')
            if len(parts) >= 2:
                base_repo = f"{parts[0]}/{parts[1]}"
                if base_repo not in repo_map:
                    repo_map[base_repo] = []
                repo_map[base_repo].append(item['id'])

print(f"Found {len(repo_map)} unique GitHub repos:")
for k, v in sorted(repo_map.items()):
    print(f" - {k} (linked to {len(v)} items: {v[:3]})")
