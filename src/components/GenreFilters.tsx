"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Jikan genre IDs
const GENRES = [
  { id: null,  name: "Todos",       jp: "全て",  accent: "ink" as const },
  { id: 1,     name: "Action",      jp: "アクション", accent: "red" as const },
  { id: 2,     name: "Adventure",   jp: "冒険",   accent: "yellow" as const },
  { id: 4,     name: "Comedy",      jp: "コメディ", accent: "pink" as const },
  { id: 8,     name: "Drama",       jp: "ドラマ", accent: "violet" as const },
  { id: 10,    name: "Fantasy",     jp: "幻想",   accent: "violet" as const },
  { id: 14,    name: "Horror",      jp: "恐怖",   accent: "red" as const },
  { id: 22,    name: "Romance",     jp: "恋愛",   accent: "pink" as const },
  { id: 24,    name: "Sci-Fi",      jp: "SF",     accent: "cyan" as const },
  { id: 7,     name: "Mystery",     jp: "謎",     accent: "cyan" as const },
  { id: 36,    name: "Slice",       jp: "日常",   accent: "green" as const },
];

const DEMOGRAPHICS = [
  { id: 27, name: "Shounen", jp: "少年", accent: "yellow" as const },
  { id: 42, name: "Seinen",  jp: "青年", accent: "cyan" as const },
  { id: 25, name: "Shoujo",  jp: "少女", accent: "pink" as const },
  { id: 43, name: "Josei",   jp: "女性", accent: "violet" as const },
  { id: 15, name: "Kids",    jp: "子供", accent: "green" as const },
];

const ACCENT_BG: Record<string, string> = {
  red: "bg-akira-red text-ink border-akira-red",
  cyan: "bg-akira-cyan text-bg border-akira-cyan",
  pink: "bg-akira-pink text-bg border-akira-pink",
  yellow: "bg-akira-yellow text-bg border-akira-yellow",
  violet: "bg-akira-violet text-ink border-akira-violet",
  green: "bg-akira-green text-bg border-akira-green",
  ink: "bg-ink text-bg border-ink",
};

const ACCENT_OUTLINE: Record<string, string> = {
  red: "border-akira-red text-akira-red hover:bg-akira-red hover:text-ink",
  cyan: "border-akira-cyan text-akira-cyan hover:bg-akira-cyan hover:text-bg",
  pink: "border-akira-pink text-akira-pink hover:bg-akira-pink hover:text-bg",
  yellow: "border-akira-yellow text-akira-yellow hover:bg-akira-yellow hover:text-bg",
  violet: "border-akira-violet text-akira-violet hover:bg-akira-violet hover:text-ink",
  green: "border-akira-green text-akira-green hover:bg-akira-green hover:text-bg",
  ink: "border-[var(--line)] text-ink-soft hover:bg-ink-soft hover:text-bg",
};

export default function GenreFilters() {
  const sp = useSearchParams();
  const currentGenre = sp.get("genre");
  const currentQuery = sp.get("q") || "";

  const buildHref = (genreId: number | null) => {
    const p = new URLSearchParams();
    if (currentQuery) p.set("q", currentQuery);
    if (genreId !== null) p.set("genre", String(genreId));
    return `/busca?${p.toString()}`;
  };

  return (
    <aside className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="block w-1 h-5 bg-akira-cyan shadow-[2px_2px_0_var(--ink)]" />
          <p className="eyebrow text-akira-cyan glow-cyan">Demographics / 読者層</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {DEMOGRAPHICS.map((d) => {
            const active = currentGenre === String(d.id);
            return (
              <Link
                key={d.id}
                href={buildHref(d.id)}
                className={`px-3 py-2 border-2 font-mono text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                  active ? ACCENT_BG[d.accent] : ACCENT_OUTLINE[d.accent]
                }`}
              >
                <span className="jp text-sm font-bold">{d.jp}</span>
                <span>{d.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="block w-1 h-5 bg-akira-yellow shadow-[2px_2px_0_var(--ink)]" />
          <p className="eyebrow text-akira-yellow glow-yellow">Generos / 種類</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => {
            const active = (g.id === null && !currentGenre) || currentGenre === String(g.id);
            return (
              <Link
                key={g.name}
                href={buildHref(g.id)}
                className={`px-3 py-2 border-2 font-mono text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                  active ? ACCENT_BG[g.accent] : ACCENT_OUTLINE[g.accent]
                }`}
              >
                <span className="jp text-sm font-bold">{g.jp}</span>
                <span>{g.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="pt-6 border-t border-[var(--line)]">
        <p className="eyebrow text-ink-muted mb-3">Powered by</p>
        <p className="text-sm text-ink-soft font-mono">
          Jikan API v4 · <span className="text-akira-red">MyAnimeList</span>
        </p>
        <p className="text-xs text-ink-muted mt-1 font-mono">
          55.000+ series · cache 1h
        </p>
      </div>
    </aside>
  );
}
