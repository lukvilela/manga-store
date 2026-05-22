import Link from "next/link";
import Image from "next/image";
import { getMangaColor, getMangaColorAlpha, getContrastText } from "@/lib/manga-colors";
import type { MangaCardData } from "@/lib/manga-api";

type Props = {
  manga: MangaCardData;
  label?: string;
  jpLabel?: string;
  reverse?: boolean;
};

/**
 * Hero por mangá — tela cheia com background colorido do próprio manga.
 * Capa grande + sinopse + meta + CTA.
 */
export default function MangaSpotlight({ manga, label = "Featured Drop", jpLabel = "注目作", reverse = false }: Props) {
  const color = getMangaColor(manga.title);
  const colorSoft = getMangaColorAlpha(manga.title, 0.6);
  const colorFaint = getMangaColorAlpha(manga.title, 0.15);
  const text = getContrastText(color);
  const isDark = text === "#ededf2";

  return (
    <section
      className="relative overflow-hidden border-y-2 border-akira-red"
      style={{
        background: `
          radial-gradient(ellipse 80% 70% at ${reverse ? "20%" : "80%"} 30%, ${colorSoft} 0%, transparent 65%),
          linear-gradient(135deg, ${color} 0%, var(--bg) 70%)
        `,
      }}
    >
      {/* Halftone overlay */}
      <div className="absolute inset-0 halftone-lg opacity-40 pointer-events-none" aria-hidden />

      {/* Action lines diagonal */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(${reverse ? "-45deg" : "45deg"}, transparent 0, transparent 30px, ${colorFaint} 30px, ${colorFaint} 32px)`,
        }}
        aria-hidden
      />

      <div className={`relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center ${reverse ? "md:[direction:rtl]" : ""}`}>
        {/* Capa grande */}
        <div className={`md:col-span-5 ${reverse ? "md:order-2" : ""} [direction:ltr]`}>
          <Link href={`/manga/${manga.id}`} className="block group hover-tilt">
            <div
              className="relative aspect-[2/3] max-w-md mx-auto md:mx-0 overflow-hidden border-4 border-ink shadow-hard-lg transition-transform duration-700 group-hover:rotate-1"
              style={{ background: color, viewTransitionName: `cover-${manga.id}` }}
            >
              {manga.cover && (
                <Image
                  src={manga.cover}
                  alt={manga.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 480px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  unoptimized
                  priority
                />
              )}
              {/* Onomatopeia em hover */}
              <div className="absolute -top-4 -right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="onomatopeia text-3xl md:text-4xl">BAM!</span>
              </div>
              {/* Rank */}
              {manga.rank && manga.rank <= 50 && (
                <div className="absolute -top-3 -left-3 bg-akira-red text-ink px-3 py-1 font-mono text-sm font-bold uppercase tracking-widest shadow-hard">
                  RANK #{manga.rank}
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Conteúdo */}
        <div className={`md:col-span-7 ${reverse ? "md:order-1" : ""} [direction:ltr]`}>
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-8 h-px bg-ink" />
            <span className="eyebrow" style={{ color: isDark ? "var(--akira-yellow)" : "rgba(0,0,0,0.75)" }}>
              {label}
            </span>
            <span className="jp text-sm" style={{ color: isDark ? "var(--akira-yellow)" : "rgba(0,0,0,0.75)" }}>
              {jpLabel}
            </span>
          </div>

          {/* JP title */}
          {manga.titleJp && (
            <p className="jp text-2xl md:text-4xl mb-2 opacity-80" style={{ color: text }}>
              {manga.titleJp}
            </p>
          )}

          {/* Título */}
          <h2 className="display text-5xl md:text-7xl leading-[0.9] mb-6" style={{ color: text }}>
            {manga.title}
          </h2>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-6 text-sm font-mono uppercase tracking-widest">
            {manga.author && (
              <span style={{ color: isDark ? "var(--ink-soft)" : "rgba(0,0,0,0.7)" }}>
                {manga.author}
              </span>
            )}
            {manga.score && (
              <span className="px-2 py-0.5 border-2 border-akira-yellow text-akira-yellow font-bold">
                ★ {manga.score.toFixed(2)}
              </span>
            )}
            {manga.demographic && (
              <span className="px-2 py-0.5 border" style={{ borderColor: isDark ? "var(--akira-cyan)" : "rgba(0,0,0,0.5)", color: isDark ? "var(--akira-cyan)" : "rgba(0,0,0,0.7)" }}>
                {manga.demographic}
              </span>
            )}
            {manga.volumes && (
              <span style={{ color: isDark ? "var(--ink-muted)" : "rgba(0,0,0,0.55)" }}>
                {manga.volumes} vol
              </span>
            )}
          </div>

          {/* Sinopse */}
          {manga.synopsis && (
            <p
              className="text-base md:text-lg leading-relaxed mb-8 max-w-2xl line-clamp-5"
              style={{ color: isDark ? "var(--ink-soft)" : "rgba(0,0,0,0.78)" }}
            >
              {manga.synopsis}
            </p>
          )}

          {/* Tags */}
          {manga.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {manga.genres.map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 font-mono text-xs uppercase tracking-widest border-2"
                  style={{
                    borderColor: isDark ? "var(--ink)" : "rgba(0,0,0,0.8)",
                    color: text,
                    background: "rgba(0,0,0,0.25)",
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={`/manga/${manga.id}`}
              className="inline-flex items-center gap-3 px-8 py-4 bg-akira-red text-ink font-bold uppercase tracking-widest text-sm border-2 border-ink shadow-hard hover:shadow-hard-lg hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              Comprar colecao
              <span>→</span>
            </Link>
            <Link
              href={`/manga/${manga.id}`}
              className="inline-flex items-center gap-3 px-6 py-4 font-bold uppercase tracking-widest text-sm border-2 hover:bg-ink transition-all"
              style={{
                borderColor: text,
                color: text,
              }}
            >
              Ver detalhes
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
