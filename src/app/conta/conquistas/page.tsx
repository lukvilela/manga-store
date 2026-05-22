"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGamification } from "@/lib/gamification-store";
import XpBar from "@/components/gamification/XpBar";
import BadgeShelf from "@/components/gamification/BadgeShelf";
import LootBox from "@/components/gamification/LootBox";
import GamificationListener from "@/components/gamification/GamificationListener";
import { BADGES } from "@/lib/badges";
import { ACHIEVEMENTS } from "@/lib/achievements";

export default function ConquistasPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { state, hydrated } = useGamification();

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redirect=/conta/conquistas");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="panel-frame bg-[var(--bg-2)] p-10 text-center">
        <p className="display text-3xl text-[var(--akira-red)] glow-red pulse-neon">
          {loading ? "CARREGANDO" : "REDIRECIONANDO"}
        </p>
        <p className="jp mt-2 text-base text-[var(--ink-muted)]">読み込み中</p>
      </div>
    );
  }

  const badgesCount = hydrated ? state.badges.length : 0;
  const achievementsCount = hydrated ? state.achievements.length : 0;

  return (
    <div className="space-y-8">
      <GamificationListener />

      {/* Hero */}
      <section className="relative panel-frame bg-[var(--bg-2)] p-6 md:p-10 overflow-hidden">
        <div className="absolute inset-0 halftone-red opacity-20 pointer-events-none" />
        <div className="absolute -right-10 -top-10 jp text-[180px] text-[var(--akira-red)]/15 leading-none select-none pointer-events-none">
          勲
        </div>
        <div className="relative">
          <span className="onomatopeia text-xl">RANK UP!</span>
          <p className="eyebrow mt-3">Conquistas // 達成</p>
          <h2 className="display mt-1 text-4xl md:text-6xl text-[var(--ink)] leading-none">
            SUAS <span className="text-[var(--akira-red)] glow-red">CONQUISTAS</span>
          </h2>
          <p className="jp mt-2 text-2xl text-[var(--akira-cyan)] glow-cyan">達成と勲章</p>
        </div>
      </section>

      {/* XP Bar grande */}
      <section className="panel-frame bg-[var(--bg-2)] p-6 md:p-8">
        <XpBar size="lg" />
      </section>

      {/* Stats grid */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatBlock kanji="級" label="Nivel" value={state.level} accent="var(--akira-red)" />
        <StatBlock
          kanji="経"
          label="XP Total"
          value={state.xp.toLocaleString("pt-BR")}
          accent="var(--akira-cyan)"
        />
        <StatBlock
          kanji="点"
          label="Pontos"
          value={state.points.toLocaleString("pt-BR")}
          accent="var(--akira-yellow)"
        />
        <StatBlock
          kanji="連"
          label="Streak"
          value={`${state.streak.current}d`}
          sub={`max ${state.streak.longest}d`}
          accent="var(--akira-pink)"
        />
        <StatBlock
          kanji="勲"
          label="Badges"
          value={`${badgesCount}/${BADGES.length}`}
          accent="var(--akira-violet)"
        />
      </section>

      {/* LootBox */}
      <LootBox />

      {/* Badges */}
      <BadgeShelf />

      {/* Achievements */}
      <section className="panel-frame bg-[var(--bg-2)] p-6 md:p-8">
        <div className="flex items-baseline justify-between gap-3 flex-wrap mb-5">
          <div>
            <p className="eyebrow">Achievements // 達成</p>
            <h3 className="display text-3xl text-[var(--ink)] mt-1">
              MARCOS DE <span className="text-[var(--akira-pink)] glow-pink">JORNADA</span>
            </h3>
          </div>
          <span className="font-mono text-xs text-[var(--ink-muted)] uppercase tracking-widest">
            <span className="text-[var(--akira-cyan)] numerals">{achievementsCount}</span> / {ACHIEVEMENTS.length}
          </span>
        </div>

        <ul className="space-y-2">
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = state.achievements.includes(ach.id);
            return (
              <li
                key={ach.id}
                className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 border-[2px] px-4 py-3 transition-all ${
                  unlocked
                    ? "border-[var(--akira-pink)] bg-[var(--akira-pink)]/5"
                    : "border-[var(--line)] bg-[var(--bg-3)] opacity-60"
                }`}
              >
                <span
                  className={`jp text-3xl leading-none ${
                    unlocked ? "text-[var(--akira-pink)] glow-pink" : "text-[var(--ink-muted)]"
                  }`}
                >
                  {unlocked ? ach.icon : "鍵"}
                </span>
                <div className="min-w-0">
                  <p
                    className={`display text-base uppercase tracking-wider ${
                      unlocked ? "text-[var(--ink)]" : "text-[var(--ink-muted)]"
                    }`}
                  >
                    {ach.name}
                  </p>
                  <p className="font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest mt-0.5">
                    {ach.description}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-mono text-[10px] text-[var(--akira-cyan)] uppercase tracking-widest">
                    +{ach.xp} XP
                  </p>
                  {ach.points && (
                    <p className="font-mono text-[10px] text-[var(--akira-yellow)] uppercase tracking-widest">
                      +{ach.points} pts
                    </p>
                  )}
                  {ach.badgeId && (
                    <p className="font-mono text-[9px] text-[var(--akira-pink)] uppercase tracking-widest">
                      + badge
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Footer dica */}
      <section className="border-t-2 border-dashed border-[var(--line)] pt-6">
        <p className="font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest leading-relaxed">
          {">"} dica: cada compra rende XP/pontos<br />
          {">"} estante e visitas tambem<br />
          {">"} streak diario desbloqueia badges raros
        </p>
      </section>
    </div>
  );
}

function StatBlock({
  kanji,
  label,
  value,
  sub,
  accent,
}: {
  kanji: string;
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="relative border-[2px] border-[var(--line)] bg-[var(--bg-2)] p-4 shadow-hard card-lift">
      <span
        className="absolute -top-2 -right-2 px-2 py-0.5 font-mono text-[10px] font-bold"
        style={{ background: accent, color: "var(--bg)" }}
      >
        {label.toUpperCase()}
      </span>
      <div className="flex items-baseline justify-between gap-2">
        <span className="jp text-3xl" style={{ color: accent }}>
          {kanji}
        </span>
        <span className="display text-3xl numerals leading-none" style={{ color: accent }}>
          {value}
        </span>
      </div>
      {sub && (
        <p className="mt-2 font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest">
          {">"} {sub}
        </p>
      )}
    </div>
  );
}
