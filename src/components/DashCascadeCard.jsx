import React, { useEffect, useRef, useState } from "react";
import { DashCascade } from "./dash-cascade/engine";
import { Sparkles, Terminal, Palette } from "lucide-react";

export function DashCascadeCard({ className = "" }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [activeWordIndex, setActiveWordIndex] = useState(0);

  const wordLabels = [
    { label: "PROMPT", desc: "提示词灵感", icon: Palette, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
    { label: "SKILLS", desc: "开源工具流", icon: Terminal, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { label: "WIBI", desc: "威比创意库", icon: Sparkles, color: "text-amber-600 bg-amber-50 border-amber-200" },
  ];

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

    const interval = setInterval(() => {
      if (engineRef.current) {
        setActiveWordIndex(engineRef.current.word || 0);
      }
    }, 250);

    const raf = requestAnimationFrame(() => {
      if (!canvasRef.current) return;
      engine = new DashCascade(canvas);
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
      { threshold: 0.15 }
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
      rt = window.setTimeout(() => engine?.resize(), 100);
    };
    window.addEventListener("resize", onResize);

    return () => {
      clearInterval(interval);
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
      className={`group relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm border border-black/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.08)] transition-all duration-300 ${className}`}
      onPointerEnter={() => engineRef.current?.setHover(true)}
      onPointerLeave={() => engineRef.current?.setHover(false)}
    >
      {/* Top micro badges */}
      <div className="absolute top-2.5 sm:top-3.5 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-1.5">
          {wordLabels.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeWordIndex === idx;
            return (
              <div
                key={item.label}
                className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-medium border transition-all duration-300 ${
                  isActive
                    ? `${item.color} shadow-xs font-bold scale-105`
                    : "bg-[#fafafc] text-[#86868b] border-black/[0.04] opacity-50"
                }`}
              >
                <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        <span className="text-[10px] font-mono text-[#86868b] hidden sm:inline-block">
          10FPS · DOT-MATRIX
        </span>
      </div>

      {/* Canvas Area */}
      <div className="w-full h-36 sm:h-44 md:h-48 pt-4 pb-1">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Bottom subtle indicator bar */}
      <div className="px-3 py-1.5 sm:py-2 border-t border-black/[0.04] bg-[#fafafc]/80 flex items-center justify-between text-[10px] text-[#86868b]">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span>动态点阵折叠 · 悬停加速彩光</span>
        </span>
        <span className="font-mono text-[#515154]">
          {wordLabels[activeWordIndex]?.desc || "动态生成"}
        </span>
      </div>
    </div>
  );
}

