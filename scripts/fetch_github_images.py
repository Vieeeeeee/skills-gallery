import os
import sys
import json
import re
import urllib.request
import urllib.error
from PIL import Image
import io
import concurrent.futures

COVERS_DIR = 'public/images/covers'
SAMPLES_DIR = 'public/images/samples'
os.makedirs(COVERS_DIR, exist_ok=True)
os.makedirs(SAMPLES_DIR, exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def get_readme_content(repo):
    branches = ['main', 'master']
    for b in branches:
        url = f"https://raw.githubusercontent.com/{repo}/{b}/README.md"
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=4) as resp:
                if resp.status == 200:
                    return resp.read().decode('utf-8', errors='ignore'), b
        except Exception:
            pass
    return None, None

def extract_image_urls(readme_text, repo, branch):
    if not readme_text:
        return []
    
    raw_urls = []
    # Markdown images: ![alt](url)
    md_matches = re.findall(r'!\[.*?\]\((.*?)\)', readme_text)
    raw_urls.extend(md_matches)
    
    # HTML img tags: <img ... src="url" ...>
    html_matches = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', readme_text, re.IGNORECASE)
    raw_urls.extend(html_matches)
    
    resolved_urls = []
    for u in raw_urls:
        u = u.strip().split('?')[0].split('#')[0]
        if not u or any(u.lower().endswith(x) for x in ['.svg', '.gif', '.mp4', '.mov']):
            continue
        if any(badge in u for badge in ['shields.io', 'badge', 'travis-ci', 'img.shields', 'star-history', 'nodei.co']):
            continue
            
        if u.startswith('http://') or u.startswith('https://'):
            if 'github.com' in u and '/blob/' in u:
                u = u.replace('/blob/', '/raw/')
            resolved_urls.append(u)
        else:
            clean_rel = u.lstrip('./').lstrip('/')
            abs_url = f"https://raw.githubusercontent.com/{repo}/{branch}/{clean_rel}"
            resolved_urls.append(abs_url)
            
    return list(dict.fromkeys(resolved_urls))

def download_and_process_image(url, out_path, max_dim=(800, 600)):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=6) as resp:
            if resp.status == 200:
                img_data = resp.read()
                if len(img_data) < 2000:
                    return False
                with Image.open(io.BytesIO(img_data)) as im:
                    im = im.convert('RGB')
                    im.thumbnail(max_dim, Image.Resampling.LANCZOS)
                    im.save(out_path, 'WEBP', quality=85)
                return True
    except Exception:
        return False

def process_repo(repo):
    readme, branch = get_readme_content(repo)
    if not readme:
        return repo, []
    img_urls = extract_image_urls(readme, repo, branch)
    if not img_urls:
        return repo, []
        
    repo_slug = repo.replace('/', '_').lower()
    saved = []
    for idx, img_url in enumerate(img_urls[:4]):
        out_filename = f"gh_{repo_slug}_{idx+1}.webp"
        out_file_path = os.path.join(COVERS_DIR, out_filename)
        if os.path.exists(out_file_path) and os.path.getsize(out_file_path) > 3000:
            saved.append(f"/images/covers/{out_filename}")
        else:
            ok = download_and_process_image(img_url, out_file_path)
            if ok:
                saved.append(f"/images/covers/{out_filename}")
    return repo, saved

def main():
    json_path = 'public/skills_data.json'
    with open(json_path, 'r', encoding='utf-8') as f:
        items = json.load(f)
        
    print(f"Scanning {len(items)} items for GitHub repositories...")
    
    unique_repos = set()
    for item in items:
        text = item.get('prompt', '') + ' ' + item.get('repo_url', '') + ' ' + item.get('title', '')
        matches = re.findall(r'github\.com/([a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+)', text)
        for m in matches:
            m_clean = m.rstrip('.git').rstrip('/')
            if '/' in m_clean and not m_clean.endswith('/blob') and not m_clean.startswith('topics/'):
                parts = m_clean.split('/')
                base_repo = f"{parts[0]}/{parts[1]}"
                unique_repos.add(base_repo)
                
    print(f"Found {len(unique_repos)} unique repos. Parallel fetching images with 10 workers...")
    
    fetched_repo_images = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(process_repo, r): r for r in unique_repos}
        for future in concurrent.futures.as_completed(futures):
            repo, imgs = future.result()
            if imgs:
                fetched_repo_images[repo] = imgs
                print(f"  [v] {repo}: downloaded {len(imgs)} real image(s)")
                
    print(f"Successfully downloaded images for {len(fetched_repo_images)} repos.")
    
    updated_count = 0
    for item in items:
        item_text = item.get('prompt', '') + ' ' + item.get('repo_url', '') + ' ' + item.get('title', '')
        for repo, imgs in fetched_repo_images.items():
            repo_name = repo.split('/')[1].lower()
            if repo.lower() in item_text.lower() or (len(repo_name) > 6 and repo_name in item_text.lower()):
                if imgs and len(imgs) > 0:
                    item['cover_image'] = imgs[0]
                    item['images'] = imgs
                    updated_count += 1
                    break
                    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
        
    print(f"Updated {updated_count} items with real GitHub screenshots & sample images in skills_data.json!")

if __name__ == '__main__':
    main()
