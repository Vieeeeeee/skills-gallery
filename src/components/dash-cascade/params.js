export const REF_W = 640;
export const REF_H = 260;
export const FPS = 10;
export const FRAMES = 30;

export const BG = "transparent";
export const INK = "#5046e5"; // Apple vibrant indigo/violet

export const HUE_WAVES = [
  { u: 0.9, v: 0.35, speed: 1.0, weight: 0.5 },
  { u: -0.55, v: 1.3, speed: -1.37, weight: 0.32 },
  { u: 1.7, v: -0.8, speed: 0.61, weight: 0.18 },
];

export const HUE_SPREAD_DEG = 28;
export const LIGHT_SPREAD = 0.04;
export const HUE_LAYERS = 7;
export const HUE_DRIFT_S = 45;

export const HOVER_SAT_LIFT = 0.15;
export const HOVER_DRIFT_GAIN = 1.8;
export const HOVER_EASE_S = 0.4;

export const ROW_Y = [30, 50, 70, 90, 110, 130, 150, 170, 190, 210];
export const DASH_H = 15.5;

export const AXIS = 320;
export const CONTENT_MID = 120;

// Waveform: 30 frames at 10fps (3.0s total). Holds ~0.6s (6 frames) at full extension (1.0)
export const WAVE = [
  0.001, 0.005, 0.02, 0.08, 0.25, 0.58, 0.86, 0.96,
  1.0, 1.0, 1.0, 1.0, 1.0, 1.0, // ~0.6s hold at full expansion
  0.96, 0.86, 0.58, 0.25, 0.08, 0.02, 0.005, 0.001,
  0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.001
];
export const WAVE_LEAD = 7.5;

export const DOWN_AT = 4.85;
export const DOWN_RATE = 0.58;
export const DOWN_TILT = 0.003;
export const UP_AT = 4.56;
export const UP_RATE = 0.42;
export const PINCH_DOWN = [4.98, 0.68];
export const PINCH_UP = [4.73, 0.4];

export const LOOPS_PER_WORD = 1;

function generateCharGlyph(char, x0, w) {
  const s = w * 0.22;
  const x1 = x0 + w;
  const mid = (x0 + x1) / 2;
  const l = x0;
  const r = x1;

  const rows = [];
  for (let row = 0; row < 10; row++) {
    switch (char) {
      case 'P':
        if (row === 0 || row === 4) rows.push([[l, r]]);
        else if (row < 4) rows.push([[l, l + s], [r - s, r]]);
        else rows.push([[l, l + s]]);
        break;
      case 'R':
        if (row === 0 || row === 4) rows.push([[l, r]]);
        else if (row < 4) rows.push([[l, l + s], [r - s, r]]);
        else {
          const legStart = l + s * 0.5 + ((r - s * 1.5 - l) * (row - 4)) / 5;
          rows.push([[l, l + s], [legStart, Math.min(r, legStart + s)]]);
        }
        break;
      case 'O':
        if (row === 0 || row === 9) rows.push([[l + s * 0.5, r - s * 0.5]]);
        else if (row === 1 || row === 8) rows.push([[l + s * 0.2, l + s * 1.1], [r - s * 1.1, r - s * 0.2]]);
        else rows.push([[l, l + s], [r - s, r]]);
        break;
      case 'M':
        if (row === 0) rows.push([[l, l + s * 1.2], [r - s * 1.2, r]]);
        else if (row === 1) rows.push([[l, l + s], [l + s * 1.1, l + s * 1.9], [r - s * 1.9, r - s * 1.1], [r - s, r]]);
        else if (row === 2) rows.push([[l, l + s], [l + s * 1.7, l + s * 2.5], [r - s * 2.5, r - s * 1.7], [r - s, r]]);
        else if (row === 3) rows.push([[l, l + s], [mid - s * 0.8, mid + s * 0.8], [r - s, r]]);
        else if (row === 4) rows.push([[l, l + s], [mid - s * 0.5, mid + s * 0.5], [r - s, r]]);
        else rows.push([[l, l + s], [r - s, r]]);
        break;
      case 'T':
        if (row === 0) rows.push([[l, r]]);
        else rows.push([[mid - s * 0.6, mid + s * 0.6]]);
        break;
      case 'S':
        if (row === 0) rows.push([[l + s * 0.5, r]]);
        else if (row === 1) rows.push([[l, l + s], [r - s * 0.8, r]]);
        else if (row === 2) rows.push([[l, l + s]]);
        else if (row === 3) rows.push([[l + s * 0.2, l + s * 1.2]]);
        else if (row === 4) rows.push([[mid - s * 0.8, mid + s * 0.8]]);
        else if (row === 5) rows.push([[r - s * 1.2, r - s * 0.2]]);
        else if (row === 6) rows.push([[r - s, r]]);
        else if (row === 7) rows.push([[l, l + s * 0.8], [r - s, r]]);
        else if (row === 8) rows.push([[l, l + s * 0.9], [r - s, r]]);
        else rows.push([[l, r - s * 0.5]]);
        break;
      case 'K':
        if (row === 0) rows.push([[l, l + s], [r - s, r]]);
        else if (row === 1) rows.push([[l, l + s], [r - s * 1.4, r - s * 0.4]]);
        else if (row === 2) rows.push([[l, l + s], [l + s * 1.3, l + s * 2.3]]);
        else if (row === 3) rows.push([[l, l + s], [l + s * 0.8, l + s * 1.8]]);
        else if (row === 4 || row === 5) rows.push([[l, l + s * 1.4]]);
        else if (row === 6) rows.push([[l, l + s], [l + s * 0.8, l + s * 1.8]]);
        else if (row === 7) rows.push([[l, l + s], [l + s * 1.3, l + s * 2.3]]);
        else if (row === 8) rows.push([[l, l + s], [r - s * 1.4, r - s * 0.4]]);
        else rows.push([[l, l + s], [r - s, r]]);
        break;
      case 'I':
        if (row === 0 || row === 9) rows.push([[l, r]]);
        else rows.push([[mid - s * 0.6, mid + s * 0.6]]);
        break;
      case 'L':
        if (row === 9) rows.push([[l, r]]);
        else rows.push([[l, l + s]]);
        break;
      case 'W':
        if (row < 4) rows.push([[l, l + s], [mid - s * 0.5, mid + s * 0.5], [r - s, r]]);
        else if (row < 7) {
          const shift = (row - 3) * s * 0.25;
          rows.push([[l + shift, l + s + shift], [mid - s * 0.4, mid + s * 0.4], [r - s - shift, r - shift]]);
        } else {
          rows.push([[l + s * 0.8, l + s * 1.8], [r - s * 1.8, r - s * 0.8]]);
        }
        break;
      case 'A':
        if (row === 0) rows.push([[l + s * 0.5, r - s * 0.5]]);
        else if (row === 4) rows.push([[l, r]]);
        else rows.push([[l, l + s], [r - s, r]]);
        break;
      case 'E':
        if (row === 0 || row === 9) rows.push([[l, r]]);
        else if (row === 4 || row === 5) rows.push([[l, r - s * 0.4]]);
        else rows.push([[l, l + s]]);
        break;
      case 'B':
        if (row === 0 || row === 4 || row === 9) rows.push([[l, r - s * 0.3]]);
        else rows.push([[l, l + s], [r - s, r]]);
        break;
      default:
        rows.push([[l, r]]);
    }
  }
  return rows;
}

export function compileWordGrid(wordStr, totalWidth = 640, padding = 45) {
  const letters = wordStr.split('');
  const n = letters.length;
  const avail = totalWidth - padding * 2;
  const gap = Math.max(10, Math.floor(avail * 0.035));
  const letterW = Math.floor((avail - gap * (n - 1)) / n);
  const startX = padding + Math.floor((avail - (letterW * n + gap * (n - 1))) / 2);

  const wordRows = Array.from({ length: 10 }, () => []);

  letters.forEach((char, lIdx) => {
    const x0 = startX + lIdx * (letterW + gap);
    const charRows = generateCharGlyph(char, x0, letterW);
    charRows.forEach((rowSegments, rIdx) => {
      rowSegments.forEach(([segX0, segX1]) => {
        wordRows[rIdx].push([
          Math.round(segX0 * 10) / 10,
          Math.round(segX1 * 10) / 10,
          lIdx,
          n
        ]);
      });
    });
  });

  return wordRows;
}

export const WORDS = [
  compileWordGrid("PROMPT"),
  compileWordGrid("SKILLS"),
  compileWordGrid("WIBI"),
  compileWordGrid("TASTE")
];
