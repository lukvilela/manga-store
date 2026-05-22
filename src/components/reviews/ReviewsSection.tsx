"use client";

import { useMemo, useState } from "react";
import { useReviews } from "@/lib/reviews-store";
import { useAuth } from "@/context/AuthContext";
import ReviewForm from "./ReviewForm";
import ReviewCard from "./ReviewCard";

type Props = {
  mangaId: string;
  mangaTitle: string;
  mangaCover: string;
};

type SpoilerFilter = "all" | "with" | "without";
type SortMode = "recent" | "liked";

export default function ReviewsSection({ mangaId, mangaTitle, mangaCover }: Props) {
  const { getByMangaId, getAverageRating, hydrated } = useReviews();
  const { user } = useAuth();

  const [spoilerFilter, setSpoilerFilter] = useState<SpoilerFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("recent");

  const stats = getAverageRating(mangaId);
  const allReviews = getByMangaId(mangaId);

  const filtered = useMemo(() => {
    let list = allReviews;
    if (spoilerFilter === "with") list = list.filter((r) => r.hasSpoiler);
    if (spoilerFilter === "without") list = list.filter((r) => !r.hasSpoiler);
    if (sortMode === "liked") {
      list = [...list].sort((a, b) => b.likes - a.likes);
    }
    return list;
  }, [allReviews, spoilerFilter, sortMode]);

  // Distribuicao normalizada pra largura das barras
  const maxDist = Math.max(...stats.distribution, 1);

  return (
    <section className="relative bg-bg py-16 md:py-24 px-4 md:px-8 border-t border-[var(--line)] overflow-hidden">
      <div className="absolute inset-0 halftone-lg opacity-15 pointer-events-none" aria-hidden />

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-10 pb-6 border-b-2 border-akira-red">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="block w-1.5 h-8 bg-akira-red shadow-[3px_3px_0_var(--ink)]" />
              <p className="eyebrow text-akira-red glow-red">
                Reviews / レビュー
              </p>
            </div>
            <h2 className="display text-4xl md:text-5xl">
              O que o mundo diz
            </h2>
          </div>
          <div className="text-right">
            <p className="numerals display text-4xl md:text-5xl text-akira-yellow glow-yellow">
              {stats.count}
            </p>
            <p className="eyebrow text-ink-muted">opinioes</p>
          </div>
        </div>

        {/* Stats: média + distribuição */}
        {hydrated && stats.count > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            {/* Média grande */}
            <div className="md:col-span-4 panel-frame p-6 text-center">
              <p className="eyebrow text-ink-muted mb-3">
                Nota media / 平均
              </p>
              <p className="numerals display text-6xl md:text-7xl text-akira-yellow glow-yellow leading-none">
                {stats.average.toFixed(1)}
              </p>
              <div className="flex justify-center gap-0.5 mt-3" aria-hidden>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <span
                    key={n}
                    className={`text-sm ${
                      n <= Math.round(stats.average)
                        ? "text-akira-yellow"
                        : "text-ink-muted"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs font-mono uppercase tracking-widest text-ink-muted">
                {stats.count} {stats.count === 1 ? "voto" : "votos"}
              </p>
            </div>

            {/* Distribuição barras 1-10 (inverte: 10 no topo) */}
            <div className="md:col-span-8 panel-frame p-6">
              <p className="eyebrow text-ink-muted mb-4">
                Distribuicao / 分布
              </p>
              <div className="flex flex-col gap-1.5">
                {Array.from({ length: 10 }, (_, i) => 10 - i).map((n) => {
                  const count = stats.distribution[n - 1];
                  const pct = (count / maxDist) * 100;
                  return (
                    <div key={n} className="flex items-center gap-3">
                      <span className="w-6 text-right font-mono text-xs text-ink-soft numerals">
                        {n}
                      </span>
                      <div className="flex-1 h-3 bg-bg-2 border border-[var(--line)] relative">
                        <div
                          className="h-full bg-akira-red shadow-[2px_0_0_var(--ink)] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-left font-mono text-xs text-ink-muted numerals">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="mb-12">
          {user ? (
            <ReviewForm
              mangaId={mangaId}
              mangaTitle={mangaTitle}
              mangaCover={mangaCover}
            />
          ) : (
            <div className="bg-bg-2 border-2 border-dashed border-[var(--line)] p-8 text-center">
              <p className="eyebrow text-akira-cyan mb-2">
                Login necessario
              </p>
              <p className="text-sm text-ink-soft mb-4">
                Entre na sua conta pra escrever uma review.
              </p>
              <a
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-akira-cyan text-akira-cyan hover:bg-akira-cyan hover:text-bg font-mono text-xs uppercase tracking-widest transition-all"
              >
                Entrar
              </a>
            </div>
          )}
        </div>

        {/* Filtros (somente se houver reviews) */}
        {hydrated && allReviews.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-[var(--line)]">
            <span className="eyebrow text-ink-muted">Filtrar:</span>
            <FilterChip
              active={spoilerFilter === "all"}
              onClick={() => setSpoilerFilter("all")}
            >
              Todas
            </FilterChip>
            <FilterChip
              active={spoilerFilter === "with"}
              onClick={() => setSpoilerFilter("with")}
            >
              Com spoiler
            </FilterChip>
            <FilterChip
              active={spoilerFilter === "without"}
              onClick={() => setSpoilerFilter("without")}
            >
              Sem spoiler
            </FilterChip>

            <span className="mx-2 text-ink-muted">|</span>

            <span className="eyebrow text-ink-muted">Ordenar:</span>
            <FilterChip
              active={sortMode === "recent"}
              onClick={() => setSortMode("recent")}
            >
              Mais recentes
            </FilterChip>
            <FilterChip
              active={sortMode === "liked"}
              onClick={() => setSortMode("liked")}
            >
              Mais curtidas
            </FilterChip>
          </div>
        )}

        {/* Lista */}
        {hydrated && filtered.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-[var(--line)]">
            <p className="jp text-7xl text-akira-red glow-red mb-4">空</p>
            <p className="display text-2xl mb-2">
              {allReviews.length === 0
                ? "Seja o primeiro a opinar"
                : "Nenhuma review com esses filtros"}
            </p>
            <p className="text-sm text-ink-muted font-mono">
              {allReviews.length === 0
                ? "Ainda nao tem reviews por aqui. Que tal puxar o gatilho?"
                : "Tente afrouxar os filtros acima."}
            </p>
          </div>
        )}

        {hydrated && filtered.length > 0 && (
          <div className="flex flex-col gap-5">
            {filtered.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 border-2 font-mono text-[10px] uppercase tracking-widest transition-all ${
        active
          ? "border-ink bg-akira-red text-ink shadow-[2px_2px_0_var(--ink)]"
          : "border-[var(--line)] text-ink-soft hover:border-akira-red hover:text-akira-red"
      }`}
    >
      {children}
    </button>
  );
}
