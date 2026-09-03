import docx
import re
import json

doc = docx.Document("网络热门风格➕Skill开源提示词(3).docx")
paras = [p.text.strip() for p in doc.paragraphs]

print(f"Total paragraphs in docx: {len(paras)}")

p1_paras = paras[:1025]

def extract_p1(paras):
    items = []
    curr_section = "热门风格"
    curr_lines = []
    
    def flush():
        nonlocal curr_lines
        if not curr_lines:
            return
        full_text = "\n\n".join(curr_lines).strip()
        curr_lines = []
        if len(full_text) < 15:
            return
        if full_text in ["《提示词禁止商用，抖音作者威比》", "提示词禁止商用，抖音作者威比", "网络热门风格提示词"]:
            return
        items.append({
            "section": curr_section,
            "raw_text": full_text
        })

    for i, p in enumerate(paras):
        if not p:
            continue
            
        if any(p.startswith(k) for k in [
            "七种图片转插画X一种冰箱贴", "八种多巴胺海报", "九种海报拼贴", 
            "照片转插画", "国风插画风格", "三种浮雕插画提示词：", 
            "全新插画风格", "四种线稿风格", "四种国潮插画", 
            "实景转绘插画", "四种古风插画", "三组旅行海报拼贴", "光影提示词"
        ]):
            flush()
            curr_section = p.replace("提示词：", "").replace("：", "").strip()
            continue
            
        if re.match(r"^\d+$", p) or p in ["8冰箱贴", "11"]:
            flush()
            continue
            
        if len(curr_lines) > 0 and len(p) > 40:
            if any(p.startswith(k) for k in [
                "将我上传", "参考上传", "请基于我", "【任务】", "画布垂直对半", 
                "复古纸质蒙太奇", "请把我上传", "上下各占", "图片1 =", "将上传的照片", 
                "画面主体：", "请将我上传", "请使用我上传", "一幅时尚拼接", "为上传每张照片", 
                "国风传统城市色卡", "严格套用固定旅行海报", "以原图为参考", "将这张照片抽象", 
                "真实摄影潮流音乐", "实拍摄影照片", "极简独立绘本", "你是一名“IP", 
                "请将上传的照片重新制作成以下风格", "参考我发你的原图", "请根据真实照片生成"
            ]):
                flush()
                curr_lines.append(p)
                continue
                
        curr_lines.append(p)
        
    flush()
    return items

p1_items = extract_p1(p1_paras)
print(f"Part 1 extracted style count: {len(p1_items)}")

for idx, it in enumerate(p1_items[:15]):
    raw = it["raw_text"].replace("\n", " ")
    print(f"[{idx+1:03d}] [{it['section']}] {raw[:80]}...")
