import Link from "next/link";
import Image from "next/image";
import { getMangaColor, getMangaColorAlpha, getContrastText } from "@/lib/manga-colors";
import type { MangaCardData } from "@/lib/manga-api";
import AddToCartForm from "./AddToCartForm";

type Props = {
  manga: MangaCardData & {
    status?: string;
    chapters?: number | null;
    publishing?: boolean;
    titleEnglish?: string | null;
  };
  volumeNumber: number;
  totalVolumes: number;
  price: number;
};

const fmtBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function VolumeProductHero({
  manga,
  volumeNumber,
  totalVolumes,
  price,
}: Props) {
  const color = getMangaColor(manga.title);
  const colorSoft = getMangaColorAlpha(manga.title, 0.7);
  const colorFaint = getMangaColorAlpha(manga.title, 0.18);
  const text = getContrastText(color);
  const isDark = text === "#ededf2";

  const volStr = String(volumeNumber).padStart(2, "0");
  const slug = slugify(manga.title);

  return (
    <section
      className="relative overflow-hidden border-b-4 border-akira-red"
      style={{
        background: `
          radial-gradient(ellipse 90% 80% at 70% 30%, ${colorSoft} 0%, transparent 70%),
          radial-gradient(ellipse 40% 40% at 20% 80%, ${color} 0%, transparent 60%),
          linear-gradient(180deg, ${color} 0%, var(--bg) 95%)
        `,
      }}
    >
      {/* Halftone */}
      <div
        className="absolute inset-0 halftone-lg opacity-50 pointer-events-none"
        aria-hidden
      />

      {/* Action lines */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(45deg, transparent 0, transparent 38px, ${colorFaint} 38px, ${colorFaint} 40px)`,
        }}
        aria-hidden
      />

      {/* JP huge bg */}
      <div
        className="absolute inset-0 flex items-center justify-end pointer-events-none select-none overflow-hidden pr-4 md:pr-12"
        aria-hidden
      >
        <span
          className="display font-black opacity-[0.06] leading-none whitespace-nowrap"
          style={{ fontSize: "clamp(12rem, 30vw, 32rem)", color: text }}
        >
          {volStr}
        </span>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        {/* Capa + numero gigante */}
        <div className="md:col-span-5 lg:col-span-5">
          <div
            className="relative aspect-[2/3] max-w-md mx-auto md:mx-0 border-4 border-ink shadow-hard-lg depth-stack overflow-hidden"
            style={{ background: color }}
          >
            {manga.cover && (
              <Image
                src={manga.cover}
                alt={`${manga.title} Volume ${volStr}`}
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                className="object-cover opacity-95"
                unoptimized
                priority
              />
            )}

            {/* Vertical gradient pra legibilidade do numero */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

            {/* Halftone overlay */}
            <div className="absolute inset-0 halftone opacity-30 pointer-events-none" aria-hidden />

            {/* Numero gigante sobreposto */}
            <div className="absolute inset-x-0 bottom-2 flex flex-col items-center justify-end pointer-events-none">
              <span className="eyebrow text-akira-yellow glow-yellow mb-1 text-[10px]">
                Volume
              </span>
              <span
                className="display text-[7rem] md:text-[10rem] leading-none text-akira-red glow-red drop-shadow-[0_6px_14px_rgba(0,0,0,0.85)]"
                style={{ WebkitTextStroke: "2px var(--ink)" }}
              >
                {volStr}
              </span>
            </div>

            {/* Vol badge top */}
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/80 border border-akira-yellow text-akira-yellow text-[10px] font-mono font-bold uppercase tracking-widest">
              Vol {volStr} / {String(totalVolumes).padStart(2, "0")}
            </div>

            {/* Rank badge */}
            {manga.rank && (
              <div className="absolute -top-3 -right-3 bg-akira-red text-ink px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest shadow-hard">
                RANK #{manga.rank}
              </div>
            )}

            {/* Onomatopeia */}
            <div className="absolute -bottom-4 -left-4">
              <span className="onomatopeia text-2xl md:text-3xl">POW!</span>
            </div>
          </div>

          {/* Mini ribbon abaixo da capa */}
          <div className="mt-4 max-w-md mx-auto md:mx-0 flex items-center gap-2 px-3 py-2 bg-black/40 border-2 border-akira-cyan/70">
            <span className="pulse-neon w-2 h-2 rounded-full bg-akira-cyan shrink-0" />
            <p className="text-[11px] font-mono uppercase tracking-widest text-akira-cyan">
              Em estoque · entrega em 3-5 dias
            </p>
          </div>
        </div>

        {/* Conteudo */}
        <div className="md:col-span-7 lg:col-span-7">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-6 text-[11px] font-mono uppercase tracking-widest flex-wrap">
            <Link
              href="/"
              className="text-ink-muted hover:text-akira-cyan transition-colors"
            >
              MangaVerse
            </Link>
            <span className="text-ink-muted">/</span>
            <Link
              href="/busca"
              className="text-ink-muted hover:text-akira-cyan transition-colors"
            >
              Catalogo
            </Link>
            <span className="text-ink-muted">/</span>
            <Link
              href={`/manga/${manga.id}`}
              className="text-ink-soft hover:text-akira-cyan transition-colors truncate max-w-[12rem]"
            >
              {manga.title}
            </Link>
            <span className="text-ink-muted">/</span>
            <span className="text-akira-yellow">Vol {volStr}</span>
          </nav>

          {/* JP title */}
          {manga.titleJp && (
            <p
              className="jp text-xl md:text-3xl mb-2 opacity-90 glow-red"
              style={{ color: text }}
            >
              {manga.titleJp}
            </p>
          )}

          {/* Titulo */}
          <h1
            className="display text-4xl md:text-6xl lg:text-7xl leading-[0.9] mb-2"
            style={{ color: text }}
          >
            {manga.title}
            <span className="block text-akira-red glow-red mt-1">
              Volume {volStr}
            </span>
          </h1>

          {/* English title */}
          {manga.titleEnglish && manga.titleEnglish !== manga.title && (
            <p
              className="font-mono text-sm mt-2 opacity-70 italic"
              style={{
                color: isDark ? "var(--ink-soft)" : "rgba(0,0,0,0.7)",
              }}
            >
              {manga.titleEnglish} — Vol. {volStr}
            </p>
          )}

          {/* Meta line */}
          <div className="flex flex-wrap items-center gap-3 mt-5 mb-6 text-xs font-mono uppercase tracking-widest">
            {manga.author && (
              <span className="font-bold" style={{ color: text }}>
                {manga.author}
              </span>
            )}
            {manga.score && (
              <span className="px-3 py-1 border-2 border-akira-yellow text-akira-yellow font-bold flex items-center gap-1 bg-black/30">
                ★ {manga.score.toFixed(2)}
              </span>
            )}
            {manga.demographic && (
              <span
                className="px-3 py-1 border-2"
                style={{
                  borderColor: isDark
                    ? "var(--akira-cyan)"
                    : "rgba(0,0,0,0.6)",
                  color: isDark ? "var(--akira-cyan)" : "rgba(0,0,0,0.8)",
                  background: "rgba(0,0,0,0.25)",
                }}
              >
                {manga.demographic}
              </span>
            )}
          </div>

          {/* Card de preco + compra */}
          <div className="panel-frame px-5 py-6 md:px-6 md:py-7 bg-bg/85 backdrop-blur-sm">
            <div className="flex items-baseline justify-between gap-3 mb-2">
              <p className="eyebrow text-ink-muted">Preco unitario</p>
              <p className="text-[11px] font-mono text-akira-cyan uppercase tracking-widest">
                Frete gratis acima de R$150
              </p>
            </div>

            <div className="flex items-end gap-3 mb-4">
              <p className="display text-5xl md:text-6xl text-akira-red glow-red numerals leading-none">
                {fmtBRL.format(price)}
              </p>
              <p className="text-[11px] font-mono text-ink-muted uppercase tracking-widest pb-1">
                ou 3x sem juros
              </p>
            </div>

            <AddToCartForm
              volumeId={`${slug}-vol-${volumeNumber}`}
              seriesSlug={slug}
              seriesTitle={manga.title}
              volumeNumber={volumeNumber}
              price={price}
              coverImage={manga.cover}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
