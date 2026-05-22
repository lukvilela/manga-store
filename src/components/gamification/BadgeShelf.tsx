"use client";

import { useMemo, useState } from "react";
import { BADGES, RARITY_COLORS, type BadgeRarity } from "@/lib/badges";
import { useGamification } from "@/lib/gamification-store";

const FILTERS: Array<{ id: BadgeRarity | "all"; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "common", label: "Common" },
  { id: "rare", label: "Rare" },
  { id: "epic", label: "Epic" },
  { id: "legendary", label: "Legendary" },
];

export default function BadgeShelf() {
  const { state, hydrated } = useGamification();
  const [filter, setFilter] = useState<BadgeRarity | "all">("all");
  const [hover, setHover] = useState<string | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? BADGES : BADGES.filter((b) => b.rarity === filter)),
    [filter]
  );

  const unlockedCount = hydrated ? state.badges.length : 0;

  return (
    <section className="panel-frame bg-[var(--bg-2)] p-6 md:p-8">
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-5">
        <div>
          <p className="eyebrow">Badges // 勲章</p>
          <h3 className="display text-3xl text-[var(--ink)] mt-1">
            CONQUISTAS <span className="text-[var(--akira-yellow)] glow-yellow">VISUAIS</span>
          </h3>
        </div>
        <span className="font-mono text-xs text-[var(--ink-muted)] uppercase tracking-widest">
          <span className="text-[var(--akira-cyan)] numerals">{unlockedCount}</span> / {BADGES.length} desbloqueados
        </span>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest border-[2px] transition-all ${
                active
                  ? "border-[var(--akira-red)] bg-[var(--akira-red)] text-[var(--ink)]"
                  : "border-[var(--line)] text-[var(--ink-muted)] hover:border-[var(--akira-cyan)] hover:text-[var(--akira-cyan)]"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {visible.map((badge) => {
          const unlocked = hydrated && state.badges.includes(badge.id);
          const colors = RARITY_COLORS[badge.rarity];
          return (
            <div
              key={badge.id}
              onMouseEnter={() => setHover(badge.id)}
              onMouseLeave={() => setHover(null)}
              className={`relative aspect-square border-[2px] p-2 flex flex-col items-center justify-center text-center transition-all card-lift ${
                unlocked
                  ? `${colors.border} ${colors.bg}`
                  : "border-[var(--line)] bg-[var(--bg-3)] grayscale opacity-60"
              }`}
            >
              <span
                className={`jp text-3xl md:text-4xl leading-none ${
                  unlocked ? `${colors.text} ${colors.glow}` : "text-[var(--ink-muted)]"
                }`}
              >
                {unlocked ? badge.icon : "?"}
              </span>
              <span
                className={`display text-[10px] mt-1 uppercase tracking-wider line-clamp-2 ${
                  unlocked ? "text-[var(--ink)]" : "text-[var(--ink-muted)]"
                }`}
              >
                {unlocked ? badge.name : "LOCKED"}
              </span>
              {!unlocked && (
                <span className="absolute top-1 right-1 jp text-xs text-[var(--ink-muted)]">
                  鍵
                </span>
              )}
              <span
                className={`absolute bottom-0.5 left-0.5 font-mono text-[8px] uppercase tracking-widest ${colors.text}`}
              >
                {badge.rarity}
              </span>

              {/* Tooltip hover */}
              {hover === badge.id && (
                <div className="absolute z-10 -bottom-2 left-1/2 -translate-x-1/2 translate-y-full w-56 border-[2px] border-[var(--ink)] bg-[var(--bg)] p-3 shadow-hard pointer-events-none">
                  <p className={`display text-sm ${unlocked ? colors.text : "text-[var(--ink-muted)]"}`}>
                    {badge.name}
                  </p>
                  <p className="font-mono text-[10px] text-[var(--ink-soft)] mt-1 leading-relaxed normal-case tracking-normal">
                    {badge.description}
                  </p>
                  <p className="font-mono text-[10px] text-[var(--akira-yellow)] mt-2 uppercase tracking-widest">
                    {">"} {badge.requirement}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
