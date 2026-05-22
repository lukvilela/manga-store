"use client";

import { useState } from "react";
import { useGamification } from "@/lib/gamification-store";

export default function StreakBadge() {
  const { state, hydrated } = useGamification();
  const [open, setOpen] = useState(false);

  if (!hydrated || state.streak.current < 3) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="group inline-flex items-center gap-1.5 px-2 py-1 border-[2px] border-[var(--akira-yellow)] bg-[var(--akira-yellow)]/10 hover:bg-[var(--akira-yellow)]/20 transition-all"
        title="Sequencia de visitas"
      >
        <span className="text-sm leading-none">🔥</span>
        <span className="font-mono text-[10px] font-bold text-[var(--akira-yellow)] numerals uppercase tracking-widest">
          {state.streak.current} dias
        </span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-64 border-[3px] border-[var(--ink)] bg-[var(--bg-2)] shadow-hard p-4">
            <p className="eyebrow !text-[var(--akira-yellow)]">Streak // 連続</p>
            <p className="display text-xl text-[var(--akira-yellow)] glow-yellow mt-1">
              {state.streak.current} DIAS
            </p>
            <p className="font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest mt-2">
              {">"} recorde: <span className="text-[var(--akira-cyan)] numerals">{state.streak.longest}</span> dias
            </p>
            <div className="mt-3 pt-3 border-t border-dashed border-[var(--line)]">
              <p className="font-mono text-[10px] text-[var(--ink-soft)] uppercase tracking-widest leading-relaxed">
                {">"} visite todo dia pra<br />
                {">"} subir streak +<br />
                {">"} desbloquear badges
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
