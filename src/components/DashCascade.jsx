import React, { useEffect, useRef } from "react";
import { DashCascade as DashCascadeEngine } from "./dash-cascade/engine";

export function DashCascade({ className = "", compact = false }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let engine = null;
    let onScreen = false;
    let hidden = false;

    const sync = () => {
      if (!engine || reduced) return;
      if (onScreen && !hidden) engine.start();
      else engine.stop();
    };

    const raf = requestAnimationFrame(() => {
      if (!canvasRef.current) return;
      engine = new DashCascadeEngine(canvas);
      engineRef.current = engine;
      if (!engine.ok) return;
      if (reduced) engine.renderStill();
      else sync();
    });

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? false;
        sync();
      },
      { threshold: 0.1 }
    );
    io.observe(canvas);

    const onVis = () => {
      hidden = document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVis);

    let rt = 0;
    const onResize = () => {
      window.clearTimeout(rt);
      rt = window.setTimeout(() => engine?.resize(), 80);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(rt);
      engine?.destroy();
      engineRef.current = null;
    };
  }, []);

  return (
    <div
      role="img"
      aria-label="PROMPT, SKILLS, WIBI word cascade animation"
      className={`relative w-full select-none cursor-pointer overflow-hidden group transition-colors ${
        compact
          ? 'h-[110px] min-h-[110px] bg-[#fafafc] dark:bg-[#121215] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl p-3 shadow-2xs flex flex-col justify-between'
          : 'h-full min-h-[300px] sm:min-h-[340px] bg-[#fafafc] dark:bg-[#121215] border border-black/[0.08] dark:border-white/[0.08] rounded-3xl p-5 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)] flex flex-col justify-between'
      } ${className}`}
      onPointerEnter={() => engineRef.current?.setHover(true)}
      onPointerLeave={() => engineRef.current?.setHover(false)}
    >
      {/* Top Precision Header Bar */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-indigo-500 dark:text-indigo-400 text-xs select-none">✦</span>
          <span className={`${compact ? 'text-[9.5px]' : 'text-[10px] sm:text-[11px]'} font-mono tracking-widest text-[#86868b] dark:text-zinc-400 uppercase`}>
            SKILLS · STYLES · TASTE
          </span>
        </div>
        <div className={`flex items-center gap-1 font-mono ${compact ? 'text-[9.5px]' : 'text-[10px] sm:text-[11px]'} text-[#86868b] dark:text-zinc-400`}>
          <span>EDITION</span>
          <span className="text-black/30 dark:text-white/30 font-light">·</span>
          <span>2026</span>
        </div>
      </div>

      {/* Left precision 4 vertical dot points (Desktop only) */}
      {!compact && (
        <div className="absolute left-5 top-14 flex flex-col gap-1.5 z-10 pointer-events-none opacity-40">
          <span className="w-1 h-1 rounded-full bg-black/40 dark:bg-white/50" />
          <span className="w-1 h-1 rounded-full bg-black/40 dark:bg-white/50" />
          <span className="w-1 h-1 rounded-full bg-black/40 dark:bg-white/50" />
          <span className="w-1 h-1 rounded-full bg-black/40 dark:bg-white/50" />
        </div>
      )}

      {/* Center Dynamic Word Cascade Canvas */}
      <div className={`relative w-full ${compact ? 'h-14' : 'h-44 sm:h-52'} my-auto z-10 flex items-center justify-center`}>
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Bottom Precision Footer Row */}
      {!compact && (
        <div className="flex items-center justify-between z-10 pt-2 font-mono text-[10px] text-[#86868b] dark:text-zinc-400">
          <span className="tracking-wider text-[#86868b] dark:text-zinc-400 uppercase">
            TASTE IS THE NEW SYNTAX
          </span>
          <div className="flex items-center gap-2">
            <span className="tracking-widest">37.7749°N, 122.4194°W</span>
          </div>
        </div>
      )}

      {/* Precision Corner Crop Mark (Bottom-Right) */}
      {!compact && (
        <div className="absolute right-4 bottom-12 text-[#86868b]/30 dark:text-white/20 font-mono text-xs select-none pointer-events-none">
          ⌝
        </div>
      )}
    </div>
  );
}
