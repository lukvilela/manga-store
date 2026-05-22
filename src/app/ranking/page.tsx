"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGamification } from "@/lib/gamification-store";
import { useEstante } from "@/lib/estante-store";
import {
  CATEGORY_META,
  getLeaderboard,
  getUserRanking,
  type CurrentUserStats,
  type LeaderboardCategory,
} from "@/lib/leaderboard";
import RankingCard from "@/components/ranking/RankingCard";

const CATEGORIES: LeaderboardCategory[] = ["xp", "badges", "streak", "estante"];

export default function RankingPage() {
  const { user } = useAuth();
  const { state: gameState, hydrated: gameHydrated } = useGamification();
  const estante = useEstante();
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>("xp");

  // Stats reais do user (so se logado E hidratado)
  const currentUser: CurrentUserStats | null = useMemo(() => {
    if (!user || !gameHydrated || !estante.hydrated) return null;
    return {
      userName: user.name,
      xp: gameState.xp,
      badges: gameState.badges.length,
      streak: gameState.streak.current,
      estante: estante.count(),
    };
  }, [user, gameHydrated, gameState, estante]);

  const top20 = useMemo(
    () => getLeaderboard(activeCategory, currentUser, 20),
    [activeCategory, currentUser],
  );

  const userRanking = useMemo(
    () => (currentUser ? getUserRanking(currentUser, activeCategory) : null),
    [currentUser, activeCategory],
  );

  const userInTop20 = userRanking ? userRanking.position <= 20 : false;
  const meta = CATEGORY_META[activeCategory];

  const podium = top20.slice(0, 3);
  const rest = top20.slice(3, 20);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-zone-yellow text-[var(--bg)] overflow-hidden">
        <div className="absolute inset-0 halftone opacity-20 pointer-events-none" aria-hidden />
        <div
          className="absolute -right-10 -top-8 jp text-[260px] leading-none opacity-15 select-none pointer-events-none"
          aria-hidden
        >
          ランキング
        </div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <p className="eyebrow !text-[var(--bg)]">Section 04 // 順位</p>
          <h1 className="display text-6xl md:text-8xl text-[var(--bg)] leading-none mt-2">
            ランキング
          </h1>
          <p className="display text-3xl md:text-5xl text-[var(--bg)] leading-none mt-1">
            · RANKING
          </p>
          <p className="font-mono text-xs md:text-sm text-[var(--bg)]/80 uppercase tracking-widest mt-4 max-w-2xl">
            {">"} top otakus de Akira Mangas. acumule XP, badges, streak e
            colecao. desafie os melhores.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-8">
        {/* Tabs categoria */}
        <nav className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => {
            const m = CATEGORY_META[cat];
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`group flex items-center gap-3 border-[2px] px-4 py-3 transition-all ${
                  active
                    ? "border-[var(--ink)] shadow-hard"
                    : "border-[var(--line)] bg-[var(--bg-2)] hover:border-[var(--ink-soft)]"
                }`}
                style={active ? { background: m.color, color: "var(--bg)" } : undefined}
              >
                <span
                  className="display text-lg"
                  style={{ color: active ? "var(--bg)" : m.color }}
                >
                  {m.icon}
                </span>
                <span className="display text-sm uppercase tracking-wider">{m.label}</span>
                <span
                  className="jp text-xs"
                  style={{ color: active ? "var(--bg)" : "var(--ink-muted)" }}
                >
                  {m.jp}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Podium */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 stagger">
          {podium.map((entry, i) => (
            <RankingCard
              key={`${entry.userName}-${i}`}
              entry={entry}
              position={i + 1}
              category={activeCategory}
              variant="podium"
            />
          ))}
        </section>

        {/* Top 4-20 */}
        <section className="space-y-2">
          <p className="eyebrow !text-[var(--ink-muted)]">
            POSICOES 4 — 20 // {meta.label}
          </p>
          <div className="space-y-2">
            {rest.map((entry, i) => (
              <RankingCard
                key={`${entry.userName}-${i + 3}`}
                entry={entry}
                position={i + 4}
                category={activeCategory}
                variant="row"
              />
            ))}
          </div>
        </section>

        {/* User fora do top 20 */}
        {userRanking && !userInTop20 && (
          <section className="panel-frame bg-[var(--bg-2)] p-5 border-l-8 border-[var(--akira-red)]">
            <p className="eyebrow !text-[var(--akira-red)]">SUA POSICAO</p>
            <div className="mt-2">
              <RankingCard
                entry={userRanking.entry}
                position={userRanking.position}
                category={activeCategory}
                variant="row"
              />
            </div>
            <p className="font-mono text-xs text-[var(--ink-muted)] uppercase tracking-widest mt-3">
              {">"} posicao #{userRanking.position} de {userRanking.total}{" "}
              otakus. continue ganhando {meta.label.toLowerCase()} pra subir!
            </p>
          </section>
        )}

        {!user && (
          <section className="panel-frame bg-[var(--bg-2)] p-6 text-center">
            <p className="jp text-5xl text-[var(--akira-red)]/40">参加</p>
            <p className="display text-2xl text-[var(--ink)] mt-2">ENTRE PRA APARECER NO RANKING</p>
            <p className="font-mono text-xs text-[var(--ink-muted)] uppercase tracking-widest mt-2">
              {">"} faca login pra ver sua posicao entre os otakus
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
