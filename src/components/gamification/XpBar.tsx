"use client";

import { useEffect, useState } from "react";
import { useGamification, xpToNextLevel } from "@/lib/gamification-store";

export default function XpBar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const { state, hydrated } = useGamification();
  const [popLevel, setPopLevel] = useState<number | null>(null);

  useEffect(() => {
    const onLvl = (e: Event) => {
      const detail = (e as CustomEvent<{ level: number }>).detail;
      setPopLevel(detail.level);
      const t = setTimeout(() => setPopLevel(null), 1800);
      return () => clearTimeout(t);
    };
    window.addEventListener("gamification:level-up", onLvl);
    return () => window.removeEventListener("gamification:level-up", onLvl);
  }, []);

  if (!hydrated) {
    return (
      <div className="h-14 border-[2px] border-[var(--line)] bg-[var(--bg-2)] animate-pulse" />
    );
  }

  const lvl = state.level;
  const { current, nextAt, pct } = xpToNextLevel(state.xp);
  const barH = size === "lg" ? "h-6" : size === "sm" ? "h-3" : "h-4";
  const lvlSize = size === "lg" ? "text-5xl" : size === "sm" ? "text-2xl" : "text-3xl";

  return (
    <div className="relative">
      {popLevel !== null && (
        <span className="onomatopeia absolute -top-6 left-12 text-2xl pointer-events-none">
          POW!
        </span>
      )}
      <div className="flex items-end justify-between gap-3 mb-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
            {">"} level
          </span>
          <span
            className={`display ${lvlSize} text-[var(--akira-red)] glow-red leading-none numerals`}
          >
            LV {lvl}
          </span>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
            XP // 経験値
          </p>
          <p className="font-mono text-xs text-[var(--akira-cyan)] numerals">
            {current.toLocaleString("pt-BR")} / {nextAt.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      <div
        className={`relative ${barH} border-[2px] border-[var(--line)] bg-[var(--bg-3)] overflow-hidden`}
      >
        <div
          className="absolute inset-y-0 left-0 bg-[var(--akira-red)] transition-[width] duration-700 ease-out shadow-[0_0_18px_var(--akira-red)]"
          style={{ width: `${pct}%` }}
        />
        <div className="absolute inset-0 halftone-red opacity-30 pointer-events-none" />
        {size !== "sm" && (
          <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-[var(--ink)] tracking-widest mix-blend-difference">
            {pct.toFixed(0)}%
          </span>
        )}
      </div>

      <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
        {">"} total xp: <span className="text-[var(--akira-yellow)] numerals">{state.xp.toLocaleString("pt-BR")}</span>
      </p>
    </div>
  );
}
