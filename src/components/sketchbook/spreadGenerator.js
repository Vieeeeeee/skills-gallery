/**
 * Canvas Spread Generator for MengTo Sketchbook (Optimized Edition)
 * Fast, lightweight 1760x1240 open-book spreads:
 * - 46KB high-quality cold-press paper texture (Instant 0.05s load)
 * - KingHwa OldSong (京華老宋体) typography with generous whitespace
 * - Stripped brackets from titles (纯粹风格与技能名称)
 * - Watercolor feathered edge blending for artwork
 * - On-demand rendering with instant memory caching
 */

const SPREAD_W = 1760;
const SPREAD_H = 1240;
const HALF_W = SPREAD_W / 2; // 880px

// LRU cache of blob: URLs, capped so a 12-category browsing session doesn't
// pin hundreds of never-revisited pages in memory (cacheKey embeds the
// filtered-list position, so switching category reshuffles keys and orphans
// the old ones — the cap+revoke below reclaims them instead of leaking).
// 速写本一次最多铺多少页（每页要现画一张 1760x1240 画布）。
// 放在这里而不是 SketchbookView：它和下面的 CACHE_LIMIT 之间有个必须成立的不变量，
// 两个常量隔在两个文件里，改一个忘另一个就会静默复活下面那个 bug。
export const MAX_SPREADS = 60;

const spreadCache = new Map();
// 必须 >= MAX_SPREADS：SketchbookView 的 pages[i].url 持有的是缓存 URL 的副本，
// 缓存淘汰会 revoke 掉 blob，但那份副本不会被置空，于是变成死链接 —— 而
// prefetchNeighbors 的守卫是 `!p.url`，死链接是 truthy，那些页永远不会被重新烘热，
// 往回翻就是白页。上限设成一整册的页数后，同一册内不再淘汰，淘汰只发生在切分类时
// （那时 setPages 已经换掉整个 pages 数组，不存在悬空引用）。
// 实测单页 WebP blob 90~151KB（均值 109KB），60 页约 6.4MB 二进制，不占 JS 堆。
const CACHE_LIMIT = MAX_SPREADS;
let baseTemplateImg = null;
// 同一个 cacheKey 的并发调用共用一个 Promise：翻页结束的 paint() 和下一次翻页开始的
// imgEl() 会对同一页各发一次，撞上就会多跑一整张 1760x1240 的同步绘制，
// 且后写入的 URL 会把先写入的顶掉却不 revoke（真泄漏）。窗口是整个编码时长（约 420ms），
// 用户 400ms 内连翻两页就能撞上，不是罕见路径。
const inFlight = new Map();

function cacheKeyFor(item, index) {
  return item.id + '_' + index;
}

// Touch-on-access：命中时把 key 移到 MRU。注意它只保证「这个 cache key 不会被选中淘汰」，
// 保证不了外部持有的 URL 副本（如 SketchbookView 的 pages[i].url）不悬空——那是靠
// CACHE_LIMIT >= MAX_SPREADS 来保证的，别把两件事混为一谈。
function cacheGet(key) {
  if (!spreadCache.has(key)) return undefined;
  const url = spreadCache.get(key);
  spreadCache.delete(key);
  spreadCache.set(key, url); // move to MRU (end of Map = insertion order)
  return url;
}

function cacheSet(key, url) {
  spreadCache.set(key, url);
  if (spreadCache.size > CACHE_LIMIT) {
    const oldestKey = spreadCache.keys().next().value;
    const oldestUrl = spreadCache.get(oldestKey);
    spreadCache.delete(oldestKey);
    if (oldestUrl) URL.revokeObjectURL(oldestUrl);
  }
}

// Revoke every cached blob: URL. Call when leaving the sketchbook entirely.
export function clearSpreadCache() {
  for (const url of spreadCache.values()) {
    URL.revokeObjectURL(url);
  }
  spreadCache.clear();
}

function canvasToObjectURL(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob ? URL.createObjectURL(blob) : null);
    }, type, quality);
  });
}

// Preload the lightweight 46KB blank sketchbook template
function getBaseTemplate() {
  if (baseTemplateImg) return Promise.resolve(baseTemplateImg);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      baseTemplateImg = img;
      resolve(img);
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = '/sketchbook/blank-sketchbook.webp';
  });
}

// Clean title: remove [xxx], 【xxx】, (xxx), （xxx） prefixes, and Wibi Style prefix
export function cleanTitle(raw) {
  if (!raw) return '风格画赏';
  return raw
    .replace(/^\[[^\]]+\]\s*/g, '')
    .replace(/^【[^】]+】\s*/g, '')
    .replace(/^（[^）]+）\s*/g, '')
    .replace(/^\([^)]+\)\s*/g, '')
    .replace(/^Wibi\s+Style\s*[·\-\s]\s*/i, '')
    .trim();
}

// 取一页 spread 的 blob: URL。三级：缓存命中 → 已在生成中就复用同一个 Promise → 现画。
export async function generateSpreadImage(item, index) {
  if (!item) return null;
  const cacheKey = cacheKeyFor(item, index);
  const cached = cacheGet(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  const pending = inFlight.get(cacheKey);
  if (pending) return pending;

  // catch 收在这里：job 是共享的，一次绘制失败会把同一个 rejected promise 分发给
  // 所有并发调用者，而三处调用点都只挂了 .then —— 不收就是 N 条 unhandled rejection。
  const job = drawSpread(item, index, cacheKey).catch((err) => {
    console.error('生成速写本页面失败:', err);
    return null;
  });
  inFlight.set(cacheKey, job);
  try {
    return await job;
  } finally {
    inFlight.delete(cacheKey);
  }
}

async function drawSpread(item, index, cacheKey) {
  // Create offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = SPREAD_W;
  canvas.height = SPREAD_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 1. Draw MengTo Pure Cold-Press Sketchbook Base (46KB WebP)
  const baseImg = await getBaseTemplate();
  if (baseImg) {
    ctx.drawImage(baseImg, 0, 0, SPREAD_W, SPREAD_H);
  } else {
    drawFallbackPaperBase(ctx);
  }

  // Alternating layout: Even index -> Left Text + Right Art; Odd index -> Left Art + Right Text
  const isLeftText = index % 2 === 0;

  const textBounds = isLeftText
    ? { cx: 485, cy: 620, x: 210, maxW: 560 }
    : { cx: 1275, cy: 620, x: 1000, maxW: 560 };

  const artBounds = isLeftText
    ? { cx: 1275, cy: 620, maxW: 580, maxH: 490 }
    : { cx: 485, cy: 620, maxW: 580, maxH: 490 };

  // 2. Draw Artwork with watercolor feathered edge blending & Chinese cinnabar chop stamp beside it
  await drawFeatheredArtworkPage(ctx, item, index, artBounds);

  // 3. Draw Clean, Balanced Text Page
  drawCleanSerifTextPage(ctx, item, index, textBounds);

  // 必须用 WebP：底图 blank-sketchbook.webp 四周本来就是透明的（实测四角 rgba(0,0,0,0)），
  // 书本的 3D 阴影和纸张边缘要从这些透明像素透上来。换成 JPEG 会把透明填成纯黑，
  // 每一页都被黑框包住、阴影全被遮死——这个回归实测复现过，别再改回 JPEG。
  // 编码慢（~420ms）已经不在关键路径上：现在是按需生成 + 空闲时段预取邻页，
  // 且 toBlob 的编码不占用调用方的 tick。
  const url = await canvasToObjectURL(canvas, 'image/webp', 0.88);
  if (url) cacheSet(cacheKey, url);
  return url;
}

/**
 * Draws the Minimal Text Page in Noto Serif SC (思源宋体) & Songti SC
 * Strictly minimal: Title + Author only, generous breathing room, balanced weights
 */
function drawCleanSerifTextPage(ctx, item, index, bounds) {
  const { x, cy, maxW } = bounds;

  ctx.save();

  // 1. Top Plate Label & Category
  const plateNum = String(index + 1).padStart(3, '0');
  const catLabel = item.category || (item.type === 'skill' ? '开源技能' : '视觉风格');
  
  ctx.font = '500 15px "Playfair Display", "Noto Serif SC", "Songti SC", serif';
  ctx.fillStyle = 'rgba(135, 105, 75, 0.75)';
  ctx.textAlign = 'left';
  ctx.fillText('PLATE № ' + plateNum + '  ·  ' + catLabel, x, cy - 128);

  // 2. Delicate hairline divider
  ctx.strokeStyle = 'rgba(135, 105, 75, 0.22)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, cy - 110);
  ctx.lineTo(x + 160, cy - 110);
  ctx.stroke();

  // 3. Main Name (Cleaned, Noto Serif SC, Large Scale & Generous Whitespace)
  const title = cleanTitle(item.title);

  ctx.fillStyle = '#261b12';
  let fontSize = 40;
  if (title.length > 20) fontSize = 30;
  else if (title.length > 12) fontSize = 34;

  ctx.font = '600 ' + fontSize + 'px "Noto Serif SC", "Songti SC", "STSong", serif';
  
  const titleStartY = cy - (fontSize * 0.65);
  wrapText(ctx, title, x, titleStartY, maxW - 20, fontSize * 1.45, 3);

  // 4. Clean Author Attribution
  ctx.font = 'italic 16px "Playfair Display", "Noto Serif SC", "Songti SC", serif';
  ctx.fillStyle = 'rgba(145, 115, 85, 0.82)';
  
  const authorText = item.author ? ('@' + item.author) : '@威比 Hunter Wei.（抖音、小红书同名）';
  ctx.fillText(authorText, x, cy + 130);

  ctx.restore();
}

/**
 * Draws Artwork with watercolor feathering blending smoothly into paper texture
 */
async function drawFeatheredArtworkPage(ctx, item, index, bounds) {
  const { cx, cy, maxW, maxH } = bounds;
  const imageSrc = item.cover_image || (item.images && item.images[0]);

  if (imageSrc) {
    try {
      const img = await loadImage(imageSrc);
      const imgAspect = (img.width || 1) / (img.height || 1);

      let drawW = maxW;
      let drawH = drawW / imgAspect;
      if (drawH > maxH) {
        drawH = maxH;
        drawW = drawH * imgAspect;
      }

      const drawX = cx - drawW / 2;
      const drawY = cy - drawH / 2;

      // Create offscreen canvas for feathered artwork
      const artCanvas = document.createElement('canvas');
      artCanvas.width = drawW;
      artCanvas.height = drawH;
      const artCtx = artCanvas.getContext('2d');

      // Draw image
      artCtx.drawImage(img, 0, 0, drawW, drawH);

      // Apply soft watercolor feathered edge mask
      artCtx.globalCompositeOperation = 'destination-in';
      
      const featherSize = Math.max(16, Math.min(32, Math.min(drawW, drawH) * 0.08));
      
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = drawW;
      maskCanvas.height = drawH;
      const maskCtx = maskCanvas.getContext('2d');

      maskCtx.fillStyle = '#ffffff';
      maskCtx.fillRect(featherSize, featherSize, drawW - featherSize * 2, drawH - featherSize * 2);

      // Top feather
      const gTop = maskCtx.createLinearGradient(0, 0, 0, featherSize);
      gTop.addColorStop(0, 'rgba(255,255,255,0)');
      gTop.addColorStop(0.35, 'rgba(255,255,255,0.12)');
      gTop.addColorStop(0.75, 'rgba(255,255,255,0.72)');
      gTop.addColorStop(1, 'rgba(255,255,255,1)');
      maskCtx.fillStyle = gTop;
      maskCtx.fillRect(featherSize, 0, drawW - featherSize * 2, featherSize);

      // Bottom feather
      const gBot = maskCtx.createLinearGradient(0, drawH - featherSize, 0, drawH);
      gBot.addColorStop(0, 'rgba(255,255,255,1)');
      gBot.addColorStop(0.25, 'rgba(255,255,255,0.72)');
      gBot.addColorStop(0.65, 'rgba(255,255,255,0.12)');
      gBot.addColorStop(1, 'rgba(255,255,255,0)');
      maskCtx.fillStyle = gBot;
      maskCtx.fillRect(featherSize, drawH - featherSize, drawW - featherSize * 2, featherSize);

      // Left feather
      const gLeft = maskCtx.createLinearGradient(0, 0, featherSize, 0);
      gLeft.addColorStop(0, 'rgba(255,255,255,0)');
      gLeft.addColorStop(0.35, 'rgba(255,255,255,0.12)');
      gLeft.addColorStop(0.75, 'rgba(255,255,255,0.72)');
      gLeft.addColorStop(1, 'rgba(255,255,255,1)');
      maskCtx.fillStyle = gLeft;
      maskCtx.fillRect(0, featherSize, featherSize, drawH - featherSize * 2);

      // Right feather
      const gRight = maskCtx.createLinearGradient(drawW - featherSize, 0, drawW, 0);
      gRight.addColorStop(0, 'rgba(255,255,255,1)');
      gRight.addColorStop(0.25, 'rgba(255,255,255,0.72)');
      gRight.addColorStop(0.65, 'rgba(255,255,255,0.12)');
      gRight.addColorStop(1, 'rgba(255,255,255,0)');
      maskCtx.fillStyle = gRight;
      maskCtx.fillRect(drawW - featherSize, featherSize, featherSize, drawH - featherSize * 2);

      // 4 corners radial vignettes
      drawCornerVignette(maskCtx, 0, 0, featherSize, 0, 0);
      drawCornerVignette(maskCtx, drawW - featherSize, 0, featherSize, drawW, 0);
      drawCornerVignette(maskCtx, 0, drawH - featherSize, featherSize, 0, drawH);
      drawCornerVignette(maskCtx, drawW - featherSize, drawH - featherSize, featherSize, drawW, drawH);

      // Apply mask to art
      artCtx.drawImage(maskCanvas, 0, 0);

      // Draw onto main page with subtle tactile shadow
      ctx.save();
      ctx.shadowColor = 'rgba(60, 42, 20, 0.09)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 6;
      ctx.drawImage(artCanvas, drawX, drawY);
      ctx.restore();

      // Chinese Vermilion Seal Stamp: PLACED OUTSIDE/BESIDE THE IMAGE
      // Lower right margin, staggered organically, NEVER overlapping the picture!
      const stampX = drawX + drawW - 28;
      const stampY = drawY + drawH + 16;
      drawChineseChopStamp(ctx, stampX, stampY, item.type === 'skill' ? '技' : '賞');

    } catch (e) {
      drawMinimalFallbackArt(ctx, item, cx, cy, maxW, maxH);
    }
  } else {
    drawMinimalFallbackArt(ctx, item, cx, cy, maxW, maxH);
  }
}

function drawCornerVignette(ctx, x, y, size, cornerX, cornerY) {
  const g = ctx.createRadialGradient(
    cornerX === 0 ? size : x, cornerY === 0 ? size : y, 0,
    cornerX === 0 ? size : x, cornerY === 0 ? size : y, size
  );
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.65)');
  g.addColorStop(0.7, 'rgba(255,255,255,0.08)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, size, size);
}

/**
 * Traditional Chinese Vermilion Ink Chop Seal Stamp
 * Features authentic cinnabar ink, double-line border, and traditional Chinese character
 * Placed outside/beside artwork for connoisseur stamp presence
 */
function drawChineseChopStamp(ctx, x, y, char) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.035);

  const size = 30;

  // Outer vermilion border
  ctx.strokeStyle = 'rgba(184, 48, 36, 0.85)';
  ctx.lineWidth = 1.6;
  roundRect(ctx, -size / 2, -size / 2, size, size, 4);
  ctx.stroke();

  // Subtle translucent cinnabar seal ink wash
  ctx.fillStyle = 'rgba(184, 48, 36, 0.08)';
  ctx.fill();

  // Fine inner border line
  ctx.strokeStyle = 'rgba(184, 48, 36, 0.38)';
  ctx.lineWidth = 0.6;
  roundRect(ctx, -size / 2 + 2.5, -size / 2 + 2.5, size - 5, size - 5, 2.5);
  ctx.stroke();

  // Seal Chinese Character (技 / 賞 / 藏)
  ctx.fillStyle = 'rgba(184, 48, 36, 0.92)';
  ctx.font = 'bold 16px "Noto Serif SC", "Songti SC", "STSong", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(char || '賞', 0, 1);

  ctx.restore();
}

/**
 * Minimal Fallback Artwork Page for items without pictures
 */
function drawMinimalFallbackArt(ctx, item, cx, cy, maxW, maxH) {
  const w = Math.min(maxW, 460);
  const h = Math.min(maxH, 400);
  const x = cx - w / 2;
  const y = cy - h / 2;

  ctx.save();
  // Archival mount border
  ctx.strokeStyle = 'rgba(140, 110, 80, 0.22)';
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 6);
  ctx.stroke();

  // Delicate inner dashed frame
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(140, 110, 80, 0.16)';
  roundRect(ctx, x + 12, y + 12, w - 24, h - 24, 4);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = 'rgba(140, 110, 80, 0.03)';
  ctx.fill();

  // Title in Center
  ctx.fillStyle = '#2d2116';
  ctx.font = '600 28px "Noto Serif SC", "Songti SC", serif';
  ctx.textAlign = 'center';
  const title = cleanTitle(item.title) || '视觉风格画赏';
  ctx.fillText(title, cx, cy - 20);

  // Poetic "待补充" label
  ctx.fillStyle = '#947656';
  ctx.font = 'italic 15px "Noto Serif SC", "Songti SC", serif';
  ctx.fillText('「 视觉样例待补充 · 原创提示词已入卷 」', cx, cy + 22);

  // Traditional chop stamp beside
  drawChineseChopStamp(ctx, cx, cy + 85, '入');

  ctx.restore();
}

function drawFallbackPaperBase(ctx) {
  const bgGrad = ctx.createLinearGradient(0, 0, SPREAD_W, SPREAD_H);
  bgGrad.addColorStop(0, '#faf4ec');
  bgGrad.addColorStop(0.5, '#f4ece1');
  bgGrad.addColorStop(1, '#ede2d3');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, SPREAD_W, SPREAD_H);

  const spineGrad = ctx.createLinearGradient(HALF_W - 40, 0, HALF_W + 40, 0);
  spineGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  spineGrad.addColorStop(0.5, 'rgba(50, 35, 15, 0.22)');
  spineGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = spineGrad;
  ctx.fillRect(HALF_W - 40, 0, 80, SPREAD_H);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
  if (!text) return;
  const chars = text.split('');
  let line = '';
  let lineCount = 0;

  for (let n = 0; n < chars.length; n++) {
    const testLine = line + chars[n];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = chars[n];
      y += lineHeight;
      lineCount++;
      if (lineCount >= maxLines - 1) {
        let truncLine = '';
        for (let r = n; r < chars.length; r++) {
          if (ctx.measureText(truncLine + chars[r] + '…').width > maxWidth) break;
          truncLine += chars[r];
        }
        ctx.fillText(truncLine + '…', x, y);
        return;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
