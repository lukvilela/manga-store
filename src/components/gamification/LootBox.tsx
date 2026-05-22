"use client";

import { useEffect, useState } from "react";
import { useGamification, type LootReward } from "@/lib/gamification-store";
import { useToast } from "@/context/ToastContext";

type Phase = "idle" | "spinning" | "revealed";

const ONOMATOPEIAS = ["DOKI!", "BAM!", "ZAP!", "POW!", "BANG!"];

export default function LootBox() {
  const { canSpinLootBox, spinLootBox, hydrated } = useGamification();
  const { show } = useToast();
  const [phase, setPhase] = useState<Phase>("idle");
  const [reward, setReward] = useState<LootReward | null>(null);
  const [available, setAvailable] = useState(false);
  const [pops, setPops] = useState<Array<{ id: number; text: string; x: number; y: number }>>([]);

  useEffect(() => {
    if (hydrated) setAvailable(canSpinLootBox());
  }, [hydrated, canSpinLootBox]);

  const handleSpin = () => {
    if (!available || phase !== "idle") return;
    setPhase("spinning");
    // spawn onomatopeias
    const popList = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      text: ONOMATOPEIAS[i % ONOMATOPEIAS.length],
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 70,
    }));
    setPops(popList);

    setTimeout(() => {
      const result = spinLootBox();
      setReward(result);
      setPhase("revealed");
      setAvailable(false);
      setPops([]);
      if (result) {
        show(`Loot Box: ${result.label}!`, "success", 5000);
      }
    }, 1800);
  };

  if (!hydrated) {
    return (
      <div className="h-48 border-[2px] border-[var(--line)] bg-[var(--bg-2)] animate-pulse" />
    );
  }

  return (
    <section className="relative panel-frame bg-[var(--bg-2)] p-6 md:p-8 overflow-hidden">
      <div className="absolute inset-0 halftone-yellow opacity-20 pointer-events-none" />
      <div className="absolute -right-8 -top-8 jp text-[140px] text-[var(--akira-yellow)]/15 leading-none select-none pointer-events-none">
        箱
      </div>

      <div className="relative flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1 min-w-0">
          <p className="eyebrow !text-[var(--akira-yellow)]">Loot Box // ガチャ</p>
          <h3 className="display text-3xl md:text-4xl text-[var(--ink)] mt-1 leading-none">
            ROLE A <span className="text-[var(--akira-yellow)] glow-yellow">SEMANAL</span>
          </h3>
          <p className="jp text-lg text-[var(--akira-pink)] mt-2">週刊くじ引き</p>
          <p className="mt-3 font-mono text-xs text-[var(--ink-muted)] uppercase tracking-wider">
            {">"} 1 giro por semana ISO // resets toda segunda
          </p>
        </div>

        <div className="relative w-44 h-44 flex-shrink-0 mx-auto md:mx-0">
          {/* Caixa central */}
          <div
            className={`absolute inset-0 border-[3px] border-[var(--ink)] shadow-hard flex items-center justify-center transition-all ${
              available && phase === "idle"
                ? "bg-[var(--akira-yellow)] pulse-neon cursor-pointer hover:scale-105"
                : phase === "spinning"
                ? "bg-[var(--akira-pink)] animate-spin"
                : "bg-[var(--bg-3)]"
            }`}
            style={phase === "spinning" ? { animationDuration: "0.5s" } : undefined}
            onClick={available && phase === "idle" ? handleSpin : undefined}
          >
            <span className="jp text-7xl text-[var(--bg)]">
              {phase === "revealed" && reward ? "★" : "箱"}
            </span>
          </div>

          {/* Onomatopeias */}
          {pops.map((p) => (
            <span
              key={p.id}
              className="onomatopeia absolute text-xl pointer-events-none"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              {p.text}
            </span>
          ))}
        </div>
      </div>

      {/* Estados */}
      <div className="relative mt-6 pt-5 border-t-2 border-dashed border-[var(--line)]">
        {phase === "idle" && available && (
          <button
            onClick={handleSpin}
            className="shimmer w-full inline-flex items-center justify-center gap-3 border-[3px] border-[var(--ink)] bg-[var(--akira-red)] text-[var(--ink)] px-6 py-4 shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            <span className="display text-base uppercase tracking-wider">Abrir Loot Box</span>
            <span className="jp text-base">開</span>
          </button>
        )}

        {phase === "idle" && !available && (
          <div className="text-center">
            <p className="display text-xl text-[var(--ink-muted)]">VOLTA SEGUNDA-FEIRA</p>
            <p className="font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest mt-1">
              {">"} ja girou essa semana // 月曜日
            </p>
          </div>
        )}

        {phase === "spinning" && (
          <div className="text-center">
            <p className="display text-2xl text-[var(--akira-pink)] glow-pink pulse-neon">
              ROLANDO...
            </p>
            <p className="jp text-sm text-[var(--akira-yellow)] mt-1">回転中</p>
          </div>
        )}

        {phase === "revealed" && reward && (
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className="aspect-square border-[2px] border-[var(--akira-yellow)] bg-[var(--bg-3)] flex flex-col items-center justify-center text-center p-2 reveal-card"
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                {idx === 1 ? (
                  <>
                    <span className="jp text-3xl text-[var(--akira-yellow)] glow-yellow">
                      {rewardIcon(reward)}
                    </span>
                    <span className="display text-[10px] text-[var(--ink)] uppercase tracking-wider mt-1 line-clamp-2">
                      {reward.label}
                    </span>
                  </>
                ) : (
                  <span className="jp text-2xl text-[var(--ink-muted)]">?</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes reveal-flip {
          0% {
            transform: rotateY(180deg) scale(0.8);
            opacity: 0;
          }
          100% {
            transform: rotateY(0deg) scale(1);
            opacity: 1;
          }
        }
        .reveal-card {
          animation: reveal-flip 0.55s ease-out backwards;
        }
      `}</style>
    </section>
  );
}

function rewardIcon(r: LootReward): string {
  if (r.type === "sticker") return "札";
  if (r.type === "discount") return "割";
  if (r.type === "points") return "点";
  return "勲";
}
