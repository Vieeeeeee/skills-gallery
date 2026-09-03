# -*- coding: utf-8 -*-
import docx
import re

doc = docx.Document("网络热门风格➕Skill开源提示词(9.3).docx")

all_lines = []
for p_idx, p in enumerate(doc.paragraphs):
    raw = p.text.replace("\r", "\n").replace("\x0b", "\n")
    for l in raw.split("\n"):
        all_lines.append((p_idx, p.style.name, l.strip()))

# Extract candidate style entries
styles_raw = []
curr_text = []
curr_header = ""

for i, (p_idx, p_style, line) in enumerate(all_lines):
    if p_idx >= 2045:
        break
    
    if not line:
        if curr_text:
            styles_raw.append((curr_header, "\n".join(curr_text)))
            curr_text = []
            curr_header = ""
        continue

    # Detect header line
    is_header = False
    if len(line) < 35 and (
        line.endswith("风格") or line.endswith("插画") or line.endswith("海报") or 
        line.endswith("明信片") or line.endswith("冰箱贴") or line.endswith("版画") or
        line.endswith("画") or line.endswith("风") or line.startswith("图") or 
        (line.startswith("【") and line.endswith("】")) or
        re.match(r'^\d+[\.、\s]', line) or re.match(r'^[一二三四五六七八九十]+[、\s]', line)
    ):
        if not any(bad in line for bad in ["例如", "第一步", "在对话框", "帮我安装", "点击", "提示词", "禁止商用"]):
            is_header = True

    if is_header:
        if curr_text:
            styles_raw.append((curr_header, "\n".join(curr_text)))
            curr_text = []
        curr_header = line
        continue

    if "禁止商用" in line or "抖音作者" in line:
        continue

    curr_text.append(line)

if curr_text:
    styles_raw.append((curr_header, "\n".join(curr_text)))

# Advanced title mapping and pattern extraction
EXACT_PHRASES = [
    ("冷蓝失真动漫", "冷蓝失真动漫海报"),
    ("负形拼贴艺术", "梦幻负形拼贴艺术海报"),
    ("国风传统城市色卡", "国风传统城市色卡"),
    ("潮流音乐海报", "真实摄影潮流音乐海报"),
    ("哑光米白画册明信片", "二分构图哑光水墨明信片"),
    ("双层纸张质感", "双层手工纸蜡笔手绘明信片"),
    ("彩色波纹拖尾", "黑白原色玛瑙波纹海报"),
    ("独立绘本封面插画", "极简独立绘本墨线封面"),
    ("IP 分身", "IP分身日常手账海报"),
    ("吉卜力工作室", "日系吉卜力动画原画风"),
    ("祖母绿/孔雀石绿", "祖母绿哑光烫金浮雕线稿"),
    ("赤陶橙哑光纸", "赤陶橙古金压印浮雕"),
    ("珍珠银线浮雕", "冰蓝珍珠银线浮雕"),
    ("贝母金箔浮雕", "深紫贝母金箔浮雕"),
    ("深朱砂红背景", "深朱砂红中式金色版画插画"),
    ("建筑蓝图线稿", "深蓝建筑蓝图线稿"),
    ("多层错位的 荧光", "多层错位荧光手绘线稿"),
    ("极简扁平矢量线稿", "纯白极简单线矢量艺术"),
    ("CAD风格抽象建筑", "马卡龙CAD建筑线条"),
    ("国潮风建筑插画转绘", "国潮鎏金高对比建筑插画"),
    ("蒙德里安式", "蒙德里安新造型几何插画"),
    ("CMYK 色彩", "CMYK正片叠底彩色几何插画"),
    ("象牙白网球时装", "复古学院网球运动时尚海报"),
    ("酸性青柠绿", "酸性青柠街头多巴胺海报"),
    ("樱桃红短款", "樱桃红都市前卫多巴胺海报"),
    ("超尺度植物艺术", "超现实植物艺术多巴胺海报"),
    ("奶油黄色针织", "奶油黄复古运动多巴胺海报"),
    ("橘红色短款轻量夹克", "橘红复古运动多巴胺海报"),
    ("巨型音响装置", "3D音响装置潮流碰撞海报"),
    ("透明棋盘装置", "透明棋盘装置潮流撞色海报"),
    ("千禧 Y2K 甜酷少女", "千禧Y2K甜酷少女拼贴海报"),
    ("多人物剪贴拼贴", "Y2K经典多人物剪贴手账海报"),
    ("薄荷奶绿千禧", "薄荷奶绿手撕剪贴手账海报"),
    ("主体人物突破画框外", "主体人物突破画框摄影拼贴"),
    ("柔焦长 曝光虹彩", "柔焦长曝光虹彩运动肖像"),
    ("餐厅美食/餐桌随手拍", "复古广告质感美食打卡海报"),
    ("3D纺织艺术玩偶", "毛绒纺织玩偶潮流胸像"),
    ("复古贴纸风海报", "国内景点复古手账贴纸海报"),
    ("复古手撕皮纹纸", "复古手撕皮纹纸手作拼贴"),
    ("日本琳派装饰画", "日本琳派金箔流水纹样装饰画"),
    ("现代梦幻重彩矿物画", "青绿重彩敦煌矿物画"),
    ("新中式工笔重彩画", "新中式工笔铁线描沥粉贴金"),
    ("中国传统青绿山水画", "宋代青绿山水典雅意境画"),
    ("卡通漫画冰箱贴", "小红书旅行打卡卡通冰箱贴"),
    ("手工拼布贴画", "手工拼布贴画对照艺术海报"),
    ("扁平矢量旅行海报", "极简扁平矢量旅行海报"),
    ("理性抽象解构插画", "象牙白理性抽象解构插画"),
    ("东方框景秩序", "东方框景朦胧秩序氛围插画"),
    ("定制字标", "定制品牌字标图形海报"),
    ("民 俗木版年画", "民俗木版年画剪纸装饰插画"),
    ("像素消隐景观", "像素消隐景观解构插画"),
    ("旅行纪念印章", "三色旅行纪念印章插画"),
    ("极简书法水墨建筑", "极简书法水墨建筑插画"),
    ("极简矩形色块插画", "极简矩形色块空间插画"),
    ("极简国风山水徽章", "极简国风山水徽章插画"),
    ("粗线条手绘插画", "粗线条治愈绘本手绘插画"),
    ("极简渐变插画", "极简渐变光影插画"),
    ("现代几何建筑海报", "现代几何建筑海报插画"),
    ("极简连续线描", "极简连续线描速写插画"),
    ("旅行纪念贴纸插画", "旅行纪念立体贴纸插画"),
    ("冰淇淋地标", "冰淇淋建筑地标超现实插画"),
    ("拼豆施工图", "高清拼豆像素施工图纸"),
    ("Chibi 角色", "温暖手绘治愈系Chibi角色"),
    ("儿童故事书角色", "复古2D儿童故事书手绘头像"),
    ("日常物件放进黑色手绘线稿", "实物与黑色线稿创意合成"),
    ("二分构图，哑光米白", "二分构图哑光米白艺术画册明信片"),
    ("极简水彩色块画", "极简水彩色块留白插画"),
    ("复古印刷校样感", "复古印刷校样感艺术海报"),
    ("复古纸质蒙太奇拼贴画", "复古纸质蒙太奇拼贴海报"),
    ("高级珐琅质感冰箱贴", "高级珐琅质感金属冰箱贴"),
    ("东方立体派极简纸拼贴", "东方立体派极简纸拼贴插画"),
    ("新表现主义人物肖像", "新表现主义地下漫画人物肖像"),
    ("彩色铅笔手绘", "彩色铅笔素描纸手绘插画"),
    ("艺术提炼面板", "摄影与艺术提炼面板明信片"),
    ("莫兰迪色系纯色", "莫兰迪纯色邮票水彩插画"),
    ("解构后的复古明信片效果", "解构复古明信片版画"),
    ("手工手帐拼贴", "竖版手工手账拼贴海报"),
    ("梦幻、忧郁、手 工拼贴感的负形拼贴", "梦幻负形拼贴艺术海报"),
    ("黑白主视觉+彩色小图", "黑白主视觉彩色时尚拼接海报"),
    ("油画明信片风格", "油画明信片扁平重构插画")
]

def clean_header(h):
    h = re.sub(r'^[图\d\s一二三四五六七八九十\.\、\(\)\（\）]+', '', h).strip()
    h = re.sub(r'[【】\[\]]', '', h).strip()
    return h

def extract_title(prompt, header):
    if header:
        ch = clean_header(header)
        if 2 <= len(ch) <= 22 and not any(bad in ch for bad in ["提示词", "例如", "第一步", "请将", "根据", "图"]):
            return ch

    for key, val in EXACT_PHRASES:
        if key in prompt:
            return val

    quote_match = re.search(r'[「“『]([^」”』]{2,18})[」”』]', prompt)
    if quote_match:
        c = quote_match.group(1).strip()
        if not any(bad in c for bad in ["http", "例如", "输入", "上传", "请将", "根据", "人物设定", "背景照片"]):
            if len(c) >= 3:
                return c

    conv_match = re.search(r'(?:制作成|转化为|风格为|重构为|生成一张|创作一张|生成一幅)[「“]?([^，。；\n”]{2,16}(?:风|风格|插画|海报|明信片|拼贴|设计图|微缩|版画|肖像|色卡|绘本|卡片))[」”]?', prompt)
    if conv_match:
        c = conv_match.group(1).strip()
        if not any(bad in c for bad in ["http", "例如", "输入", "上传", "请将", "根据"]):
            return c

    return ""

results = []
missing = []
for h, p in styles_raw:
    if len(p) < 35:
        continue
    t = extract_title(p, h)
    if t:
        results.append((t, h, p[:60].replace('\n', ' ')))
    else:
        missing.append((h, p[:80].replace('\n', ' ')))

print(f"Total valid styles processed: {len(results) + len(missing)}")
print(f"Successfully named titles: {len(results)} ({len(results)/(len(results)+len(missing))*100:.1f}%)")
print(f"Remaining missing titles: {len(missing)}")

print("\nSample 15 Extracted Titles:")
for t, h, p in results[:15]:
    print(f"  Title: {t:22} | Snippet: {p[:40]}...")

if missing:
    print("\nSample 10 Missing Titles (to inspect and add rules for):")
    for h, p in missing[:10]:
        print(f"  Header: {h:12} | Snippet: {p}")
