const fs = require("fs");

const data = JSON.parse(fs.readFileSync("public/skills_data.json", "utf8"));

const fixes = {
  "style-003": "[旅行海报] 原片＋艺术面板＋诗意标题海报",
  "style-017": "[旅行海报] 哑光米白艺术纸二分画册明信片",
  "style-034": "[旅行海报] 日系双层艺术摄影编辑海报",
  "style-036": "[旅行海报] 哑光米白艺术纸二分画册明信片",
  "style-037": "[极简解构] 真实摄影与抽象设计双联海报",
  "style-065": "[旅行海报] 上下分栏明信片摄影拼贴",
  "style-074": "[国风水墨] 现代写意水墨空间意境插画",
  "style-086": "[手绘线稿] 现代极简手绘线稿风景插画",
  "style-092": "[手绘线稿] 现代极简手绘线稿艺术插画",
  "style-095": "[动漫波普] 复古烧花邮戳抽象艺术插画",
  "style-097": "[手绘线稿] 极简手绘黑色细线插画",
  "style-100": "[极简解构] 先锋多巴胺潮流时尚艺术海报",
  "style-101": "[极简解构] 高级多巴胺都市时尚大片海报",
  "style-105": "[极简解构] 多巴胺潮流半写实 3D 人像海报",
  "style-106": "[极简解构] 高饱和潮流场景艺术海报",
  "style-107": "[国风水墨] 东方现代意境艺术海报设计",
  "style-123": "[自媒体运营] 1:1 白底 3D 纺织玩偶胸像",
  "style-148": "[国风水墨] 二分水墨重构艺术画册明信片",
  "style-152": "[水彩手绘] 极简黑色剪影建筑艺术插画",
  "style-154": "[手绘线稿] 极简现代建筑线稿构图插画",
  "style-155": "[浮雕立体] 浮雕微缩立体质感艺术插画",
  "style-158": "[国风水墨] 东方浮雕微缩立体质感插画",
  "style-159": "[国风水墨] 传统水墨意境手绘线稿插画",
  "style-160": "[国风水墨] 新中式浮雕微缩立体插画",
  "style-161": "[国风水墨] 东方写意极简手绘线稿插画",
  "style-163": "[浮雕立体] 3D 浮雕微缩立体质感插画 #01",
  "style-164": "[浮雕立体] 3D 浮雕微缩立体质感插画 #02",
  "style-165": "[浮雕立体] 3D 浮雕微缩立体质感插画 #03",
  "style-166": "[自媒体运营] 可爱旅游纪念冰箱贴插画",
  "style-167": "[水彩手绘] 水彩旅行手账建筑风景插画",
  "style-168": "[手绘线稿] 现代极简手绘线稿插画 #01",
  "style-169": "[水彩手绘] 极简纯白留白艺术意境插画",
  "style-170": "[手绘线稿] 现代极简手绘线稿插画 #02",
  "style-171": "[手绘线稿] 黑色随性手绘线稿极简插画",
  "style-173": "[手绘线稿] 现代极简手绘线稿插画 #03",
  "style-174": "[国风水墨] 国潮风精细建筑手绘转绘插画",
  "style-175": "[浮雕立体] 国风浮雕微缩立体质感插画",
  "style-176": "[手绘线稿] 东方意境手绘线稿插画",
  "style-178": "[手绘线稿] 现代极简手绘线稿插画 #04",
  "style-179": "[极简解构] 现代简约抽象平面矢量插画",
  "style-180": "[国风水墨] 新中式极简平面设计艺术海报",
  "style-182": "[极简解构] 极简主义扁平矢量设计插画",
  "style-190": "[动漫波普] 1:1 白底 3D 纺织玩偶插画",
  "style-194": "[水彩手绘] 毕业季青春写真纪念手绘插画",
  "style-209": "[极简解构] 几何解构诗意抽象艺术插画",
  "style-211": "[旅行海报] 诗意光影旅行摄影二分海报",
  "style-213": "[极简解构] 理性抽象解构与二分极简海报",
  "style-242": "[浮雕立体] 极简浮雕微缩立体质感插画",
  "style-243": "[浮雕立体] 水彩质感浮雕立体插画",
  "style-246": "[水彩手绘] 随性涂鸦速写风实景艺术海报",
  "style-247": "[旅行海报] 实景摄影与极简艺术二分海报",
  "style-250": "[极简解构] 四格多维视觉重构艺术海报",
  "style-251": "[手绘线稿] 现代极简手绘线稿艺术插画",
  "style-252": "[国风水墨] 东方国风浮雕微缩立体插画",
  "style-255": "[极简解构] 地理空间认知与场景重构海报",
  "style-256": "[水彩手绘] 浪漫旅行手账线稿透明水彩",
  "style-266": "[纸艺拼贴] 复古纸质蒙太奇剪贴艺术海报",
  "skill-280": "[视觉探索] 极简主义 Zine 海报 (minimal-zine)",
  "skill-283": "[职场求职] 岗位扫描与投递看板 (Career-ops)",
  "skill-284": "[职场求职] 智能搜岗与简历定制 (ai-job-search)",
  "skill-292": "[视觉探索] Riso 孔版印刷海报 (riso-poster)",
  "skill-294": "[视觉探索] 诗意线条 Zine 海报 (poetic-line)",
  "skill-309": "[视频生成] 广告与 UGC 视频生成 (Generative-Media)",
  "skill-325": "[视觉探索] 极简主义 Zine 海报 (minimal-zine)",
  "skill-328": "[视觉探索] 哑光低饱和 Zine 海报 (muted-zine)",
  "skill-337": "[内容创作] AI 味清洗与语言润色 (flavor-remover)",
  "skill-339": "[视觉探索] 极简主义 Zine 海报 (minimal-zine)",
  "skill-341": "[视觉探索] 哑光低饱和 Zine 海报 (muted-zine)",
  "skill-342": "[视觉探索] 解构双色调艺术海报 (duotone-poster)",
  "skill-346": "[视觉探索] 旅行摄影抽象记忆画册 (travel-abstract)",
  "skill-347": "[视觉探索] 场景采集 Zine 艺术手账 (gathered-zine)",
  "skill-368": "[视觉探索] 场景采集 Zine 艺术手账 (gathered-zine)",
  "skill-369": "[视觉探索] 极简主义 Zine 海报 (minimal-zine)",
  "skill-371": "[视觉探索] 场景采集 Zine 艺术手账 (gathered-zine)",
  "skill-373": "[视觉探索] 场景采集 Zine 艺术手账 (gathered-zine)",
  "skill-374": "[视觉探索] 场景采集 Zine 艺术手账 (gathered-zine)",
  "skill-375": "[视觉探索] 场景采集 Zine 艺术手账 (gathered-zine)",
  "skill-390": "[视觉探索] 场景采集 Zine 艺术手账 (gathered-zine)",
  "skill-391": "[视觉探索] 场景采集 Zine 艺术手账 (gathered-zine)",
  "skill-393": "[视觉探索] 极简主义 Zine 海报 (minimal-zine)",
  "skill-394": "[视觉探索] 极简主义 Zine 海报 (minimal-zine)",
  "skill-396": "[视觉探索] 场景采集 Zine 艺术手账 (gathered-zine)",
  "skill-397": "[视觉探索] 极简主义 Zine 海报 (minimal-zine)",
  "skill-400": "[视觉探索] 场景采集 Zine 艺术手账 (gathered-zine)",
  "skill-403": "[视觉探索] 极简主义 Zine 海报 (minimal-zine)",
  "skill-404": "[视觉探索] 场景采集 Zine 艺术手账 (gathered-zine)",
  "skill-405": "[视觉探索] 场景采集 Zine 艺术手账 (gathered-zine)",
  "skill-409": "[视觉探索] 场景采集 Zine 艺术手账 (gathered-zine)",
  "skill-410": "[视觉探索] 场景采集 Zine 艺术手账 (gathered-zine)",
  "skill-414": "[视觉探索] 场景采集 Zine 艺术手账 (gathered-zine)",
  "skill-418": "[设计工具] Canvas 极简画板设计 (canvas-design)",
  "skill-420": "[视觉探索] 场景采集 Zine 艺术手账 (gathered-zine)",
  "skill-439": "[自媒体运营] MediaCrawler 平台爬虫 (MediaCrawler)",
  "skill-450": "[视觉探索] Riso 孔版印刷海报 (riso-poster)",
  "skill-452": "[视觉探索] 诗意线条 Zine 海报 (poetic-line)",
  "skill-459": "[视觉探索] 场景采集 Zine 艺术手账 (gathered-zine)",
  "skill-461": "[视觉探索] 场景采集 Zine 艺术手账 (gathered-zine)",
  "skill-462": "[视觉探索] 场景采集 Zine 艺术手账 (gathered-zine)",
  "skill-463": "[视觉探索] 极简主义 Zine 海报 (minimal-zine)",
  "skill-470": "[视觉探索] 诗意线条 Zine 海报 (poetic-line)"
};

data.forEach(item => {
  if (fixes[item.id]) {
    item.title = fixes[item.id];
  }
  
  // 清洗多余嵌套前缀
  while (item.title.startsWith("[") && item.title.indexOf("]") > 0) {
    const end = item.title.indexOf("]");
    const rem = item.title.slice(end + 1).trim();
    if (rem.startsWith("[")) {
      item.title = rem;
    } else {
      break;
    }
  }
});

fs.writeFileSync("public/skills_data.json", JSON.stringify(data, null, 2), "utf8");
console.log("全部 488 条标题已彻底清洗完成！");
