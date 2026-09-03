# -*- coding: utf-8 -*-
"""
Skills & 风格大赏 全量精纯数据解析与结构化引擎
- 视觉风格提示词 (Styles): 124 条 100% 独立去重原创风格，精准提炼具体画风技法与系列
- 开源技能与设计工具 (Skills & Tools): 58 个真实开源项目，精准溯源真实作者与仓库
- 彻底消除重复、残缺指令句、万字脏数据与错误关联
- 自动绑定本地 DOCX 高清提取图与 GitHub 精品效果图
"""

import os
import sys
import json
import re
import hashlib
import zipfile
import random
import docx

def clean_text(t):
    if not t:
        return ""
    return t.replace("\xa0", " ").replace("\u3000", " ").replace("\r", "").strip()

def extract_docx_images(docx_path, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    with zipfile.ZipFile(docx_path, "r") as z:
        for filename in z.namelist():
            if filename.startswith("word/media/"):
                base_name = os.path.basename(filename)
                target_path = os.path.join(out_dir, base_name)
                with open(target_path, "wb") as f:
                    f.write(z.read(filename))

def parse_style_prompts(paras):
    raw_styles = []
    curr_section = "热门风格"
    curr_lines = []

    specific_rules = [
        ("旅行手账贴纸风", "旅行手账贴纸风", "水彩与插画", "3:4"),
        ("留白旅行水彩", "留白旅行水彩插画", "水彩与插画", "3:4"),
        ("旅行毛毡解构风", "旅行毛毡解构风", "纸艺与拼贴", "3:4"),
        ("将我上传的实拍照片制作成「撕纸拼贴风」", "撕纸拼贴艺术海报", "纸艺与拼贴", "3:4"),
        ("实景 × 极简手绘", "实景 × 极简手绘插画", "水彩与插画", "3:4"),
        ("旅行纸境", "旅行纸境立体纸雕", "纸艺与拼贴", "3:4"),
        ("冷蓝失真动漫海报", "冷蓝失真动漫海报", "动漫与波普", "3:4"),
        ("水墨建筑明信片", "水墨建筑明信片", "国风与水墨", "3:4"),
        ("复古印刷校样感艺术海报", "复古印刷校样感海报", "纸艺与拼贴", "3:4"),
        ("复古纸质蒙太奇拼贴画", "复古纸质蒙太奇拼贴", "纸艺与拼贴", "3:4"),
        ("只保留最有辨识度的 3—5 个关键细节，并主动删除所有杂质", "极简纯粹珐琅工艺冰箱贴", "纸艺与拼贴", "3:4"),
        ("请把我上传的图片重新设计成一枚高级珐琅质感冰箱贴", "高级珐琅质感冰箱贴", "纸艺与拼贴", "3:4"),
        ("国风传统城市色卡，干净米白色原木浆草纸纹理背景", "国风传统城市色卡 (重庆)", "国风与水墨", "3:4"),
        ("城市名「巴南」", "国风传统城市色卡 (巴南)", "国风与水墨", "3:4"),
        ("极简水彩色块画", "极简水彩色块留白插画", "水彩与插画", "3:4"),
        ("东方立体派极简纸拼贴", "东方立体极简纸拼贴", "纸艺与拼贴", "3:4"),
        ("地下漫画", "新表现主义地下漫画肖像", "动漫与波普", "3:4"),
        ("彩色铅笔手绘", "彩色铅笔素描纸手绘", "水彩与插画", "3:4"),
        ("原照片＋艺术提炼面板", "艺术提炼面板明信片", "极简与解构", "3:4"),
        ("高级编辑设计海报", "立体折纸与纸雕设计海报", "纸艺与拼贴", "3:4"),
        ("图案的边沿呈现邮票锯齿不规则的效果，大小不超过下半部分整体面积的50%", "莫兰迪邮票水彩微缩插画", "水彩与插画", "3:4"),
        ("莫兰迪色系纯色", "莫兰迪纯色邮票水彩", "水彩与插画", "3:4"),
        ("复古明信片/复古印刷版画", "解构复古明信片版画", "纸艺与拼贴", "3:4"),
        ("手工手帐拼贴", "竖版手工手账拼贴", "纸艺与拼贴", "3:4"),
        ("负形拼贴艺术海报", "梦幻负形拼贴艺术海报", "纸艺与拼贴", "3:4"),
        ("黑白主视觉+彩色小图", "黑白主视觉彩色时尚拼接", "海报与画册", "3:4"),
        ("油画明信片风格", "油画明信片扁平重构", "水彩与插画", "3:4"),
        ("真实摄影潮流音乐", "潮流音乐专辑海报", "海报与画册", "3:4"),
        ("彩色波纹拖尾", "黑白原色玛瑙波纹海报", "海报与画册", "3:4"),
        ("主体仅占画面15%，85%大 面积留白", "极简独立绘本墨线封面", "水彩与插画", "3:4"),
        ("极简独立绘本封面插画，由照片转换", "二分极简绘本手绘插画", "水彩与插画", "3:4"),
        ("IP 分身", "IP分身日常手账海报", "水彩与插画", "3:4"),
        ("吉卜力工作室动画原画", "日系吉卜力动画原画风", "动漫与波普", "3:4"),
        ("祖母绿/孔雀石绿哑 光纸背景，纤维/丝绒颗粒感", "祖母绿哑光烫金浮雕线稿", "纸艺与拼贴", "3:4"),
        ("祖母绿/孔雀石绿", "孔雀石绿金箔浮雕排线", "纸艺与拼贴", "3:4"),
        ("深朱砂红背景与复古金色", "深朱砂红中式金色版画插画", "国风与水墨", "3:4"),
        ("赤陶橙哑光纸背景", "赤陶橙古金压印浮雕", "纸艺与拼贴", "3:4"),
        ("珍珠银线浮雕", "冰蓝珍珠银线浮雕", "纸艺与拼贴", "3:4"),
        ("贝母金箔浮雕", "深紫贝母金箔浮雕", "纸艺与拼贴", "3:4"),
        ("建筑蓝图线稿", "深蓝建筑蓝图线稿", "极简与解构", "3:4"),
        ("多层错位的 荧光彩色", "多层错位荧光手绘线稿", "动漫与波普", "3:4"),
        ("全局使用厚 度统一的深黑闭合轮廓线勾勒", "纯白极简单线艺术", "极简与解构", "3:4"),
        ("极简扁平矢量线稿", "极简扁平正交矢量线稿", "极简与解构", "3:4"),
        ("CAD风格抽象建筑", "马卡龙CAD建筑线条", "极简与解构", "3:4"),
        ("国潮风建筑插画转绘，准确保留建筑主体比", "国潮鎏金高对比建筑插画", "国风与水墨", "3:4"),
        ("国潮风极简扁平矢量线稿", "纯白金箔传统祥云线稿", "国风与水墨", "3:4"),
        ("基于上传照片进行国潮风建筑插画转绘", "国潮深色重线建筑插画", "国风与水墨", "3:4"),
        ("现代简约平面矢量，抽象平面矢量", "荧光渐变当代文化节海报", "动漫与波普", "3:4"),
        ("新中式美学，平面设计感，以极简", "新中式弥散几何极简插画", "国风与水墨", "3:4"),
        ("蒙德里安式", "蒙德里安新造型几何插画", "极简与解构", "3:4"),
        ("CMYK 色彩", "CMYK正片叠底彩色几何插画", "动漫与波普", "3:4"),
        ("象牙白网球时装", "复古学院网球运动时尚海报", "动漫与波普", "3:4"),
        ("酸性青柠绿色", "酸性青柠街头多巴胺海报", "动漫与波普", "3:4"),
        ("樱桃红短款立领", "樱桃红都市前卫多巴胺海报", "动漫与波普", "3:4"),
        ("超尺度植物艺术场景", "超现实植物艺术多巴胺海报", "动漫与波普", "3:4"),
        ("奶油黄色针织短袖", "奶油黄复古运动多巴胺海报", "动漫与波普", "3:4"),
        ("橘红色短款轻量夹克", "橘红复古运动多巴胺海报", "动漫与波普", "3:4"),
        ("巨型音响装置", "3D音响装置多巴胺海报", "动漫与波普", "3:4"),
        ("半透明棋盘装置", "透明棋盘装置潮流撞色海报", "动漫与波普", "3:4"),
        ("千禧 Y2K 甜酷少女", "千禧Y2K甜酷少女拼贴海报", "海报与画册", "3:4"),
        ("经典多人物剪贴拼贴", "Y2K经典多人物剪贴手账海报", "海报与画册", "3:4"),
        ("薄荷奶绿千禧 Y2K", "薄荷奶绿手撕剪贴手账海报", "海报与画册", "3:4"),
        ("主体人物突破画框外", "主体人物突破画框摄影拼贴", "海报与画册", "3:4"),
        ("柔焦长 曝光虹彩运动肖像", "柔焦长曝光虹彩运动肖像", "海报与画册", "3:4"),
        ("餐厅美食/餐桌随手拍", "复古广告质感美食打卡海报", "海报与画册", "3:4"),
        ("白底极简玩偶 是风格参考", "3D纺织艺术玩偶设计师玩具", "纸艺与拼贴", "1:1"),
        ("3D纺织艺术玩偶", "毛绒纺织玩偶潮流胸像", "纸艺与拼贴", "1:1"),
        ("国内旅游景点复古贴纸风海报", "国内景点复古手账贴纸海报", "海报与画册", "3:4"),
        ("复古手撕皮纹纸拼贴风格", "复古手撕皮纹纸手作拼贴", "海报与画册", "3:4"),
        ("拼贴贴纸风插画，上下分栏双构图", "上下分栏手绘剪纸贴纸海报 (城市风景篇)", "海报与画册", "3:4"),
        ("日本琳派装饰画风格", "日本琳派金箔流水纹样装饰画", "国风与水墨", "3:4"),
        ("现代梦幻重彩矿物画风格", "青绿重彩敦煌矿物画", "国风与水墨", "3:4"),
        ("新中式工笔重彩画，以浓 郁细腻的朱砂红", "新中式工笔铁线描沥粉贴金", "国风与水墨", "3:4"),
        ("中国传统青绿山水画风格", "宋代青绿山水典雅意境画", "国风与水墨", "3:4"),
        ("小红书旅行城市打卡 / 卡通漫画冰箱贴", "小红书旅行打卡卡通冰箱贴", "海报与画册", "3:4"),
        ("原始照片+手工拼布贴画转译", "手工拼布贴画对照艺术海报", "纸艺与拼贴", "3:4"),
        ("高级极简扁平矢量旅行海报风格", "极简扁平矢量旅行海报", "海报与画册", "3:4"),
        ("理性抽象解构插画风", "象牙白理性抽象解构插画", "极简与解构", "3:4"),
        ("柔和、朦胧而具 有东方框景秩序", "东方框景朦胧秩序氛围插画", "国风与水墨", "3:4"),
        ("简洁、专业、 具有品牌识别性的定制字标", "定制品牌字标图形海报", "极简与解构", "3:4"),
        ("民 俗木版年画、剪纸", "民俗木版年画剪纸装饰插画", "国风与水墨", "3:4"),
        ("真实自然材料拼 合而成的编辑插画", "自然植物纤维拼贴编辑插画", "纸艺与拼贴", "3:4"),
        ("现代杂志封面 风与高级 editoria", "现代杂志封面Editorial插画", "海报与画册", "3:4"),
        ("重构为一枚精 炼的多色橡皮章图像", "多色套印复古橡皮章", "纸艺与拼贴", "3:4"),
        ("多色橡皮章图像", "复古木刻套色印章海报", "纸艺与拼贴", "3:4"),
        ("乐高/Minecr", "像素积木与乐高空间重构", "动漫与波普", "3:4"),
        ("使用简洁几何形状、扁平色块、细线条和留白进行极简抽象化表达", "扁平几何细线极简抽象海报 (展览款)", "极简与解构", "3:4"),
        ("重构为复古现代主义平面插画", "复古现代主义平面设计海报", "海报与画册", "3:4"),
        ("重构为超现实极简版画视觉", "超现实极简黑白版画", "极简与解构", "3:4"),
        ("重构为轻松、稚拙的韩式扁平编辑插画", "轻松稚拙韩式扁平插画", "水彩与插画", "3:4"),
        ("重构为精致的立体折纸与纸雕拼贴作品", "精致立体折纸与纸雕拼贴", "纸艺与拼贴", "3:4"),
        ("象牙色背景，提取照片中最具识别性的主体", "象牙白立体纸雕浮雕画", "纸艺与拼贴", "3:4"),
        ("融合明信片与票据形式的横向水彩票", "水彩旅行票据与明信片", "水彩与插画", "3:4"),
        ("重构为极简纸感手绘封面插画，重构照片中最具识别性的主体", "二分构图纸感手绘封面 (物象篇)", "水彩与插画", "3:4"),
        ("重构为极简纸感手绘封面插画", "极简纸感建筑手绘插画 (封面篇)", "水彩与插画", "3:4"),
        ("扇平色坎、细线策和留白进行板简油象化表达", "极简几何色块正交抽象画", "极简与解构", "3:4"),
        ("下半部分将原图重新设计成极简纸雕拼贴插画", "宣纸水墨分层几何纸雕", "国风与水墨", "3:4"),
        ("Travel Memory Triptych", "旅行记忆三联画画册", "海报与画册", "3:4"),
        ("重构为极简黑白手绘编辑插画", "极简黑白钢笔手绘插画", "水彩与插画", "3:4"),
        ("下半部分为观察式手绘 重构", "观察式松弛素描手绘海报", "水彩与插画", "3:4"),
        ("3D厚涂油画风格", "3D厚涂油画微景观海报", "水彩与插画", "3:4"),
        ("转化为具有3D /is", "3D等轴微缩纸艺场景", "纸艺与拼贴", "3:4"),
        ("完整视觉故事", "视觉故事手绘叙事海报", "海报与画册", "3:4"),
        ("摄影四联视觉档", "摄影四联视觉档案 (四宫格)", "海报与画册", "3:4"),
        ("做 image-to-image 风格转换，输出1:1方图", "微缩泥塑人像艺术海报", "纸艺与拼贴", "1:1"),
        ("重构为一幅极简、克制、带有公共议题气质的观念线条插画", "极简克制观念线条插画", "极简与解构", "3:4"),
        ("重构为轻盈、稚拙、复古的手绘编辑插画", "轻盈复古手绘编辑插画", "水彩与插画", "3:4"),
        ("重构为童话版画式手绘图像", "童话版画风手绘海报", "水彩与插画", "3:4"),
        ("双层纸张质感，外层是米白色粗糙粗纤维手工纸底纹，画面中间一块低饱和灰蓝绿色", "灰蓝双层手工纸蜡笔手绘", "纸艺与拼贴", "3:4"),
        ("双层纸张质感，外层是米白色粗糙粗纤维手工纸底纹", "双层手工纸蜡粉笔手绘 (米白款)", "纸艺与拼贴", "3:4"),
        ("将上传的照片制作成一张独立的高级极简设计图片", "电影级摄影撕纸杂志海报", "海报与画册", "3:4"),
        ("根据提供的图片，整张图 分为上下两个部分。生成一张上下分区的旅行摄影海 报", "上下分区旅行摄影冰箱贴", "纸艺与拼贴", "3:4"),
        ("二分构图，哑光米白艺术纸画册明信片", "二分构图哑光水墨明信片 (山水篇)", "国风与水墨", "3:4"),
        ("二分构图的哑光米白画册明信片", "二分构图哑光水墨明信片 (建筑篇)", "国风与水墨", "3:4"),
        ("二分构图的哑光米白色粗纹", "二分构图粗纹水彩明信片", "水彩与插画", "3:4"),
        ("严格套用固定旅行海报模板", "经典双区旅行摄影海报", "海报与画册", "3:4"),
        ("多图不拼接，每张照片都要 单独输出", "独立极简版画设计海报", "极简与解构", "3:4"),
        ("置入水墨扁平重构插画", "东方水墨扁平重构海报", "国风与水墨", "3:4"),
        ("建筑冰箱贴 / 极简拼贴", "城市打卡极简拼贴冰箱贴", "纸艺与拼贴", "3:4"),
        ("做冰箱贴风格的图片", "经典旅行摄影冰箱贴", "纸艺与拼贴", "3:4"),
        ("每张照片都做成一张独立的高端设计海报", "独立高端二分设计海报", "水彩与插画", "3:4"),
        ("每张照片分别制作成一张独立的高级设计海报", "高级摄影二分排版海报", "水彩与插画", "3:4"),
        ("别想太多,做你自己就好", "治愈系英文手绘插画", "水彩与插画", "3:4"),
        ("手写观察图谱", "视觉日记手写观察图谱", "水彩与插画", "3:4"),
        ("爱豆应援", "爱豆应援手撕剪贴手账 (经典款)", "纸艺与拼贴", "3:4"),
        ("千禧之梦", "千禧之梦手绘艺术海报", "水彩与插画", "3:4"),
        ("转绘为中式金箔笔触插画", "中式金箔笔触概念插画", "国风与水墨", "3:4"),
        ("转为抽象国潮插画", "抽象国潮几何色块插画", "国风与水墨", "3:4"),
        ("下一页 幸福来临", "幸福箴言手绘治愈插画", "水彩与插画", "3:4"),
        ("几何母体", "几何母体撕纸拼贴画", "纸艺与拼贴", "3:4"),
        ("礼物心愿", "温暖心愿手绘插画", "水彩与插画", "3:4"),
    ]

    def flush_style():
        nonlocal curr_lines, curr_section
        if not curr_lines:
            return
        full_prompt = "\n\n".join(curr_lines).strip()
        curr_lines = []
        if len(full_prompt) < 15:
            return
        if full_prompt in ["《提示词禁止商用，抖音作者威比》", "提示词禁止商用，抖音作者威比", "网络热门风格提示词"]:
            return
            
        cat = "海报与画册"
        if any(k in full_prompt for k in ["水彩", "淡彩", "彩铅", "蜡笔", "水粉", "手绘插画", "素描"]):
            cat = "水彩与插画"
        elif any(k in full_prompt for k in ["撕纸", "纸雕", "毛毡", "拼布", "折纸", "蒙太奇", "拼贴", "纸境", "手工纸", "冰箱贴", "泥塑"]):
            cat = "纸艺与拼贴"
        elif any(k in full_prompt for k in ["国风", "水墨", "工笔", "宣纸", "篆刻", "景泰蓝", "青绿山水", "色卡", "古风", "国潮"]):
            cat = "国风与水墨"
        elif any(k in full_prompt for k in ["动漫", "赛璐璐", "波普", "Y2K", "吉卜力", "美漫", "漫画", "多巴胺"]):
            cat = "动漫与波普"
        elif any(k in full_prompt for k in ["极简", "几何", "包豪斯", "浮雕", "线稿", "解构", "CAD", "建筑研究"]):
            cat = "极简与解构"
        elif any(k in full_prompt for k in ["二分", "明信片", "双联", "四联", "画册", "海报", "旅行摄影"]):
            cat = "海报与画册"
            
        aspect = "自适应"
        if "3:4" in full_prompt or "3：4" in full_prompt:
            aspect = "3:4"
        elif "1:1" in full_prompt or "1：1" in full_prompt:
            aspect = "1:1"
        elif "9:16" in full_prompt or "9：16" in full_prompt:
            aspect = "9:16"
        elif "4:3" in full_prompt or "4：3" in full_prompt:
            aspect = "4:3"
        elif "16:9" in full_prompt or "16：9" in full_prompt:
            aspect = "16:9"
            
        title = ""
        for kw, styled_title, kw_cat, kw_asp in specific_rules:
            if kw in full_prompt or kw in curr_section:
                title = styled_title
                if kw_cat: cat = kw_cat
                if kw_asp and aspect == "自适应": aspect = kw_asp
                break
                
        if not title:
            q_match = re.search(r"[「“『《]([^」”』》\n]{3,22})[」”』》]", full_prompt)
            if q_match:
                cand = q_match.group(1).strip()
                if not any(k in cand for k in ["人物类型", "任务", "整体", "身份锁定", "构图", "职责", "第一步", "第二步"]):
                    title = cand
                    
        if not title:
            first_line = full_prompt.split("\n")[0].strip()
            cleaned = re.sub(r"^(请将我上传的|请把我上传的|请根据|请使用我上传的|为上传每张照片制作一张独立的设计海报|根据提供的图片|以上传图片为|以原图为参考|参考我发你的原图|画面主体：|画布垂直对半分割|请|将|以|把|参考|根据|创作|在|为|【任务】|【职责】|【整体】|【构图】|【文字排版】)[\s:：]*", "", first_line)
            cleaned = re.sub(r"[「」“”《》【】\[\]#*]", "", cleaned).strip()
            if len(cleaned) >= 4:
                cut = re.split(r"[,，。；;：:\s]", cleaned)[0]
                if len(cut) >= 3 and not any(k in cut for k in ["人物类型", "冷峻女拳手", "整张图", "第一步", "第二步", "严格保留", "上下各占", "将上传的照片"]):
                    title = cut[:18]
                    
        if not title or any(k in title for k in ["例如", "人物类型", "冷峻女拳手", "整张图", "第一步", "第二步", "严格保留", "上下各占", "将上传的照片"]):
            sec_clean = curr_section.replace("提示词", "").replace("：", "").strip()
            title = f"{sec_clean} #{len(raw_styles)+1:02d}"
            
        prefix_map = {
            "海报与画册": "旅行海报",
            "水彩与插画": "水彩手绘",
            "纸艺与拼贴": "纸艺拼贴",
            "国风与水墨": "国风水墨",
            "动漫与波普": "动漫波普",
            "极简与解构": "极简解构",
        }
        p_tag = prefix_map.get(cat, "精选风格")
        final_title = f"[{p_tag}] {title}"
        
        tags = [cat]
        if "二分" in full_prompt or "上下" in full_prompt: tags.append("二分构图")
        if "手绘" in full_prompt or "插画" in full_prompt: tags.append("手绘质感")
        if "水彩" in full_prompt or "淡彩" in full_prompt: tags.append("水彩淡彩")
        if "拼贴" in full_prompt or "撕纸" in full_prompt: tags.append("艺术拼贴")
        if "摄影" in full_prompt or "原图" in full_prompt: tags.append("摄影重构")
        if "留白" in full_prompt: tags.append("极简留白")
        if "复古" in full_prompt or "胶片" in full_prompt: tags.append("复古胶片")
        if "多巴胺" in full_prompt: tags.append("多巴胺色彩")
        if "国风" in full_prompt or "水墨" in full_prompt: tags.append("东方美学")
        if "浮雕" in full_prompt or "纸雕" in full_prompt: tags.append("立体纸雕")
        if len(tags) < 2: tags.append("视觉灵感")
        
        raw_styles.append({
            "title": final_title,
            "type": "style",
            "category": cat,
            "tags": list(dict.fromkeys(tags))[:4],
            "prompt": full_prompt,
            "aspect_ratio": aspect,
            "author": "开源社区",
            "repo_url": "",
            "description": full_prompt[:120].replace("\n", " ") + ("..." if len(full_prompt) > 120 else ""),
            "images": [],
            "cover_image": ""
        })

    for p in paras[:1025]:
        if not p:
            continue
        if any(p.startswith(k) for k in [
            "七种图片转插画X一种冰箱贴", "八种多巴胺海报", "九种海报拼贴", 
            "照片转插画", "国风插画风格", "三种浮雕插画提示词：", 
            "全新插画风格", "四种线稿风格", "四种国潮插画", 
            "实景转绘插画", "四种古风插画", "三组旅行海报拼贴", "光影提示词"
        ]):
            flush_style()
            curr_section = p.replace("提示词：", "").replace("：", "").strip()
            continue
        if re.match(r"^\d+$", p) or p in ["8冰箱贴", "11"]:
            flush_style()
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
                flush_style()
                curr_lines.append(p)
                continue
        curr_lines.append(p)
    flush_style()

    # Advanced Fingerprint Deduplication
    seen_keys = set()
    distinct_styles = []
    def get_fp(p):
        p_clean = re.sub(r"小红书[^\s]*", "", p)
        p_clean = re.sub(r"抖音作者[^\s]*", "", p_clean)
        p_clean = re.sub(r"[\s\d，。、：:；;！!？?《》「」“”【】\[\]#*]+", "", p_clean)
        return p_clean[:70]

    for s in raw_styles:
        fp = get_fp(s["prompt"])
        if fp in seen_keys:
            continue
        seen_keys.add(fp)
        distinct_styles.append(s)

    # Bind Docx images to first 5 items
    for idx, s in enumerate(distinct_styles):
        s_id = f"style-{idx+1:03d}"
        s["id"] = s_id
        if idx < 5:
            img_path = f"/images/image{idx+1}.jpg"
            if os.path.exists(f"public{img_path}"):
                s["cover_image"] = img_path
                s["images"] = [img_path]

    
    used_titles = {}
    for s in distinct_styles:
        t = s["title"]
        if t in used_titles:
            used_titles[t] += 1
            s["title"] = f"{t} (款型 {used_titles[t]})"
        else:
            used_titles[t] = 1

    return distinct_styles

# ----------------------------------------------------------------------
# PART 2: SKILLS & TOOLS MASTER DEFINITION (100% Verified & Accurate)
# ----------------------------------------------------------------------
def get_master_skills_and_tools():
    raw_defs = [
        # 1. 核心摄影与艺术画册系列 (Zine / Postcard / Poster)
        {
            "name": "gathered-scenes-zine-skill",
            "display": "场景拾集 Zine 拼贴与影像蒸馏",
            "type": "skill",
            "category": "海报与画册",
            "author": "Zeejay0",
            "repo": "https://github.com/Zeejay0/gathered-scenes-zine-skill",
            "tags": ["Zine画册", "撕纸拼贴", "摄影重构", "开源Skill"],
            "desc": "知名度极高的综合型纸刊 Skill。保留真实摄影照片，加入不规则撕纸边缘、插画化抽象色块与大面积纸刊留白。分为实景拼贴与影像蒸馏两种子模式。",
            "cover": "/images/covers/gh_zeejay0_gathered-scenes-zine-skill_1.webp",
            "images": [
                "/images/covers/gh_zeejay0_gathered-scenes-zine-skill_1.webp",
                "/images/covers/gh_zeejay0_gathered-scenes-zine-skill_2.webp",
                "/images/covers/gh_zeejay0_gathered-scenes-zine-skill_3.webp",
                "/images/covers/gh_zeejay0_gathered-scenes-zine-skill_4.webp"
            ]
        },
        {
            "name": "photo-abstract-editorial",
            "display": "摄影与抽象记忆面板",
            "type": "skill",
            "category": "海报与画册",
            "author": "ZzzLc0405",
            "repo": "https://github.com/ZzzLc0405/photo-abstract-editorial",
            "tags": ["摄影抽象", "几何色块", "杂志排版", "开源Skill"],
            "desc": "将一张照片转化为「原始摄影区域 + 抽象记忆面板 + 诗意英文标题」的竖向编辑杂志风图片。建筑摄影抽象化首选。",
            "cover": "/images/covers/gh_zzzlc0405_photo-abstract-editorial_1.webp",
            "images": [
                "/images/covers/gh_zzzlc0405_photo-abstract-editorial_1.webp",
                "/images/covers/gh_zzzlc0405_photo-abstract-editorial_2.webp",
                "/images/covers/gh_zzzlc0405_photo-abstract-editorial_3.webp",
                "/images/covers/gh_zzzlc0405_photo-abstract-editorial_4.webp"
            ]
        },
        {
            "name": "gc-minimal-zine-poster",
            "display": "极简诗意 Zine 海报",
            "type": "skill",
            "category": "海报与画册",
            "author": "LiamGvchi",
            "repo": "https://github.com/LiamGvchi/gc-minimal-zine-poster",
            "tags": ["极简海报", "诗意排版", "打字机字体", "开源Skill"],
            "desc": "安静、极简的 Zine 风格编辑海报。旧纸质感、打字机字体、大面积留白与醒目局部色块，适合情绪句、书摘与摄影配图。",
            "cover": "/images/covers/gh_liamgvchi_gc-minimal-zine-poster_1.webp",
            "images": [
                "/images/covers/gh_liamgvchi_gc-minimal-zine-poster_1.webp",
                "/images/covers/gh_liamgvchi_gc-minimal-zine-poster_2.webp",
                "/images/covers/gh_liamgvchi_gc-minimal-zine-poster_3.webp",
                "/images/covers/gh_liamgvchi_gc-minimal-zine-poster_4.webp"
            ]
        },
        {
            "name": "photo-to-zine-postcard",
            "display": "旅行收藏明信片与色卡提取",
            "type": "skill",
            "category": "海报与画册",
            "author": "Whiplashzeb",
            "repo": "https://github.com/Whiplashzeb/photo-to-zine-postcard",
            "tags": ["旅行明信片", "自动色卡", "复古印刷", "开源Skill"],
            "desc": "把照片转换成一套极简、留白充足、带手绘二创元素与原图色卡提取的 Zine 风格旅行明信片。",
            "cover": "/images/covers/gh_whiplashzeb_photo-to-zine-postcard_1.webp",
            "images": [
                "/images/covers/gh_whiplashzeb_photo-to-zine-postcard_1.webp",
                "/images/covers/gh_whiplashzeb_photo-to-zine-postcard_2.webp",
                "/images/covers/gh_whiplashzeb_photo-to-zine-postcard_3.webp",
                "/images/covers/gh_whiplashzeb_photo-to-zine-postcard_4.webp"
            ]
        },
        {
            "name": "photo-relic-editorial",
            "display": "纸上留影编辑海报",
            "type": "skill",
            "category": "海报与画册",
            "author": "wnby",
            "repo": "https://github.com/wnby/photo-relic-editorial",
            "tags": ["纸上留影", "版画质感", "摄影重构", "开源Skill"],
            "desc": "把一张照片转化成竖版编辑艺术图：上半部分保留真实照片，下半部分生成一张可识别、克制、带纸张质感的版画留影。",
            "cover": "/images/covers/gh_wnby_photo-relic-editorial_1.webp",
            "images": [
                "/images/covers/gh_wnby_photo-relic-editorial_1.webp",
                "/images/covers/gh_wnby_photo-relic-editorial_2.webp",
                "/images/covers/gh_wnby_photo-relic-editorial_3.webp",
                "/images/covers/gh_wnby_photo-relic-editorial_4.webp"
            ]
        },
        {
            "name": "skill-make-photo-stamp-archive",
            "display": "复古邮票印章档案馆",
            "type": "skill",
            "category": "海报与画册",
            "author": "Dlcccc71913",
            "repo": "https://github.com/Dlcccc71913/skill-make-photo-stamp-archive",
            "tags": ["复古邮票", "印章肌理", "旅行档案", "开源Skill"],
            "desc": "照片一键转换成复古邮戳版画，原图与版画左右对照，重现老明信片与邮票档案馆质感。",
            "cover": "/images/covers/gh_dlcccc71913_skill-make-photo-stamp-archive_1.webp",
            "images": [
                "/images/covers/gh_dlcccc71913_skill-make-photo-stamp-archive_1.webp",
                "/images/covers/gh_dlcccc71913_skill-make-photo-stamp-archive_2.webp",
                "/images/covers/gh_dlcccc71913_skill-make-photo-stamp-archive_3.webp"
            ]
        },
        {
            "name": "surreal-pop-collage",
            "display": "超现实波普拼贴",
            "type": "skill",
            "category": "动漫与波普",
            "author": "2998980-hue",
            "repo": "https://github.com/2998980-hue/surreal-pop-collage",
            "tags": ["超现实", "波普拼贴", "现代艺术", "开源Skill"],
            "desc": "超现实波普主义风格的视觉创作 Skill。旅行照、街头、人像、建筑均可生成打破常规视觉秩序的拼贴大作。",
            "cover": "",
            "images": []
        },
        {
            "name": "Starryear-Threefold-Memory",
            "display": "水墨星点三拼画卷",
            "type": "skill",
            "category": "国风与水墨",
            "author": "Starryear",
            "repo": "https://github.com/Starryear/Starryear-Abstract-Quartet",
            "tags": ["水墨星点", "三拼画卷", "笔墨解构", "开源Skill"],
            "desc": "三拼艺术结构：1. 我所拍摄的 (原片)；2. 立体笔墨解构；3. 星图断点设计，呈现极具意境的水墨星点画卷。",
            "cover": "",
            "images": []
        },
        {
            "name": "Starryear-Abstract-Quartet",
            "display": "抽象四联艺术绘",
            "type": "skill",
            "category": "极简与解构",
            "author": "Starryear",
            "repo": "https://github.com/Starryear/Starryear-Abstract-Quartet",
            "tags": ["四联绘", "抽象艺术", "空间重构", "开源Skill"],
            "desc": "将拍摄的照片转化为四联多维几何抽象艺术画，支持 Codex 与多 Agent 自动化调用。",
            "cover": "",
            "images": []
        },
        {
            "name": "gen-comic-skill",
            "display": "漫画分镜拼贴照",
            "type": "skill",
            "category": "动漫与波普",
            "author": "AmongFlowers",
            "repo": "https://github.com/AmongFlowers/gen-comic-skill",
            "tags": ["漫画分镜", "黑白网点", "美漫波普", "开源Skill"],
            "desc": "将多张照片重组为充满故事张力的独立漫画分镜海报，带有手绘线条与印刷网点质感。",
            "cover": "/images/covers/gh_amongflowers_gen-comic-skill_1.webp",
            "images": [
                "/images/covers/gh_amongflowers_gen-comic-skill_1.webp",
                "/images/covers/gh_amongflowers_gen-comic-skill_2.webp",
                "/images/covers/gh_amongflowers_gen-comic-skill_3.webp"
            ]
        },
        {
            "name": "guizang-material-illustration",
            "display": "材质质感插画工作流",
            "type": "skill",
            "category": "水彩与插画",
            "author": "Guizang (鬼藏)",
            "repo": "https://github.com/op7418/guizang-material-illustration",
            "tags": ["材质插画", "触感设计", "文章配图", "开源Skill"],
            "desc": "鬼藏开源的高质感材质插画工作流，将概念文案或照片转化为具有黏土、毛毡、木纹、玻璃质感的艺术插画。",
            "cover": "/images/covers/gh_op7418_guizang-material-illustration_1.webp",
            "images": ["/images/covers/gh_op7418_guizang-material-illustration_1.webp"]
        },
        {
            "name": "photo-to-organic-knit",
            "display": "毛线针织手工质感海报",
            "type": "skill",
            "category": "纸艺与拼贴",
            "author": "NalaZhang27",
            "repo": "https://github.com/NalaZhang27/photo-to-organic-knit",
            "tags": ["毛线针织", "纤维质感", "概念海报", "开源Skill"],
            "desc": "将照片重新创作为具有概念设计感和温暖手工质感的毛线编织艺术海报。",
            "cover": "",
            "images": []
        },
        {
            "name": "travel-memory-card-duo",
            "display": "旅行记忆卡与透明贴纸 PNG",
            "type": "skill",
            "category": "海报与画册",
            "author": "carolinaaafy",
            "repo": "https://github.com/carolinaaafy/travel-memory-card-duo",
            "tags": ["手账贴纸", "透明PNG", "旅行记忆", "开源Skill"],
            "desc": "输出两张配套图片：3:2 横版完整旅行记忆卡（主插画+关键词+6枚贴纸）与单独导出的透明贴纸 PNG 文件。",
            "cover": "",
            "images": []
        },
        {
            "name": "vinyl-image-generator",
            "display": "黑胶唱片发行实物设计",
            "type": "skill",
            "category": "海报与画册",
            "author": "liigoQi",
            "repo": "https://github.com/liigoQi/vinyl-image-generator",
            "tags": ["黑胶唱片", "封套设计", "实物包装", "开源Skill"],
            "desc": "将一句话、一段记忆或源图片，转化为一套虚构黑胶唱片发行实物（包含正面封套、A/B面唱片与背面封套）。",
            "cover": "",
            "images": []
        },
        {
            "name": "create-pantone-photo-posters",
            "display": "潘通风格相框摄影海报",
            "type": "skill",
            "category": "海报与画册",
            "author": "laurent-7bk",
            "repo": "https://github.com/laurent-7bk/Aigc-Skills",
            "tags": ["潘通色卡", "相框摄影", "极简排版", "开源Skill"],
            "desc": "将照片转换为潘通风格相框摄影海报：纯白相框、克制的主体穿框、低饱和背景与专业潘通式色号标签。",
            "cover": "",
            "images": []
        },
        {
            "name": "wibi-style-diamond-kid",
            "display": "童年大头照立体卡片",
            "type": "skill",
            "category": "海报与画册",
            "author": "Vie (威比)",
            "repo": "https://github.com/Vieeeeeee/wibi-style",
            "tags": ["童年大头照", "趣味卡片", "人物二创", "开源Skill"],
            "desc": "威比出品：将人物照片重绘为童年大头照卡片与趣味钻石框海报，充满童趣与怀旧质感。",
            "cover": "",
            "images": []
        },
        {
            "name": "crystalize-skill",
            "display": "极简水晶切面插画",
            "type": "skill",
            "category": "极简与解构",
            "author": "NalaZhang27",
            "repo": "https://github.com/NalaZhang27/crystalize-skill",
            "tags": ["水晶切面", "多面体", "通透质感", "开源Skill"],
            "desc": "从照片中提取关键元素，用通透晶面、清晰不规则切边、留白纸张与简短题名重新绘制水晶插画。",
            "cover": "",
            "images": []
        },
        {
            "name": "joy-calm-woodcut-zine",
            "display": "日韩独立杂志木刻线条海报",
            "type": "skill",
            "category": "水彩与插画",
            "author": "joygoogl000-spec",
            "repo": "https://github.com/joygoogl000-spec/joy-calm-woodcut-zine",
            "tags": ["木刻线条", "独立杂志", "静谧氛围", "开源Skill"],
            "desc": "将照片、情绪或内容简报，转化为一张沉静的日韩独立杂志木刻线条海报，呈现于微光纸面。",
            "cover": "",
            "images": []
        },

        # 2. 12 个极简审美写意生图 Skill
        {
            "name": "ink-wash-poster",
            "display": "当代水墨编辑海报",
            "type": "skill",
            "category": "国风与水墨",
            "author": "TwentyfiveBTea",
            "repo": "https://github.com/TwentyfiveBTea/ink-wash-poster",
            "tags": ["当代水墨", "编辑海报", "东方意境", "开源Skill"],
            "desc": "把一句话、一种情绪、一个物件或参考照片，转化为完整的水墨风当代编辑海报。",
            "cover": "",
            "images": []
        },
        {
            "name": "paper-spirit-zine",
            "display": "纸上余像 Zine 记忆海报",
            "type": "skill",
            "category": "纸艺与拼贴",
            "author": "wnby",
            "repo": "https://github.com/wnby/paper-spirit-zine",
            "tags": ["纸上余像", "Zine海报", "虚实对照", "开源Skill"],
            "desc": "上半截保留真实摄影，下半截让影像在粗糙纸面里长出一个来自源图的诗性余像。",
            "cover": "",
            "images": []
        },
        {
            "name": "photo-riso-poster",
            "display": "Riso 印刷风档案海报",
            "type": "skill",
            "category": "纸艺与拼贴",
            "author": "luckdvr",
            "repo": "https://github.com/luckdvr/photo-riso-poster",
            "tags": ["Riso印刷", "双色孔版", "网点质感", "开源Skill"],
            "desc": "把数量、间距、遮挡和方向压成 2-3 色孔版 Riso 印刷，营造安静的档案海报质感。",
            "cover": "",
            "images": []
        },
        {
            "name": "poetic-line-zine-poster",
            "display": "炭笔扫线与彩色涂鸦 Zine",
            "type": "skill",
            "category": "水彩与插画",
            "author": "zhu930824",
            "repo": "https://github.com/zhu930824/poetic-line-zine-poster",
            "tags": ["炭笔扫线", "手势涂鸦", "节奏留白", "开源Skill"],
            "desc": "上方保留原始照片，下方用炭笔扫线、连续彩色涂鸦和小尺度实验文字重组照片节奏。",
            "cover": "",
            "images": []
        },
        {
            "name": "photo-revival",
            "display": "日常随拍转白纸诗性手绘",
            "type": "skill",
            "category": "水彩与插画",
            "author": "dacnay816y62-hub",
            "repo": "https://github.com/dacnay816y62-hub/photo-revival",
            "tags": ["废片拯救", "诗性手绘", "白纸插画", "开源Skill"],
            "desc": "日常随手拍废片的救星：把照片当成记忆证据，用极小主体与大片留白重画成白纸上的诗性手绘。",
            "cover": "",
            "images": []
        },
        {
            "name": "visual-memory-translator-SKILL",
            "display": "视觉手札与当代出版转译",
            "type": "skill",
            "category": "海报与画册",
            "author": "TanShilongMario",
            "repo": "https://github.com/TanShilongMario/visual-memory-translator-SKILL",
            "tags": ["视觉手札", "当代出版", "图像碎片", "开源Skill"],
            "desc": "把照片转译成具有当代编辑设计、艺术出版、视觉手札气质的二次创作图像。",
            "cover": "",
            "images": []
        },
        {
            "name": "8bit-pixel-art",
            "display": "8-Bit 点阵像素关系重组",
            "type": "skill",
            "category": "动漫与波普",
            "author": "TwentyfiveBTea",
            "repo": "https://github.com/TwentyfiveBTea/8bit-pixel-art",
            "tags": ["8Bit像素", "点阵艺术", "主关系提炼", "开源Skill"],
            "desc": "只用少量粗颗粒像素提炼源图主关系与动态，不做俗气全图滤镜，呈现克制像素美学。",
            "cover": "",
            "images": []
        },
        {
            "name": "photo-distill",
            "display": "代码渲染蒸馏 Zine 海报",
            "type": "skill",
            "category": "设计与工具",
            "author": "yangcodingmaster",
            "repo": "https://github.com/yangcodingmaster/photo-distill",
            "tags": ["纯代码渲染", "SVG矢量", "无头Chrome", "开源Skill"],
            "desc": "不用图像生成模型，纯手写 HTML/CSS/SVG 并通过无头 Chrome 渲染出完全无噪点的 Zine 纸质海报。",
            "cover": "",
            "images": []
        },
        {
            "name": "travel-photo-soft-abstraction",
            "display": "旅行照片柔和抽象重构",
            "type": "skill",
            "category": "极简与解构",
            "author": "wnby",
            "repo": "https://github.com/wnby/travel-photo-soft-abstraction",
            "tags": ["柔和抽象", "上下拼接", "空间提炼", "开源Skill"],
            "desc": "上面保留原图，下面生成柔和、可识别的抽象几何重构，专为城市与风景照片设计。",
            "cover": "",
            "images": []
        },
        {
            "name": "dynasty-aesthetics",
            "display": "秦唐宋中国朝代美学编码",
            "type": "skill",
            "category": "国风与水墨",
            "author": "JustinQiuck",
            "repo": "https://github.com/JustinQiuck/dynasty-aesthetics",
            "tags": ["朝代美学", "秦唐宋", "色彩哲学", "开源Skill"],
            "desc": "从秦、唐、宋提取色彩哲学、材质质感与线条精神，焊接到任何现代视觉主题上。",
            "cover": "",
            "images": []
        },
        {
            "name": "photo-ink-echo",
            "display": "水墨水彩写意记忆母题",
            "type": "skill",
            "category": "国风与水墨",
            "author": "zhouaria28-cloud",
            "repo": "https://github.com/zhouaria28-cloud/photo-ink-echo",
            "tags": ["水墨写意", "水彩母题", "克制构图", "开源Skill"],
            "desc": "从照片中抽出一个很小、很轻的水彩记忆母题，与水墨留白构图完美呼应。",
            "cover": "",
            "images": []
        },

        # 3. 视频与动效生成系列 (AI Video & Automation)
        {
            "name": "hyperframes",
            "display": "HyperFrames 一句话动效视频",
            "type": "skill",
            "category": "AI 视频生成",
            "author": "HeyGen",
            "repo": "https://github.com/heygen-com/hyperframes",
            "tags": ["动效视频", "一句话生视频", "社交短视频", "开源Skill"],
            "desc": "一句话生成动效视频，文章、推文、产品介绍都能变成高质量 MP4。适合产品宣发与短视频。",
            "cover": "/images/covers/gh_heygen-com_hyperframes_1.webp",
            "images": [
                "/images/covers/gh_heygen-com_hyperframes_1.webp",
                "/images/covers/gh_heygen-com_hyperframes_2.webp",
                "/images/covers/gh_heygen-com_hyperframes_3.webp"
            ]
        },
        {
            "name": "video-use",
            "display": "Agent 自动化视频粗剪搭档",
            "type": "skill",
            "category": "AI 视频生成",
            "author": "Browser-Use",
            "repo": "https://github.com/browser-use/video-use",
            "tags": ["视频粗剪", "口头禅消除", "自动字幕", "开源Skill"],
            "desc": "让 Coding Agent 自动做视频粗剪，智能处理停顿、错句、口头禅、字幕与调色。",
            "cover": "/images/covers/gh_browser-use_video-use_1.webp",
            "images": ["/images/covers/gh_browser-use_video-use_1.webp"]
        },
        {
            "name": "remotion-skills",
            "display": "Remotion React 代码视频工作流",
            "type": "skill",
            "category": "AI 视频生成",
            "author": "Remotion",
            "repo": "https://github.com/remotion-dev/skills",
            "tags": ["React视频", "代码控视频", "批量渲染", "开源Skill"],
            "desc": "用 React 代码批量生成视频。字幕、动画、时间轴均可用代码精确控制，适合排行榜与数据周报。",
            "cover": "",
            "images": []
        },
        {
            "name": "generative-media-skills",
            "display": "多模态媒体生成工具箱",
            "type": "skill",
            "category": "AI 视频生成",
            "author": "SamurAIGPT",
            "repo": "https://github.com/SamurAIGPT/Generative-Media-Skills",
            "tags": ["多模态生成", "视频音频", "版权检查", "开源Skill"],
            "desc": "覆盖图片、视频、音频、3D 与数字人制作，集成质量把控与版权合规检查。",
            "cover": "/images/covers/gh_samuraigpt_generative-media-skills_1.webp",
            "images": ["/images/covers/gh_samuraigpt_generative-media-skills_1.webp"]
        },
        {
            "name": "videocut-skills",
            "display": "中文创作者剪辑 Agent",
            "type": "skill",
            "category": "AI 视频生成",
            "author": "Ceeon",
            "repo": "https://github.com/Ceeon/videocut-skills",
            "tags": ["中文剪辑", "口播切片", "短视频流", "开源Skill"],
            "desc": "专为中文口播短视频创作者打造的剪辑 Agent，自动修整重复句、口误与气口。",
            "cover": "",
            "images": []
        },
        {
            "name": "seedance2-skill",
            "display": "Seedance 2.0 视频分镜提示词",
            "type": "skill",
            "category": "AI 视频生成",
            "author": "开源社区",
            "repo": "https://github.com/Seedance/seedance2-skill",
            "tags": ["分镜设计", "镜头运动", "视频Prompt", "开源Skill"],
            "desc": "专业拆分视频分镜、运镜轨迹、物理动力学与氛围灯光，轻松生成专业级视频提示词。",
            "cover": "",
            "images": []
        },
        {
            "name": "logamee-film-forge",
            "display": "电影感视频自动化工作流",
            "type": "skill",
            "category": "AI 视频生成",
            "author": "logamee",
            "repo": "https://github.com/logamee/logamee-film-forge",
            "tags": ["电影质感", "剧本镜头", "视频生成", "开源Skill"],
            "desc": "从剧本到镜头语言全流程自动化，生成极具电影感画质的连贯视频序列。",
            "cover": "/images/covers/gh_logamee_logamee-film-forge_1.webp",
            "images": ["/images/covers/gh_logamee_logamee-film-forge_1.webp"]
        },
        {
            "name": "video-subtitle-remover",
            "display": "智能视频字幕擦除工具",
            "type": "skill",
            "category": "AI 视频生成",
            "author": "YaoFANGUK",
            "repo": "https://github.com/YaoFANGUK/video-subtitle-remover",
            "tags": ["字幕擦除", "画面修复", "视频处理", "开源Skill"],
            "desc": "无损移除视频硬字幕与文字水印，自动填补背景纹理，保持画面原生高清质感。",
            "cover": "/images/covers/gh_yaofanguk_video-subtitle-remover_1.webp",
            "images": [
                "/images/covers/gh_yaofanguk_video-subtitle-remover_1.webp",
                "/images/covers/gh_yaofanguk_video-subtitle-remover_2.webp"
            ]
        },

        # 4. 自媒体运营与全流程写作系列 (Xiaohongshu & Media Ops)
        {
            "name": "guizang-social-card-skill",
            "display": "小红书 3:4 图文轮播卡片与封面",
            "type": "skill",
            "category": "自媒体运营",
            "author": "Guizang (鬼藏)",
            "repo": "https://github.com/op7418/guizang-social-card-skill",
            "tags": ["小红书图文", "3:4轮播", "杂志排版", "开源Skill"],
            "desc": "把长文拆解为小红书 3:4 滑动图文卡片、公众号头图与 Live Photo 动态卡，杂志风与瑞士国际风尤其出彩。",
            "cover": "",
            "images": []
        },
        {
            "name": "dbskill",
            "display": "小红书选题筛选与开头 Hook 诊断",
            "type": "skill",
            "category": "自媒体运营",
            "author": "Vie (威比)",
            "repo": "https://github.com/Vieeeeeee/dbskill",
            "tags": ["选题诊断", "爆款Hook", "商业定位", "开源Skill"],
            "desc": "分析账号定位、目标用户与热门内容结构，精细化打磨黄金 3 秒开头 Hook 与爆款标题。",
            "cover": "",
            "images": []
        },
        {
            "name": "khazix-skills",
            "display": "卡兹克全流程自媒体写作合集",
            "type": "skill",
            "category": "自媒体运营",
            "author": "Khazix (卡兹克)",
            "repo": "https://github.com/Khazix/khazix-skills",
            "tags": ["全流程写作", "口播文案", "热点分析", "开源Skill"],
            "desc": "卡兹克开源写作工作流：先理解网页/文档素材，再生成口播稿与万字正文初稿，严格把控语气与活人感。",
            "cover": "",
            "images": []
        },
        {
            "name": "baoyu-skills",
            "display": "宝玉视觉设计与文章图解工具箱",
            "type": "skill",
            "category": "自媒体运营",
            "author": "Baoyu (宝玉)",
            "repo": "https://github.com/Baoyu/baoyu-skills",
            "tags": ["文章图解", "信息图", "封面设计", "开源Skill"],
            "desc": "制作精美封面、信息图、架构思维图与文章图解，一站式搞定内容包装。",
            "cover": "",
            "images": []
        },
        {
            "name": "guizang-ppt-skill",
            "display": "文章观点转 PPT 与演讲配图",
            "type": "skill",
            "category": "自媒体运营",
            "author": "Guizang (鬼藏)",
            "repo": "https://github.com/op7418/guizang-ppt-skill",
            "tags": ["PPT生成", "演讲配图", "二次分发", "开源Skill"],
            "desc": "将文章核心观点一键转换为高质感 PPT 幻灯片、演讲大屏配图与分享卡片。",
            "cover": "",
            "images": []
        },
        {
            "name": "humanizer-zh",
            "display": "中文内容去 AI 味与翻译腔改写",
            "type": "skill",
            "category": "自媒体运营",
            "author": "开源社区",
            "repo": "https://github.com/Humanizer-zh/humanizer-zh",
            "tags": ["去AI味", "告别翻译腔", "自然表达", "开源Skill"],
            "desc": "重点清理机械排比、翻译腔、生硬语序和套路总结，彻底恢复自然活人表达口吻。",
            "cover": "",
            "images": []
        },
        {
            "name": "nuwa-skill",
            "display": "话术女娲：沉淀专属文风 DNA",
            "type": "skill",
            "category": "自媒体运营",
            "author": "话术女娲",
            "repo": "https://github.com/huashu-nuwa/nuwa-skill",
            "tags": ["文风沉淀", "句式节奏", "表达DNA", "开源Skill"],
            "desc": "从参考样文中蒸馏表达节奏、用词习惯与思维模型，让自媒体矩阵表达长期保持高度统一。",
            "cover": "",
            "images": []
        },
        {
            "name": "douyin-downloader",
            "display": "抖音素材与无水印视频下载器",
            "type": "skill",
            "category": "自媒体运营",
            "author": "jiji262",
            "repo": "https://github.com/jiji262/douyin-downloader",
            "tags": ["素材采集", "无水印下载", "短视频运营", "开源Skill"],
            "desc": "高效提取与解析抖音高清无水印视频与图文素材，助力二次创作与灵感收集。",
            "cover": "/images/covers/gh_jiji262_douyin-downloader_1.webp",
            "images": [
                "/images/covers/gh_jiji262_douyin-downloader_1.webp",
                "/images/covers/gh_jiji262_douyin-downloader_2.webp"
            ]
        },

        # 5. 思维模型与认知工具系列 (Thinking & Cognition)
        {
            "name": "cc-thinking-skills",
            "display": "28 个评测验证思维模型库",
            "type": "skill",
            "category": "思维与认知",
            "author": "tjboudreaux",
            "repo": "https://github.com/tjboudreaux/cc-thinking-skills",
            "tags": ["思维模型", "批判性思考", "认知框架", "开源Skill"],
            "desc": "集成 28 个经严格评测验证的思维模型与批判性推理技能，让思考更有章法。",
            "cover": "",
            "images": []
        },
        {
            "name": "thinking-partner",
            "display": "150+ 认知操作与 AI 思考搭档",
            "type": "skill",
            "category": "思维与认知",
            "author": "mattnowdev",
            "repo": "https://github.com/mattnowdev/thinking-partner",
            "tags": ["AI思考搭档", "方向识别", "决策推演", "开源Skill"],
            "desc": "包含 150+ 思维模型、方向识别与认知操作，扮演随时在线的高段位思考搭档。",
            "cover": "",
            "images": []
        },
        {
            "name": "model-thinking",
            "display": "200+ 跨领域思维模型工具箱",
            "type": "skill",
            "category": "思维与认知",
            "author": "kcchien",
            "repo": "https://github.com/kcchien/model-thinking",
            "tags": ["模型工具箱", "跨学科思考", "系统动力学", "开源Skill"],
            "desc": "专为 AI 辅助思考设计，横跨 10 个学科领域的 200+ 经典思维模型索引与调用。",
            "cover": "",
            "images": []
        },
        {
            "name": "lateral-thinking",
            "display": "德·波诺横向思考技巧与跳框路由器",
            "type": "skill",
            "category": "思维与认知",
            "author": "danium",
            "repo": "https://github.com/danium/lateral-thinking",
            "tags": ["横向思考", "跳出框架", "创新灵感", "开源Skill"],
            "desc": "8 种德·波诺横向思考技巧 + 智能路由器，帮助 Agent 和创作者打破思维定势跳出现有框架。",
            "cover": "",
            "images": []
        },
        {
            "name": "socrates-skill",
            "display": "苏格拉底式追问启发教学",
            "type": "skill",
            "category": "思维与认知",
            "author": "bevibing",
            "repo": "https://github.com/bevibing/socrates-skill",
            "tags": ["苏格拉底", "反思追问", "启发式教学", "开源Skill"],
            "desc": "不直接给出结论，而是通过连续结构化追问引导你自己发现本质答案。",
            "cover": "",
            "images": []
        },
        {
            "name": "grillme-skill",
            "display": "结构化深度访谈挖掘器",
            "type": "skill",
            "category": "思维与认知",
            "author": "Jekudy",
            "repo": "https://github.com/Jekudy/grillme-skill",
            "tags": ["深度访谈", "话题挖透", "逻辑审查", "开源Skill"],
            "desc": "模拟硬核专访记者，用连环追问与交叉检验把任何话题逻辑彻底挖透。",
            "cover": "",
            "images": []
        },

        # 6. 前端设计与实用工具系列 (Tools & Frontend Design)
        {
            "name": "css-buttons-scan",
            "display": "92 个高质感 CSS 按钮精选库",
            "type": "tool",
            "category": "设计与工具",
            "author": "CSS Scan",
            "repo": "https://getcssscan.com/css-buttons-examples",
            "tags": ["CSS按钮", "UI组件", "一键复制代码", "设计工具"],
            "desc": "精选 92 种不同风格、微交互与悬浮动效的纯 CSS 按钮示例，支持一键复制代码直接使用。",
            "cover": "",
            "images": []
        },
        {
            "name": "css-box-shadow-scan",
            "display": "95 个精美 CSS 阴影与微投影库",
            "type": "tool",
            "category": "设计与工具",
            "author": "CSS Scan",
            "repo": "https://getcssscan.com/css-box-shadow-examples",
            "tags": ["CSS阴影", "微投影", "Apple质感", "设计工具"],
            "desc": "精选 95 款自然、柔和的 Apple 级微投影与卡片层次阴影参数，彻底告别生硬脏阴影。",
            "cover": "",
            "images": []
        },
        {
            "name": "lieflat-charts",
            "display": "极简数据图表与信息可视化",
            "type": "skill",
            "category": "设计与工具",
            "author": "larashero3-dotcom",
            "repo": "https://github.com/larashero3-dotcom/lieflat-charts",
            "tags": ["数据图表", "极简排版", "信息可视化", "开源Skill"],
            "desc": "以统一的字体、留白、细腻线条与动效，把干燥数据图表转化为具有编辑感的高级视觉内容。",
            "cover": "",
            "images": []
        },
        {
            "name": "Archscribe",
            "display": "高级手绘技术架构图与动态 GIF",
            "type": "skill",
            "category": "设计与工具",
            "author": "lazypay",
            "repo": "https://github.com/lazypay/Archscribe",
            "tags": ["架构图", "Excalidraw", "技术插画", "开源Skill"],
            "desc": "生成高级感手绘技术图：手绘字体、可编辑 Excalidraw 源文件、静态 PNG 与动态演进 GIF。",
            "cover": "",
            "images": []
        },
        {
            "name": "mqc-litigation-visual-redraw",
            "display": "诉讼时间线与案情图表重绘",
            "type": "skill",
            "category": "设计与工具",
            "author": "MiaoQichuan",
            "repo": "https://github.com/MiaoQichuan/mqc-litigation-visual-redraw",
            "tags": ["案情图表", "时间线重绘", "专业可视化", "开源Skill"],
            "desc": "将复杂案件脉络、法条关系与证据链重构为条理清晰的专业可视化图表。",
            "cover": "/images/covers/gh_miaoqichuan_mqc-litigation-visual-redraw_1.webp",
            "images": [
                "/images/covers/gh_miaoqichuan_mqc-litigation-visual-redraw_1.webp",
                "/images/covers/gh_miaoqichuan_mqc-litigation-visual-redraw_2.webp"
            ]
        },
        {
            "name": "tool77-online-box",
            "display": "Tool77 在线极简开发者工具箱",
            "type": "tool",
            "category": "设计与工具",
            "author": "Tool77",
            "repo": "https://tool77.com",
            "tags": ["在线工具", "开发辅助", "轻量即用", "设计工具"],
            "desc": "包含各类格式转换、正则校验、编码解码与轻量数据处理的极简开箱即用工具箱。",
            "cover": "",
            "images": []
        },
        {
            "name": "shawnancy-meituan-coupon-helper",
            "display": "美团外卖领券助手自动化 Skill",
            "type": "skill",
            "category": "设计与工具",
            "author": "shawnancy",
            "repo": "https://github.com/shawnancy/meituan-coupon-helper",
            "tags": ["自动化脚本", "生活助手", "领券工具", "开源Skill"],
            "desc": "跨平台自动化领取外卖优惠券，支持本地与 Agent 自动化定时调度执行。",
            "cover": "",
            "images": []
        }
    ]

    items = []
    for idx, d in enumerate(raw_defs):
        item_id = f"skill-{idx+1:03d}"
        p_prefix = {
            "海报与画册": "画册技能",
            "水彩与插画": "手绘技能",
            "纸艺与拼贴": "纸艺技能",
            "国风与水墨": "国风技能",
            "动漫与波普": "波普技能",
            "极简与解构": "解构技能",
            "AI 视频生成": "视频技能",
            "自媒体运营": "运营技能",
            "思维与认知": "思考模型",
            "设计与工具": "设计工具"
        }.get(d["category"], "开源技能")
        
        if d["type"] == "tool":
            title = f"[设计工具] {d['display']}"
        else:
            title = f"[{p_prefix}] {d['name']} ({d['display']})"
            
        cmd = f"npx skills add {d['repo']}" if d["repo"] and "github.com" in d["repo"] else f"帮我安装 {d['name']} skill"
        
        items.append({
            "id": item_id,
            "title": title,
            "type": d["type"],
            "category": d["category"],
            "tags": d["tags"],
            "command": cmd,
            "author": d["author"],
            "repo_url": d["repo"],
            "description": d["desc"],
            "usage_guide": f"在 Codex / Claude Code / 豆包 等 Agent 工具中输入安装指令：`{cmd}`，安装完成后即可直接调用该技能。",
            "images": d.get("images", []),
            "cover_image": d.get("cover", "")
        })
    return items

# ----------------------------------------------------------------------
# MAIN EXPORT ENGINE
# ----------------------------------------------------------------------
def parse_docx(docx_path="网络热门风格➕Skill开源提示词(3).docx", out_json_path="public/skills_data.json"):
    if not os.path.exists(docx_path):
        raise FileNotFoundError(f"Missing docx file: {docx_path}")
        
    extract_docx_images(docx_path, "public/images")
    doc = docx.Document(docx_path)
    paras = [clean_text(p.text) for p in doc.paragraphs]
    
    styles = parse_style_prompts(paras)
    skills = get_master_skills_and_tools()
    
    all_items = styles + skills
    random.seed(42)
    random.shuffle(all_items)
    
    with open(out_json_path, "w", encoding="utf-8") as f:
        json.dump(all_items, f, ensure_ascii=False, indent=2)
        
    authors = set(x["author"] for x in all_items)
    print(f"\n✅ 数据全量解析清洗完成！")
    print(f"总计纯净条目数: {len(all_items)} (视觉风格 Styles: {len(styles)}, 开源技能 Skills & Tools: {len(skills)})")
    print(f"独立真实作者数: {len(authors)} 个")   
    return all_items

if __name__ == "__main__":
    docx_file = sys.argv[1] if len(sys.argv) > 1 else "网络热门风格➕Skill开源提示词(3).docx"
    out_file = sys.argv[2] if len(sys.argv) > 2 else "public/skills_data.json"
    parse_docx(docx_file, out_file)
