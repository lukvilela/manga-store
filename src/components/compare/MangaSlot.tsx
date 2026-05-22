/**
 * Renderiza 1 lado do comparador. Server component — recebe JikanManga ja carregado.
 *
 * side="a" = vermelho (esquerda), side="b" = cyan (direita).
 * winner=true ativa badge "VENCEDOR" no topo.
 */

import Image from "next/image";
import Link from "next/link";
import type { JikanManga } from "@/lib/manga-api";

type Props = {
  manga: JikanManga;
  side: "a" | "b";
  winner?: boolean;
};

const SIDE_CONFIG = {
  a: {
    bg: "bg-zone-red",
    accent: "text-akira-red glow-red",
    badgeBg: "bg-akira-red text-ink",
    border: "border-akira-red",
    eyebrow: "text-akira-red",
    label: "FIGHTER A",
    jp: "選手A",
  },
  b: {
    bg: "bg-zone-cool",
    accent: "text-akira-cyan glow-cyan",
    badgeBg: "bg-akira-cyan text-bg",
    border: "border-akira-cyan",
    eyebrow: "text-akira-cyan",
    label: "FIGHTER B",
    jp: "選手B",
  },
} as const;

export default function MangaSlot({ manga, side, winner }: Props) {
  const cfg = SIDE_CONFIG[side];
  const cover =
    manga.images?.webp?.large_image_url ||
    manga.images?.jpg?.large_image_url ||
    manga.images?.jpg?.image_url ||
    "";

  // Sinopse curta — 320 chars
  const synopsis = manga.synopsis
    ? manga.synopsis.length > 320
      ? manga.synopsis.slice(0, 320).trim() + "..."
      : manga.synopsis
    : null;

  return (
    <div
      className={`relative flex-1 ${cfg.bg} p-6 md:p-8 border-2 border-ink overflow-hidden`}
    >
      <div className="absolute inset-0 halftone opacity-20 pointer-events-none" aria-hidden />

      {/* Big BG kanji */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.06]"
        aria-hidden
      >
        <span
          className={`jp font-black leading-none ${cfg.accent}`}
          style={{ fontSize: "clamp(10rem, 25vw, 22rem)" }}
        >
          {cfg.jp}
        </span>
      </div>

      <div className="relative">
        {/* Eyebrow + winner badge */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <p className={`eyebrow ${cfg.eyebrow}`}>{cfg.label}</p>
          {winner && (
            <span className="px-3 py-1 bg-akira-yellow text-bg border-2 border-ink shadow-hard font-mono text-xs uppercase tracking-widest font-bold pulse-neon">
              ★ Vencedor
            </span>
          )}
        </div>

        {/* Capa */}
        <div
          className={`relative w-full aspect-[2/3] max-w-xs mx-auto border-2 border-ink shadow-hard-lg overflow-hidden mb-5`}
        >
          {cover && (
            <Image
              src={cover}
              alt={manga.title}
              fill
              sizes="(max-width: 768px) 80vw, 320px"
              className="object-cover"
              unoptimized
              priority
            />
          )}
          {manga.rank != null && manga.rank <= 100 && (
            <div className={`absolute top-2 left-2 px-2 py-1 ${cfg.badgeBg} text-[10px] font-mono font-bold uppercase tracking-widest shadow-hard`}>
              #{manga.rank}
            </div>
          )}
        </div>

        {/* Titulo */}
        <h2 className={`display text-3xl md:text-4xl leading-[0.95] mb-2 ${cfg.accent}`}>
          {manga.title}
        </h2>
        {manga.title_japanese && (
          <p className="jp text-base text-ink-soft mb-3">{manga.title_japanese}</p>
        )}

        {/* Meta linha */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-[10px] font-mono uppercase tracking-widest">
          {manga.type && (
            <span className="px-2 py-1 border border-[var(--line)] text-ink-soft">
              {manga.type}
            </span>
          )}
          {manga.status && (
            <span className={`px-2 py-1 border ${cfg.border} ${cfg.eyebrow}`}>
              {manga.status}
            </span>
          )}
          {manga.authors?.[0]?.name && (
            <span className="text-ink-muted">por {manga.authors[0].name}</span>
          )}
        </div>

        {/* Genres */}
        {manga.genres?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {manga.genres.slice(0, 4).map((g) => (
              <span
                key={g.mal_id}
                className="text-[10px] font-mono uppercase tracking-widest text-ink-muted"
              >
                #{g.name}
              </span>
            ))}
          </div>
        )}

        {/* Sinopse */}
        {synopsis && (
          <div className="border-l-2 border-ink pl-3 py-1 mb-5">
            <p className="text-sm text-ink-soft leading-relaxed">{synopsis}</p>
          </div>
        )}

        {/* Link pra detalhe */}
        <Link
          href={`/manga/${manga.mal_id}`}
          className={`inline-block px-4 py-2 border-2 border-ink ${cfg.badgeBg} font-mono text-xs uppercase tracking-widest font-bold hover:shadow-hard transition-all`}
        >
          Ver detalhes →
        </Link>
      </div>
    </div>
  );
}
