import React, { useEffect, useRef, useState, useMemo } from 'react';
import './sketchbook.css';
import { 
  ArrowLeft, 
  BookOpen, 
  Shuffle, 
  Sparkles, 
  Maximize2, 
  Minimize2,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { generateSpreadImage, cleanTitle } from './spreadGenerator';

const N = 18;           // strips — enough for a smooth curve
const SPAN = 0.449;     // gutter -> outer page edge
const BETA = 0.60;      // peak curl of arc
const TILT_X = 4.5, TILT_Y = 7;
const ZOOM_MIN = 0.9, ZOOM_MAX = 1.5;
const MAG = 2.3;

export function SketchbookView({
  items = [],
  onExit,
  onSelect,
  onCopy
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomText, setZoomText] = useState('100%');
  const [loupeActive, setLoupeActive] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  const containerRef = useRef(null);
  const sb3dRef = useRef(null);
  const bookRef = useRef(null);
  const zoomWrapRef = useRef(null);
  const zoomInnerRef = useRef(null);
  const loupeRef = useRef(null);
  const capBoxRef = useRef(null);
  const hintRef = useRef(null);

  // Category filtering state ("按类浏览")
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCatMenuOpen, setIsCatMenuOpen] = useState(false);

  // Group unique categories
  const categoryOptions = useMemo(() => {
    if (!items || items.length === 0) return [];
    const counts = {};
    items.forEach(it => {
      const c = it.category || '未分类';
      counts[c] = (counts[c] || 0) + 1;
    });
    const list = Object.entries(counts)
      .map(([name, count]) => ({ id: name, label: name, count }))
      .sort((a, b) => b.count - a.count);
    return [
      { id: 'all', label: '全部灵感', count: items.length },
      { id: 'type:style', label: '🎨 视觉风格提示词', count: items.filter(it => it.type === 'style').length },
      { id: 'type:skill', label: '⚡ 开源技能', count: items.filter(it => it.type === 'skill').length },
      ...list
    ];
  }, [items]);

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (selectedCategory === 'all') return items;
    if (selectedCategory === 'type:style') return items.filter(it => it.type === 'style');
    if (selectedCategory === 'type:skill') return items.filter(it => it.type === 'skill');
    return items.filter(it => it.category === selectedCategory);
  }, [items, selectedCategory]);

  // Prepare pages dataset: generated custom style spreads
  const [pages, setPages] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadPages() {
      // 100% Pure project items — Zero external demo items
      if (!filteredItems || filteredItems.length === 0) {
        setPages([]);
        return;
      }

      const spreadItems = filteredItems.slice(0, 60);

      const spreadList = spreadItems.map((item, i) => ({
        ...item,
        url: '',
        place: item.category || (item.type === 'skill' ? '开源技能' : '视觉风格'),
        spreadIndex: i
      }));

      // Pre-generate the first 3 spreads for instant 0.05s open
      if (spreadItems.length > 0) {
        const firstUrl = await generateSpreadImage(spreadItems[0], 0);
        spreadList[0].url = firstUrl;
        
        if (spreadItems.length > 1) {
          generateSpreadImage(spreadItems[1], 1).then(url => {
            if (url) spreadList[1].url = url;
          });
        }
        if (spreadItems.length > 2) {
          generateSpreadImage(spreadItems[2], 2).then(url => {
            if (url) spreadList[2].url = url;
          });
        }
      }

      if (isMounted) {
        setPages(spreadList);
        if (spreadList.length > 0) {
          setActiveItem(spreadList[0]);
        }
      }

      // Idle-time background preheating for the rest of pages
      setTimeout(async () => {
        for (let i = 3; i < spreadItems.length; i++) {
          if (!isMounted) break;
          const it = spreadItems[i];
          if (!spreadList[i].url) {
            const url = await generateSpreadImage(it, i);
            if (url) spreadList[i].url = url;
          }
        }
      }, 400);
    }

    loadPages();
    return () => { isMounted = false; };
  }, [filteredItems]);

  useEffect(() => {
    const book = bookRef.current;
    const sb3d = sb3dRef.current;
    const zoomWrap = zoomWrapRef.current;
    const zoomInner = zoomInnerRef.current;
    const loupe = loupeRef.current;
    const capBox = capBoxRef.current;
    const hint = hintRef.current;

    if (!book || !sb3d || !loupe || !pages.length) return;

    const M = pages.length;
    const LAND = Math.min(6, M - 1);
    const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let idx = 0;
    let turn = null; // { dir, from, to, t }
    let strips = [];
    let spring = null;
    let raf = null;
    let last = 0;
    let drag = null;
    let introOn = false;
    let riffle = null;
    let riffleAt = 0;

    // View tilt & zoom
    const view = { rx: 0, ry: 0, z: 1, trx: 0, try_: 0, tz: 1 };
    let viewActive = false;
    let lastZ = 1;

    // Loupe state
    let loupeOn = true;
    let lx = null, ly = null, lgrab = null, lTarget = null;

    function el(t, c) {
      const e = document.createElement(t);
      if (c) e.className = c;
      return e;
    }

    function imgEl(i, side) {
      const im = new Image();
      im.className = 'sb-half-img ' + side;
      im.draggable = false;
      im.alt = cleanTitle(pages[i]?.title) || '';
      im.src = pages[i]?.url || '/sketchbook/blank-sketchbook.webp';
      if (pages[i] && !pages[i].url && true) {
        generateSpreadImage(pages[i], pages[i].spreadIndex ?? i).then(url => {
          if (url) {
            pages[i].url = url;
            im.src = url;
          }
        });
      }
      return im;
    }

    function halfEl(pos, i) {
      const d = el('div', 'sb-half ' + pos);
      d.appendChild(imgEl(i, pos));
      d.appendChild(el('div', 'gutter-shade ' + pos));
      return d;
    }

    function buildCurl(dir, from, to) {
      strips = [];
      const c = el('div', 'curl ' + dir);
      c.style.setProperty('--n', String(N));
      c.style.setProperty('--span', String(SPAN));
      let host = c;
      for (let i = 0; i < N; i++) {
        const s = el('div', 'strip');
        s.style.setProperty('--i', String(i));
        const gut = 'calc(var(--bw) * 0.5)';
        const sw = 'calc(var(--bw) * ' + SPAN + ' / ' + N + ')';
        const A = 'calc(-1 * (' + gut + ' + ' + i + ' * ' + sw + '))';
        const B = 'calc(' + (i + 1) + ' * ' + sw + ' - ' + gut + ')';
        const f = el('div', 'face front');
        const b = el('div', 'face back');
        
        const dress = (elem, url, px) => {
          elem.style.backgroundImage = 'url(' + (url || '/sketchbook/blank-sketchbook.webp') + ')';
          elem.style.backgroundPositionX = px;
        };
        dress(f, pages[from].url, dir === 'next' ? A : B);
        dress(b, pages[to].url, dir === 'next' ? B : A);

        f.appendChild(el('div', 'sh'));
        f.appendChild(el('div', 'gl'));
        b.appendChild(el('div', 'sh'));
        b.appendChild(el('div', 'gl'));
        s.appendChild(f);
        s.appendChild(b);
        if (i === N - 1) s.classList.add('edge');
        host.appendChild(s);
        host = s;
        strips.push(s);
      }
      return c;
    }

    function applyTurn(t) {
      const th = Math.PI * t;
      const beta = BETA * Math.sin(Math.PI * t);
      const D = 180 / Math.PI;
      const tt = th + beta;
      const td = (2 * beta) / N;
      sb3d.style.setProperty('--tt', (tt * D).toFixed(2) + 'deg');
      sb3d.style.setProperty('--td', (td * D).toFixed(3) + 'deg');
      sb3d.style.setProperty('--shade', Math.sin(Math.PI * t).toFixed(3));
      fadeCaption(t);
      for (let i = 0; i < strips.length; i++) {
        const l1 = Math.abs(Math.cos(tt - i * td));
        const l2 = Math.abs(Math.cos(tt - (i + 1) * td));
        const st = strips[i].style;
        st.setProperty('--lit', l1.toFixed(3));
        st.setProperty('--a1', ((1 - l1) * 0.62).toFixed(3));
        st.setProperty('--a2', ((1 - l2) * 0.62).toFixed(3));
      }
    }

    let capOut = null, capIn = null;
    function fadeCaption(t) {
      if (!capOut || !capIn) return;
      const out = 1 - Math.max(0, Math.min(1, (t - 0.10) / 0.28));
      const inn = Math.max(0, Math.min(1, (t - 0.56) / 0.30));
      capOut.style.opacity = out.toFixed(3);
      capIn.style.opacity = inn.toFixed(3);
    }

    function syncActivePage(targetIdx) {
      const page = pages[targetIdx];
      if (page) {
        setActiveItem(page);
      }
    }

    function caption() {
      if (!capBox) return;
      capBox.textContent = '';
      capOut = capIn = null;

      if (turn) {
        capOut = el('p', 'sb-caption live');
        capOut.textContent = cleanTitle(pages[turn.from].title) + ' · ' + (pages[turn.from].place || '');
        capBox.appendChild(capOut);
        capIn = el('p', 'sb-caption live');
        capIn.textContent = cleanTitle(pages[turn.to].title) + ' · ' + (pages[turn.to].place || '');
        capBox.appendChild(capIn);
        fadeCaption(turn.t);
      } else {
        const p = el('p', 'sb-caption');
        p.textContent = cleanTitle(pages[idx].title) + ' · ' + (pages[idx].place || '');
        capBox.appendChild(p);
      }
    }

    function layout() {
      if (book && sb3d) {
        sb3d.style.setProperty('--bw', book.clientWidth + 'px');
      }
    }

    function marks() {
      // Plate thumbnails removed in 100vh single-screen layout
    }

    function syncZoomLayer() {
      if (!zoomInner || !book) return;
      zoomInner.textContent = '';
      for (const c of book.children) {
        if (c.classList.contains('sb-zone')) continue;
        zoomInner.appendChild(c.cloneNode(true));
      }
    }

    function loupeSize() {
      return Math.round(Math.max(130, Math.min(210, (book?.clientWidth || 800) * 0.20)));
    }

    function bookBox() {
      return { x: 0, y: 0, w: book?.clientWidth || 800, h: book?.clientHeight || 560 };
    }

    function restLoupe() {
      const b = bookBox();
      lx = b.x + b.w * 0.84;
      ly = b.y + b.h * 0.70;
      placeLoupe();
    }

    function placeLoupe() {
      if (lx === null || !loupe || !zoomWrap || !zoomInner) return;
      const B = bookBox(), bw = B.w, bh = B.h;
      if (!bw) return;
      const R = loupeSize() / 2, bez = R * 2 * 0.058;
      loupe.style.setProperty('--lr', R * 2 + 'px');
      loupe.style.transform = 'translate3d(' + (lx - R).toFixed(1) + 'px,' + (ly - R).toFixed(1) + 'px,0)';
      if (loupeOn) loupe.classList.add('on');

      const z = view.z, cx = bw / 2, cy = bh / 2;
      const x0 = cx + (bw * 0.051 - cx) * z, x1 = cx + (bw * 0.949 - cx) * z;
      const y0 = cy + (bh * 0.218 - cy) * z, y1 = cy + (bh * 0.782 - cy) * z;
      const nx = Math.max(x0, Math.min(lx, x1));
      const ny = Math.max(y0, Math.min(ly, y1));
      const inside = (lx > x0 && lx < x1 && ly > y0 && ly < y1)
        ? Math.min(lx - x0, x1 - lx, ly - y0, y1 - ly)
        : -Math.hypot(lx - nx, ly - ny);
      const k = Math.max(0, Math.min(1, (inside + R * 0.30) / (R * 0.55)));

      zoomWrap.style.opacity = (loupeOn ? k : 0).toFixed(3);
      if (k <= 0.002) return;
      const r = (R - bez).toFixed(1);
      const mask = 'radial-gradient(circle ' + r + 'px at ' + lx.toFixed(1) + 'px ' + ly.toFixed(1) + 'px,#000 calc(100% - 1px),transparent 100%)';
      zoomWrap.style.webkitMaskImage = mask;
      zoomWrap.style.maskImage = mask;
      const px = cx + (lx - cx) / z, py = cy + (ly - cy) / z, s = MAG * z;
      zoomInner.style.transform = 'translate(' + (lx - px * s).toFixed(1) + 'px,' + (ly - py * s).toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
    }

    function shoveLoupe(dir) {
      if (!loupeOn || lx === null || lgrab || !book) return;
      const b = bookBox();
      const nx = (b.w / 2 + (lx - b.x - b.w / 2) / view.z) / b.w;
      const ny = (b.h / 2 + (ly - b.y - b.h / 2) / view.z) / b.h;
      if (nx < 0.02 || nx > 0.98 || ny < 0.17 || ny > 0.83) return;
      lTarget = { x: b.x + b.w * (dir === 'next' ? 0.20 : 0.80), y: b.y + b.h * 0.48 };
      kick();
    }

    function loupeEase() {
      if (!lTarget) return false;
      if (lgrab) { lTarget = null; return false; }
      const dx = lTarget.x - lx, dy = lTarget.y - ly;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        lx = lTarget.x; ly = lTarget.y; lTarget = null; placeLoupe(); return false;
      }
      lx += dx * 0.17; ly += dy * 0.17; placeLoupe();
      return true;
    }

    function paint() {
      if (!book) return;
      book.textContent = '';
      if (!turn) {
        const f = el('div', 'sb-full');
        const im = new Image();
        im.src = pages[idx]?.url || '/sketchbook/blank-sketchbook.webp';
        im.alt = cleanTitle(pages[idx]?.title);
        im.draggable = false;
        if (pages[idx] && !pages[idx].url && true) {
          generateSpreadImage(pages[idx], pages[idx].spreadIndex ?? idx).then(url => {
            if (url) {
              pages[idx].url = url;
              im.src = url;
            }
          });
        }
        f.appendChild(im);
        book.appendChild(f);
        sb3d.style.setProperty('--shade', '0');
      } else {
        const next = turn.dir === 'next';
        book.appendChild(halfEl('left', next ? turn.from : turn.to));
        book.appendChild(halfEl('right', next ? turn.to : turn.from));
        book.appendChild(buildCurl(turn.dir, turn.from, turn.to));
        applyTurn(turn.t);
      }
      const a = el('button', 'sb-zone sb-prev');
      const b = el('button', 'sb-zone sb-next');
      a.setAttribute('aria-label', 'previous page');
      b.setAttribute('aria-label', 'next page');
      book.appendChild(a);
      book.appendChild(b);
      layout();
      caption();
      marks();
      syncZoomLayer();
      placeLoupe();
    }

    function animateTo(target, onDone, stiff, damp) {
      spring = { kind: 'spring', v: 0, target: target, done: onDone, k: stiff || 150, c: damp || 22 };
      kick();
    }

    function tweenTo(target, dur, onDone) {
      spring = { kind: 'tween', from: turn ? turn.t : 0, target: target, dur: dur, e: 0, done: onDone };
      kick();
    }

    function tick(now) {
      raf = null;
      const dt = Math.min(0.032, (now - last) / 1000 || 0.016);
      last = now;
      if (spring && turn) {
        const s = spring;
        if (s.kind === 'tween') {
          s.e += dt;
          const k = Math.min(1, s.e / s.dur);
          turn.t = s.from + (s.target - s.from) * k;
          applyTurn(turn.t);
          if (k >= 1) { spring = null; s.done && s.done(); }
        } else {
          const x = turn.t - s.target;
          s.v += (-s.k * x - s.c * s.v) * dt;
          turn.t += s.v * dt;
          if (Math.abs(turn.t - s.target) < 0.002 && Math.abs(s.v) < 0.02) {
            turn.t = s.target; spring = null; applyTurn(turn.t); s.done && s.done();
          } else {
            applyTurn(turn.t);
          }
        }
      }
      viewSpring();
      const lmoved = loupeEase();
      if ((spring || viewActive || lmoved) && raf === null) {
        raf = requestAnimationFrame(tick);
      }
    }

    function kick() {
      if (raf === null) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    }

    function applyView() {
      if (!sb3d) return;
      sb3d.style.setProperty('--rx', view.rx.toFixed(2) + 'deg');
      sb3d.style.setProperty('--ry', view.ry.toFixed(2) + 'deg');
      sb3d.style.setProperty('--zoom', view.z.toFixed(3));
      if (view.z !== lastZ) {
        lastZ = view.z;
        placeLoupe();
      }
    }

    function viewSpring() {
      const e = 0.14;
      let moved = false;
      for (const [k, t] of [['rx', 'trx'], ['ry', 'try_'], ['z', 'tz']]) {
        const d = view[t] - view[k];
        if (Math.abs(d) > 0.0006) {
          view[k] += d * e;
          moved = true;
        } else {
          view[k] = view[t];
        }
      }
      if (moved) applyView();
      viewActive = moved;
      return moved;
    }

    function setView(rx, ry, z) {
      view.trx = Math.max(-TILT_X, Math.min(TILT_X, rx));
      view.try_ = Math.max(-TILT_Y, Math.min(TILT_Y, ry));
      view.tz = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
      viewActive = true;
      kick();
      setZoomText(Math.round(view.tz * 100) + '%');
    }

    function tiltTo(cx, cy) {
      if (drag || !book) return;
      const r = book.getBoundingClientRect();
      if (!r.width) return;
      const nx = Math.max(-1, Math.min(1, (cx - (r.left + r.width / 2)) / (r.width * 0.62)));
      const ny = Math.max(-1, Math.min(1, (cy - (r.top + r.height / 2)) / (r.height * 0.9)));
      setView(-ny * TILT_X, nx * TILT_Y, view.tz);
    }

    const onPointerMove = (e) => {
      if (e.pointerType === 'touch') return;
      tiltTo(e.clientX, e.clientY);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    function hideHint() {
      hint?.classList.add('gone');
    }

    function startTurn(dir, t) {
      spring = null;
      if (turn) { idx = turn.to; turn = null; }
      const from = idx;
      turn = { dir: dir, from: from, to: dir === 'next' ? (from + 1) % M : (from - 1 + M) % M, t: t || 0 };
      paint();
    }

    function commit() {
      if (!turn) return;
      const targetIdx = turn.to;
      if (REDUCED) { 
        idx = targetIdx; 
        turn = null; 
        paint(); 
        syncActivePage(targetIdx);
        return; 
      }
      animateTo(1, () => { 
        idx = targetIdx; 
        turn = null; 
        paint(); 
        syncActivePage(targetIdx);
      }, 170, 26);
      kick();
    }

    function cancel() {
      if (!turn) return;
      const currentIdx = idx;
      animateTo(0, () => { 
        turn = null; 
        paint(); 
        syncActivePage(currentIdx);
      }, 150, 24);
      kick();
    }

    function step(dir) {
      if (introOn) endIntro();
      if (turn) { idx = turn.to; turn = null; }
      startTurn(dir, 0);
      commit();
    }

    function goTo(i) {
      if (introOn) endIntro();
      if (i === idx) return;
      if (turn) { idx = turn.to; turn = null; }
      const fwd = (i - idx + M) % M, back = (idx - i + M) % M;
      if (Math.min(fwd, back) === 1) {
        step(fwd === 1 ? 'next' : 'prev');
        return;
      }
      idx = i;
      paint();
      syncActivePage(i);
    }

    // Pointer down on book
    const onStagePointerDown = (e) => {
      if (e.button !== 0) return;
      const onBook = e.target.closest('.sb-zone');
      if (!onBook || introOn) return;
      e.preventDefault();
      hideHint();
      const r = book.getBoundingClientRect();
      const dir = (e.clientX - r.left) / r.width > 0.5 ? 'next' : 'prev';
      startTurn(dir, 0);
      drag = { dir: dir, x0: e.clientX, w: r.width, moved: 0, vel: 0, tPrev: performance.now() };
    };

    const onStagePointerMove = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x0;
      drag.moved = Math.max(drag.moved, Math.abs(dx));
      const raw = (drag.dir === 'next' ? -dx : dx) / (drag.w * 0.62);
      const t = Math.max(0, Math.min(1, raw));
      const now = performance.now();
      drag.vel = (t - (turn ? turn.t : 0)) / Math.max(0.001, (now - drag.tPrev) / 1000);
      drag.tPrev = now;
      if (turn) { turn.t = t; applyTurn(t); }
    };

    const onStagePointerUp = () => {
      if (!drag) return;
      const d = drag;
      drag = null;
      if (!turn) return;
      if (d.moved < 6) { commit(); return; }
      const go = turn.t > 0.42 || d.vel > 1.1;
      if (go) commit(); else cancel();
    };

    const stageEl = containerRef.current?.querySelector('#sbStage');
    if (stageEl) {
      stageEl.addEventListener('pointerdown', onStagePointerDown);
      window.addEventListener('pointermove', onStagePointerMove);
      window.addEventListener('pointerup', onStagePointerUp);
      window.addEventListener('pointercancel', onStagePointerUp);
    }

    // Loupe drag
    const onLoupeDown = (e) => {
      if (!loupeOn || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      lTarget = null;
      lgrab = { cx: e.clientX, cy: e.clientY, lx0: lx, ly0: ly };
      loupe.classList.add('held');
      hideHint();
    };

    const onLoupeMove = (e) => {
      if (!lgrab || !book) return;
      const b = bookBox(), R = loupeSize() / 2;
      lx = Math.max(b.x - R * 0.7, Math.min(b.x + b.w + R * 0.7, lgrab.lx0 + (e.clientX - lgrab.cx)));
      ly = Math.max(b.y - R * 0.7, Math.min(b.y + b.h - R * 0.1, lgrab.ly0 + (e.clientY - lgrab.cy)));
      placeLoupe();
    };

    const onLoupeUp = () => {
      lgrab = null;
      loupe.classList.remove('held');
    };

    loupe.addEventListener('pointerdown', onLoupeDown);
    window.addEventListener('pointermove', onLoupeMove);
    window.addEventListener('pointerup', onLoupeUp);

    // Keyboard navigation
    const onKeyDown = (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      e.preventDefault();
      hideHint();
      step(e.key === 'ArrowRight' ? 'next' : 'prev');
    };
    window.addEventListener('keydown', onKeyDown);


    // Opening Riffle
    function endIntro() {
      introOn = false;
      const wrap = document.getElementById('sbWrap');
      wrap?.classList.remove('intro', 'b2');
    }

    function riffleStep() {
      const s = riffle[riffleAt];
      const wrap = document.getElementById('sbWrap');
      wrap?.classList.toggle('b2', s.bell > 0.55);
      startTurn('next', 0);
      tweenTo(1, s.dur, () => {
        idx = turn.to;
        turn = null;
        riffleAt++;
        if (introOn && riffleAt < riffle.length) {
          paint();
          riffleStep();
        } else {
          endIntro();
          paint();
          syncActivePage(idx);
        }
      });
    }

    function startIntro() {
      const coarse = matchMedia('(max-width: 640px), (pointer: coarse)').matches;
      if (coarse || REDUCED) {
        idx = LAND;
        paint();
        syncActivePage(LAND);
        return;
      }
      const steps = M + LAND;
      riffle = [];
      for (let r = 0; r < steps; r++) {
        const bell = Math.sin(Math.PI * (r / (steps - 1)));
        riffle.push({ bell: bell, dur: 0.26 - 0.19 * bell });
      }
      riffleAt = 0;
      introOn = true;
      const wrap = document.getElementById('sbWrap');
      wrap?.classList.add('intro');
      riffleStep();
    }

    // Button controls
    const sbLeftBtn = document.getElementById('sbLeft');
    const sbRightBtn = document.getElementById('sbRight');
    const zInBtn = document.getElementById('zIn');
    const zOutBtn = document.getElementById('zOut');
    const loupeBtn = document.getElementById('loupeBtn');

    if (sbLeftBtn) sbLeftBtn.onclick = () => step('prev');
    if (sbRightBtn) sbRightBtn.onclick = () => step('next');
    if (zInBtn) zInBtn.onclick = () => { setView(view.trx, view.try_, view.tz * 1.16); hideHint(); };
    if (zOutBtn) zOutBtn.onclick = () => { setView(view.trx, view.try_, view.tz / 1.16); hideHint(); };
    if (loupeBtn) {
      loupeBtn.onclick = () => {
        loupeOn = !loupeOn;
        setLoupeActive(loupeOn);
        loupe.classList.toggle('on', loupeOn);
        if (loupeOn && lx === null) restLoupe();
      };
    }

    // Boot
    paint();
    applyView();
    restLoupe();
    syncActivePage(idx);
    setTimeout(startIntro, 200);

    const onResize = () => {
      layout();
      lx = null;
      restLoupe();
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      if (stageEl) {
        stageEl.removeEventListener('pointerdown', onStagePointerDown);
      }
      window.removeEventListener('pointermove', onStagePointerMove);
      window.removeEventListener('pointerup', onStagePointerUp);
      window.removeEventListener('pointercancel', onStagePointerUp);
      loupe.removeEventListener('pointerdown', onLoupeDown);
      window.removeEventListener('pointermove', onLoupeMove);
      window.removeEventListener('pointerup', onLoupeUp);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pages]);

  const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleCopyCurrentPrompt = (e) => {
    e?.stopPropagation();
    if (!activeItem) return;
    let text = '';
    if (activeItem.type === 'skill') {
      text = activeItem.install_command || (activeItem.repo_url ? `请安装这个 Skill：${activeItem.repo_url}` : activeItem.command || activeItem.prompt);
    } else if (activeItem.type === 'tool') {
      text = activeItem.website_url || activeItem.url || activeItem.command || activeItem.description;
    } else {
      text = activeItem.prompt || activeItem.description || activeItem.title;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (onCopy) onCopy(activeItem);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div ref={containerRef} className="sb-container fixed inset-0 z-50 h-screen w-screen overflow-hidden flex flex-col justify-between">
      {/* Background painted watercolor ground */}
      <div className="sb-wash" aria-hidden="true" />

      {/* Top Header Bar */}
      <header className="sb-top">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="sb-brand">
            <BookOpen className="w-4 h-4 text-amber-900/70" />
            <span>风格速写本</span>
          </div>

          <a 
            href="https://twitter.com/MengTo" 
            target="_blank" 
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-serif text-amber-900/70 hover:text-amber-950 bg-amber-900/[0.04] hover:bg-amber-900/[0.08] border border-amber-900/15 transition-all"
            title="致敬 MengTo 先生的设计手账交互概念"
          >
            <span>✨ 致敬 MengTo</span>
          </a>

          {/* Borderless Floating Category Browser (按类浏览) */}
          <div 
            className="relative"
            onMouseEnter={() => setIsCatMenuOpen(true)}
            onMouseLeave={() => setIsCatMenuOpen(false)}
          >
            <button 
              onClick={() => setIsCatMenuOpen(prev => !prev)}
              className="h-7 inline-flex items-center gap-1.5 px-3 rounded-full text-[11px] font-serif text-amber-950/80 hover:text-amber-950 hover:bg-amber-900/[0.08] border border-amber-900/15 bg-amber-900/[0.04] transition-all cursor-pointer"
              title="按类切换速写本"
            >
              <span>按类浏览</span>
              <span className="text-[9px] opacity-60">▾</span>
              {selectedCategory !== 'all' && (
                <span className="text-[9.5px] px-1.5 py-0.2 rounded-full bg-amber-900/15 text-amber-950 font-sans font-medium">
                  {categoryOptions.find(c => c.id === selectedCategory)?.label || selectedCategory}
                </span>
              )}
            </button>

            {isCatMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-52 py-2 bg-[#f6f2e9]/95 backdrop-blur-md rounded-2xl shadow-[0_16px_36px_rgba(60,40,20,0.18)] border border-amber-900/15 z-50 animate-scale-in">
                <div className="px-3.5 py-1 text-[10px] font-mono tracking-widest text-amber-900/60 uppercase">
                  选择画册分类
                </div>
                <div className="max-h-64 overflow-y-auto scrollbar-none py-1">
                  {categoryOptions.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setIsCatMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs transition-colors flex items-center justify-between font-serif ${
                        selectedCategory === cat.id 
                          ? 'text-amber-950 font-bold bg-amber-900/15' 
                          : 'text-amber-900/80 hover:text-amber-950 hover:bg-amber-900/5'
                      }`}
                    >
                      <span className="truncate pr-2">{cat.label}</span>
                      <span className="text-[10px] font-mono opacity-60 shrink-0">({cat.count})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Tools & Exit */}
        <div className="flex items-center gap-2.5">
          {/* Zoom controls */}
          <div className="sb-tools" role="group" aria-label="view controls">
            <button className="sb-tool-btn" id="zOut" aria-label="zoom out" title="缩小">
              <svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <circle cx="8.6" cy="8.6" r="5.6"/>
                <path d="M12.8 12.8 17.4 17.4M6.2 8.6h4.8"/>
              </svg>
            </button>
            <span className="sb-zoom-read" id="zRead">{zoomText}</span>
            <button className="sb-tool-btn" id="zIn" aria-label="zoom in" title="放大">
              <svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <circle cx="8.6" cy="8.6" r="5.6"/>
                <path d="M12.8 12.8 17.4 17.4M6.2 8.6h4.8M8.6 6.2v4.8"/>
              </svg>
            </button>
            <span className="sb-tool-sep" aria-hidden="true" />
            <button 
              className="sb-tool-btn" 
              id="loupeBtn" 
              aria-label="magnifier" 
              aria-pressed={loupeActive ? 'true' : 'false'}
              title="切换放大镜"
            >
              <svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <circle cx="8.8" cy="8.8" r="5.8"/>
                <path d="M13 13l4.4 4.4"/>
                <path d="M6.4 7.2a3.2 3.2 0 0 1 2.4-1.4" opacity=".55"/>
              </svg>
            </button>
          </div>

          <button 
            onClick={onExit}
            className="sb-exit-btn"
            title="退出速写本返回画廊"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>返回画廊</span>
          </button>
        </div>
      </header>

      {/* Hero 3D Sketchbook Section */}
      <section className="sb-hero">
        <img className="sb-botany l" src="/sketchbook/botany-left.png" alt="" aria-hidden="true" />
        <img className="sb-botany r" src="/sketchbook/botany-right.png" alt="" aria-hidden="true" />

        <p className="sb-hero-kicker">
          AI VISUAL STYLES & OPEN SOURCE SKILLS · SKETCHBOOK EDITION
        </p>

        <div className="sb-wrap" id="sbWrap">
          {/* Motion blur filters */}
          <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
            <filter id="sb-mblur-1"><feGaussianBlur stdDeviation="5 0"/></filter>
            <filter id="sb-mblur-2"><feGaussianBlur stdDeviation="14 0"/></filter>
          </svg>

          <div className="sb-stage" id="sbStage">
            {/* Left page turn arrow */}
            <button className="sb-arrow left" id="sbLeft" aria-label="previous page">
              <svg viewBox="0 0 14 44" width="14" height="44" fill="none" aria-hidden="true">
                <polyline points="11,3 3,22 11,41" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* The 3D Book Stage */}
            <div className="sb-3d" id="sb3d" ref={sb3dRef}>
              <div className="sb-tilt" id="sbTilt">
                <div className="sb-cast ambient" aria-hidden="true" />
                <div className="sb-cast contact" aria-hidden="true" />
                <div className="sb-cast hair" aria-hidden="true" />
                <div className="sb-book" id="sbBook" ref={bookRef} />
              </div>

              {/* Real 2.3x Magnified Mirror Copy */}
              <div className="zoomwrap" id="zoomWrap" ref={zoomWrapRef} aria-hidden="true">
                <div className="zoominner" id="zoomInner" ref={zoomInnerRef} />
              </div>

              {/* The Draggable Brass Loupe */}
              <div className="loupe" id="loupe" ref={loupeRef}>
                <span className="grip" />
                <span className="ring">
                  <span className="lens" id="loupeLens">
                    <span className="mag" id="loupeMag" />
                  </span>
                </span>
              </div>
            </div>

            {/* Right page turn arrow */}
            <button className="sb-arrow right" id="sbRight" aria-label="next page">
              <svg viewBox="0 0 14 44" width="14" height="44" fill="none" aria-hidden="true">
                <polyline points="3,3 11,22 3,41" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Caption & Interactive Action bar (Directly below book) */}
          <div className="relative z-40 flex flex-col items-center gap-2.5 mt-4 pointer-events-auto">
            <div 
              className="sb-captions cursor-pointer hover:opacity-80 transition-opacity" 
              id="sbCaptions" 
              ref={capBoxRef}
              onClick={(e) => {
                e.stopPropagation();
                if (activeItem && onSelect) onSelect(activeItem);
              }}
              title="点击查看此条目的完整详情与样例"
            />
            
            {activeItem && (() => {
              const isSkill = activeItem.type === 'skill';
              const isTool = activeItem.type === 'tool';
              const copyLabel = isSkill ? '复制安装指令' : (isTool ? '复制工具网址' : '复制 Prompt 提示词');
              
              const imgCount = (activeItem.images && activeItem.images.length) || (activeItem.cover_image ? 1 : 0);
              let detailLabel = '查看完整详情';
              if (activeItem.type === 'style') {
                detailLabel = imgCount > 1 ? `查看详情与 ${imgCount} 张原图` : '查看详情与高清样张';
              } else if (isSkill) {
                detailLabel = '查看 Skill 详情与配置';
              } else if (isTool) {
                detailLabel = '查看工具详情与官网';
              }

              return (
                <div className="flex items-center gap-4 pt-1 pointer-events-auto select-none">
                  {/* Copy Prompt / Command / URL - Restrained Pure Text with Underline Animation */}
                  <button
                    onClick={handleCopyCurrentPrompt}
                    className="group/btn relative inline-flex items-center gap-1.5 py-0.5 text-[11px] font-serif text-amber-950/70 hover:text-amber-950 transition-colors duration-200 cursor-pointer"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-emerald-800 animate-in zoom-in-75" />
                    ) : (
                      <Copy className="w-3 h-3 text-amber-900/45 group-hover/btn:text-amber-900 transition-colors duration-200" />
                    )}
                    <span className="relative font-medium tracking-wide">
                      {copied ? '已复制！' : copyLabel}
                      <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-amber-900/40 group-hover/btn:w-full transition-all duration-300 ease-out" />
                    </span>
                  </button>

                  {/* Delicate slash divider */}
                  {onSelect && <span className="text-amber-900/25 text-[10px] font-sans select-none">/</span>}

                  {/* View Details - Restrained Pure Text with Underline Animation */}
                  {onSelect && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(activeItem);
                      }}
                      className="group/btn relative inline-flex items-center gap-1.5 py-0.5 text-[11px] font-serif text-amber-950/70 hover:text-amber-950 transition-colors duration-200 cursor-pointer"
                    >
                      <Maximize2 className="w-3 h-3 text-amber-900/45 group-hover/btn:text-amber-900 transition-colors duration-200" />
                      <span className="relative font-medium tracking-wide">
                        {detailLabel}
                        <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-amber-900/40 group-hover/btn:w-full transition-all duration-300 ease-out" />
                      </span>
                    </button>
                  )}
                </div>
              );
            })()}
          </div>

          <p className="sb-hint select-none" id="sbHint" ref={hintRef}>
            拖动页面翻页 · 拖动铜制放大镜观察笔触
          </p>
        </div>
      </section>
    </div>
  );
}

