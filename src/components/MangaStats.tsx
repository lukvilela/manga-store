import type { JikanManga } from "@/lib/manga-api";

type Props = { manga: JikanManga };

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

export default function MangaStats({ manga }: Props) {
  const stats = [
    { jp: "順位", label: "Rank Global", value: manga.rank ? `#${manga.rank}` : "—", accent: "red" as const },
    { jp: "評価", label: "Pontuacao", value: manga.score ? manga.score.toFixed(2) : "—", sub: manga.scored_by ? `${fmt(manga.scored_by)} votos` : "", accent: "yellow" as const },
    { jp: "人気度", label: "Popularidade", value: manga.popularity ? `#${manga.popularity}` : "—", accent: "cyan" as const },
    { jp: "状態", label: "Status", value: manga.status, accent: "pink" as const },
  ];

  return (
    <section className="relative bg-bg-2 border-y border-[var(--line)] overflow-hidden">
      <div className="absolute inset-0 halftone opacity-20 pointer-events-none" aria-hidden />
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4">
        {stats.map((s, i) => {
          const colorClass = {
            red: "text-akira-red glow-red",
            yellow: "text-akira-yellow glow-yellow",
            cyan: "text-akira-cyan glow-cyan",
            pink: "text-akira-pink glow-pink",
          }[s.accent];
          const barBg = {
            red: "bg-akira-red",
            yellow: "bg-akira-yellow",
            cyan: "bg-akira-cyan",
            pink: "bg-akira-pink",
          }[s.accent];
          return (
            <div key={i} className={`pl-4 border-l-4 ${barBg.replace("bg-", "border-")}`}>
              <p className="eyebrow text-ink-muted flex items-center gap-2 mb-2">
                <span className={`jp text-base ${colorClass}`}>{s.jp}</span>
                <span>·</span>
                <span>{s.label}</span>
              </p>
              <p className={`display text-4xl md:text-5xl ${colorClass} numerals`}>{s.value}</p>
              {s.sub && (
                <p className="mt-1 text-xs text-ink-muted font-mono">{s.sub}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
