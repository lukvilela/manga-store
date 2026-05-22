import Link from "next/link";
import Image from "next/image";
import { getMangaColor, getMangaColorAlpha, getContrastText } from "@/lib/manga-colors";
import type { MangaCardData } from "@/lib/manga-api";

type Props = { manga: MangaCardData & { status?: string; chapters?: number | null; publishing?: boolean; titleEnglish?: string | null } };

export default function MangaDetailHero({ manga }: Props) {
  const color = getMangaColor(manga.title);
  const colorSoft = getMangaColorAlpha(manga.title, 0.65);
  const colorFaint = getMangaColorAlpha(manga.title, 0.18);
  const text = getContrastText(color);
  const isDark = text === "#ededf2";

  return (
    <section
      className="relative overflow-hidden border-b-4 border-akira-red"
      style={{
        background: `
          radial-gradient(ellipse 90% 80% at 70% 30%, ${colorSoft} 0%, transparent 70%),
          radial-gradient(ellipse 40% 40% at 20% 80%, ${color} 0%, transparent 60%),
          linear-gradient(180deg, ${color} 0%, var(--bg) 90%)
        `,
      }}
    >
      {/* Halftone overlay */}
      <div className="absolute inset-0 halftone-lg opacity-50 pointer-events-none" aria-hidden />

      {/* Action lines diagonal */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(45deg, transparent 0, transparent 40px, ${colorFaint} 40px, ${colorFaint} 42px)`,
        }}
        aria-hidden
      />

      {/* JP huge bg */}
      <div className="absolute inset-0 flex items-center justify-end pointer-events-none select-none overflow-hidden pr-4 md:pr-12" aria-hidden>
        {manga.titleJp && (
          <span
            className="jp font-black opacity-[0.07] leading-none whitespace-nowrap"
            style={{ fontSize: "clamp(10rem, 25vw, 28rem)", color: text }}
          >
            {manga.titleJp.slice(0, 3)}
          </span>
        )}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        {/* Capa grande */}
        <div className="md:col-span-5 lg:col-span-4">
          <div
            className="relative aspect-[2/3] max-w-md mx-auto md:mx-0 border-4 border-ink shadow-hard-lg depth-stack"
            style={{ background: color }}
          >
            {manga.cover && (
              <Image
                src={manga.cover}
                alt={manga.title}
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                className="object-cover"
                unoptimized
                priority
              />
            )}

            {/* Onomatopeia */}
            <div className="absolute -top-4 -right-4">
              <span className="onomatopeia text-2xl md:text-3xl">BAM!</span>
            </div>

            {/* Rank */}
            {manga.rank && (
              <div className="absolute -top-3 -left-3 bg-akira-red text-ink px-3 py-1 font-mono text-sm font-bold uppercase tracking-widest shadow-hard">
                RANK #{manga.rank}
              </div>
            )}

            {/* Status pulse */}
            {manga.publishing && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-akira-cyan text-bg px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest shadow-hard flex items-center gap-2">
                <span className="pulse-neon w-1.5 h-1.5 rounded-full bg-bg" />
                Em publicacao
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="md:col-span-7 lg:col-span-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-6 text-xs font-mono uppercase tracking-widest">
            <Link href="/" className="text-ink-muted hover:text-akira-cyan transition-colors">
              MangaVerse
            </Link>
            <span className="text-ink-muted">/</span>
            <Link href="/busca" className="text-ink-muted hover:text-akira-cyan transition-colors">
              Catalogo
            </Link>
            <span className="text-ink-muted">/</span>
            <span className="text-akira-yellow">{manga.demographic || "Manga"}</span>
          </div>

          {/* JP title */}
          {manga.titleJp && (
            <p
              className="jp text-2xl md:text-4xl mb-3 opacity-90 glow-red"
              style={{ color: text }}
            >
              {manga.titleJp}
            </p>
          )}

          {/* Título PT */}
          <h1 className="display text-6xl md:text-8xl leading-[0.88] mb-2" style={{ color: text }}>
            {manga.title}
          </h1>

          {/* English title se diferente */}
          {manga.titleEnglish && manga.titleEnglish !== manga.title && (
            <p
              className="font-mono text-base mt-2 opacity-70 italic"
              style={{ color: isDark ? "var(--ink-soft)" : "rgba(0,0,0,0.7)" }}
            >
              {manga.titleEnglish}
            </p>
          )}

          {/* Meta line */}
          <div className="flex flex-wrap items-center gap-3 mt-6 mb-8 text-sm font-mono uppercase tracking-widest">
            {manga.author && (
              <span
                className="font-bold"
                style={{ color: text }}
              >
                {manga.author}
              </span>
            )}
            {manga.score && (
              <span className="px-3 py-1 border-2 border-akira-yellow text-akira-yellow font-bold flex items-center gap-1 bg-black/30">
                ★ {manga.score.toFixed(2)} / 10
              </span>
            )}
            {manga.demographic && (
              <span
                className="px-3 py-1 border-2"
                style={{
                  borderColor: isDark ? "var(--akira-cyan)" : "rgba(0,0,0,0.6)",
                  color: isDark ? "var(--akira-cyan)" : "rgba(0,0,0,0.8)",
                  background: "rgba(0,0,0,0.25)",
                }}
              >
                {manga.demographic}
              </span>
            )}
            {manga.volumes && (
              <span style={{ color: isDark ? "var(--ink-muted)" : "rgba(0,0,0,0.55)" }}>
                {manga.volumes} vol
              </span>
            )}
            {manga.chapters && (
              <span style={{ color: isDark ? "var(--ink-muted)" : "rgba(0,0,0,0.55)" }}>
                {manga.chapters} cap
              </span>
            )}
          </div>

          {/* Sinopse curta */}
          {manga.synopsis && (
            <p
              className="text-base md:text-lg leading-relaxed max-w-3xl line-clamp-4 mb-8"
              style={{ color: isDark ? "var(--ink-soft)" : "rgba(0,0,0,0.82)" }}
            >
              {manga.synopsis}
            </p>
          )}

          {/* Tags genres */}
          {manga.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {manga.genres.map((g) => (
                <Link
                  key={g}
                  href={`/busca?q=${encodeURIComponent(g)}`}
                  className="px-3 py-1.5 font-mono text-xs uppercase tracking-widest border-2 hover:bg-ink hover:text-bg transition-all"
                  style={{
                    borderColor: isDark ? "var(--ink)" : "rgba(0,0,0,0.7)",
                    color: text,
                    background: "rgba(0,0,0,0.2)",
                  }}
                >
                  {g}
                </Link>
              ))}
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 mt-8">
            <button
              type="button"
              className="shimmer inline-flex items-center gap-3 px-8 py-4 bg-akira-red text-ink font-bold uppercase tracking-widest text-sm border-2 border-ink shadow-hard-lg hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[12px_12px_0_var(--ink)] transition-all"
            >
              <span>Comprar colecao</span>
              <span className="text-lg">→</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-3 px-6 py-4 font-bold uppercase tracking-widest text-sm border-2 hover:bg-ink transition-all"
              style={{ borderColor: text, color: text }}
            >
              <span>+</span>
              <span>Adicionar a estante</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-4 border-2 hover:bg-akira-pink hover:text-bg transition-all"
              style={{
                borderColor: isDark ? "var(--akira-pink)" : "rgba(0,0,0,0.7)",
                color: isDark ? "var(--akira-pink)" : "rgba(0,0,0,0.85)",
              }}
              aria-label="Wishlist"
            >
              <span>♥</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
