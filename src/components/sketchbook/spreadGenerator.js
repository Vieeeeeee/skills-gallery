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

const spreadCache = new Map();
let baseTemplateImg = null;

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

// Clean title: remove [xxx], 【xxx】, (xxx), （xxx） prefixes
export function cleanTitle(raw) {
  if (!raw) return '风格画赏';
  return raw
    .replace(/^[[^]]+]s*/g, '')
    .replace(/^【[^】]+】s*/g, '')
    .replace(/^（[^）]+）s*/g, '')
    .replace(/^([^)]+)s*/g, '')
    .trim();
}

export async function generateSpreadImage(item, index) {
  if (!item) return null;
  const cacheKey = item.id + '_' + index;
  if (spreadCache.has(cacheKey)) {
    return spreadCache.get(cacheKey);
  }

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

  // 2. Draw Feathered Watercolor Artwork Page
  await drawFeatheredArtworkPage(ctx, item, index, artBounds);

  // 3. Draw Minimalist KingHwa OldSong Text Page (Name Only with Great Whitespace)
  drawKingHwaTextPage(ctx, item, index, textBounds);

  const dataUrl = canvas.toDataURL('image/webp', 0.88);
  spreadCache.set(cacheKey, dataUrl);
  return dataUrl;
}

/**
 * Draws the Minimal Text Page in KingHwa OldSong (京華老宋体)
 */
function drawKingHwaTextPage(ctx, item, index, bounds) {
  const { x, cy, maxW } = bounds;

  ctx.save();

  // 1. Top Plate Label & Category
  const plateNum = String(index + 1).padStart(3, '0');
  const catLabel = (item.category || (item.type === 'skill' ? '开源技能' : '视觉风格')).toUpperCase();
  
  ctx.font = '500 16px "KingHwaOldSong", "Songti SC", "STSong", "Newsreader", serif';
  ctx.fillStyle = 'rgba(135, 105, 75, 0.78)';
  ctx.textAlign = 'left';
  ctx.fillText('PLATE № ' + plateNum + '  ·  ' + catLabel, x, cy - 120);

  // 2. Delicate hairline divider
  ctx.strokeStyle = 'rgba(135, 105, 75, 0.22)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, cy - 105);
  ctx.lineTo(x + 140, cy - 105);
  ctx.stroke();

  // 3. Main Name (Cleaned, KingHwa OldSong, Large Scale & Generous Breathing Room)
  const title = cleanTitle(item.title);

  ctx.fillStyle = '#221911';
  let fontSize = 42;
  if (title.length > 20) fontSize = 32;
  else if (title.length > 12) fontSize = 36;

  ctx.font = 'bold ' + fontSize + 'px "KingHwaOldSong", "Songti SC", "STSong", "Newsreader", serif';
  
  const titleStartY = cy - (fontSize * 0.8);
  wrapText(ctx, title, x, titleStartY, maxW - 20, fontSize * 1.4, 3);

  // 4. Footnote Attribution (KingHwa OldSong Italic)
  ctx.font = 'italic 16px "KingHwaOldSong", "Newsreader", "Caveat", serif';
  ctx.fillStyle = 'rgba(145, 115, 85, 0.78)';
  
  const authorText = item.author ? ('@' + item.author) : '开源社区';
  const typeText = item.type === 'skill' ? '智能体技能' : (item.aspect_ratio ? ('比例 ' + item.aspect_ratio) : '视觉风格画赏');
  
  ctx.fillText(authorText + '  ·  ' + typeText, x, cy + 140);

  ctx.restore();
}

/**
 * Draws Artwork with watercolor feathering into the paper grain
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

      // Create offscreen canvas
      const artCanvas = document.createElement('canvas');
      artCanvas.width = drawW;
      artCanvas.height = drawH;
      const artCtx = artCanvas.getContext('2d');

      // Draw image
      artCtx.drawImage(img, 0, 0, drawW, drawH);

      // Apply wide, deep watercolor feathered edge mask
      artCtx.globalCompositeOperation = 'destination-in';
      
      const featherSize = Math.max(20, Math.min(38, Math.min(drawW, drawH) * 0.1));
      
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = drawW;
      maskCanvas.height = drawH;
      const maskCtx = maskCanvas.getContext('2d');

      maskCtx.fillStyle = '#ffffff';
      maskCtx.fillRect(featherSize, featherSize, drawW - featherSize * 2, drawH - featherSize * 2);

      // Top feather
      const gTop = maskCtx.createLinearGradient(0, 0, 0, featherSize);
      gTop.addColorStop(0, 'rgba(255,255,255,0)');
      gTop.addColorStop(0.3, 'rgba(255,255,255,0.08)');
      gTop.addColorStop(0.7, 'rgba(255,255,255,0.65)');
      gTop.addColorStop(1, 'rgba(255,255,255,1)');
      maskCtx.fillStyle = gTop;
      maskCtx.fillRect(featherSize, 0, drawW - featherSize * 2, featherSize);

      // Bottom feather
      const gBot = maskCtx.createLinearGradient(0, drawH - featherSize, 0, drawH);
      gBot.addColorStop(0, 'rgba(255,255,255,1)');
      gBot.addColorStop(0.3, 'rgba(255,255,255,0.65)');
      gBot.addColorStop(0.7, 'rgba(255,255,255,0.08)');
      gBot.addColorStop(1, 'rgba(255,255,255,0)');
      maskCtx.fillStyle = gBot;
      maskCtx.fillRect(featherSize, drawH - featherSize, drawW - featherSize * 2, featherSize);

      // Left feather
      const gLeft = maskCtx.createLinearGradient(0, 0, featherSize, 0);
      gLeft.addColorStop(0, 'rgba(255,255,255,0)');
      gLeft.addColorStop(0.3, 'rgba(255,255,255,0.08)');
      gLeft.addColorStop(0.7, 'rgba(255,255,255,0.65)');
      gLeft.addColorStop(1, 'rgba(255,255,255,1)');
      maskCtx.fillStyle = gLeft;
      maskCtx.fillRect(0, featherSize, featherSize, drawH - featherSize * 2);

      // Right feather
      const gRight = maskCtx.createLinearGradient(drawW - featherSize, 0, drawW, 0);
      gRight.addColorStop(0, 'rgba(255,255,255,1)');
      gRight.addColorStop(0.3, 'rgba(255,255,255,0.65)');
      gRight.addColorStop(0.7, 'rgba(255,255,255,0.08)');
      gRight.addColorStop(1, 'rgba(255,255,255,0)');
      maskCtx.fillStyle = gRight;
      maskCtx.fillRect(drawW - featherSize, featherSize, featherSize, drawH - featherSize * 2);

      // 4 corners radial gradients
      drawCornerVignette(maskCtx, 0, 0, featherSize, 0, 0);
      drawCornerVignette(maskCtx, drawW - featherSize, 0, featherSize, drawW, 0);
      drawCornerVignette(maskCtx, 0, drawH - featherSize, featherSize, 0, drawH);
      drawCornerVignette(maskCtx, drawW - featherSize, drawH - featherSize, featherSize, drawW, drawH);

      // Apply mask
      artCtx.drawImage(maskCanvas, 0, 0);

      // Draw onto main page
      ctx.save();
      ctx.shadowColor = 'rgba(60, 40, 20, 0.07)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 6;
      ctx.drawImage(artCanvas, drawX, drawY);
      ctx.restore();

      // Right bottom red chop seal stamp
      drawRedChopStamp(ctx, drawX + drawW - 30, drawY + drawH + 14, item.type === 'skill' ? '技' : '賞');

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
  g.addColorStop(0.3, 'rgba(255,255,255,0.65)');
  g.addColorStop(0.7, 'rgba(255,255,255,0.08)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, size, size);
}

function drawRedChopStamp(ctx, x, y, char) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.03);

  ctx.strokeStyle = 'rgba(180, 50, 40, 0.75)';
  ctx.lineWidth = 1.6;
  roundRect(ctx, -13, -13, 26, 26, 4);
  ctx.stroke();

  ctx.fillStyle = 'rgba(180, 50, 40, 0.08)';
  ctx.fill();

  ctx.fillStyle = 'rgba(180, 50, 40, 0.88)';
  ctx.font = 'bold 15px "KingHwaOldSong", "Songti SC", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(char || '賞', 0, 1);

  ctx.restore();
}

function drawMinimalFallbackArt(ctx, item, cx, cy, maxW, maxH) {
  const w = Math.min(maxW, 460);
  const h = Math.min(maxH, 420);
  const x = cx - w / 2;
  const y = cy - h / 2;

  ctx.save();
  ctx.strokeStyle = 'rgba(140, 110, 80, 0.25)';
  ctx.lineWidth = 1.2;
  roundRect(ctx, x, y, w, h, 8);
  ctx.stroke();

  ctx.fillStyle = 'rgba(140, 110, 80, 0.04)';
  ctx.fill();

  ctx.fillStyle = '#3a2b1c';
  ctx.font = 'bold 32px "KingHwaOldSong", "Songti SC", serif';
  ctx.textAlign = 'center';
  ctx.fillText(cleanTitle(item.title) || '风格画赏', cx, cy - 10);

  ctx.fillStyle = '#8f7250';
  ctx.font = 'italic 16px "KingHwaOldSong", "Newsreader", serif';
  ctx.fillText(item.category || 'AI Visual Archive', cx, cy + 30);

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
  ctx.lineTo(x + radius, y + height);
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
