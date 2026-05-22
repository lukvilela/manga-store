import Link from "next/link";
import Image from "next/image";
import { getMangaColor, getMangaColorAlpha } from "@/lib/manga-colors";
import type { MangaCardData } from "@/lib/manga-api";
import StockBadge from "./StockBadge";

type Props = {
  manga: MangaCardData;
  size?: "sm" | "md" | "lg";
};

export default function MangaCard({ manga, size = "md" }: Props) {
  const color = getMangaColor(manga.title);
  const colorSoft = getMangaColorAlpha(manga.title, 0.65);

  const widthClass = size === "sm" ? "w-40" : size === "lg" ? "w-64" : "w-52";
  const heightClass = size === "sm" ? "h-60" : size === "lg" ? "h-96" : "h-72";

  return (
    <Link
      href={`/manga/${manga.id}`}
      data-testid="manga-card"
      className={`group block flex-shrink-0 card-lift hover-tilt ${widthClass}`}
    >
      {/* Frame colorido externo */}
      <div
        className="p-1.5 border-2 border-ink shadow-hard group-hover:shadow-hard-lg transition-all relative"
        style={{
          background: `linear-gradient(135deg, ${color} 0%, ${colorSoft} 100%)`,
        }}
      >
        {/* Capa — vt-cover habilita view-transition smooth pra detail page
         * (Cuidado: so 1 elemento com mesmo viewTransitionName pode existir;
         * navegacoes que disparam multiplas instancias caem no fallback fade) */}
        <div
          className={`relative ${heightClass} overflow-hidden`}
          style={{ viewTransitionName: `cover-${manga.id}` }}
        >
          {manga.cover && (
            <Image
              src={manga.cover}
              alt={manga.title}
              fill
              sizes="(max-width: 768px) 50vw, 256px"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              unoptimized
            />
          )}

          {/* Gradient bottom escuro pra legibilidade */}
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />

          {/* Rank badge */}
          {manga.rank && manga.rank <= 100 && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-akira-red text-ink text-[10px] font-mono font-bold uppercase tracking-widest shadow-hard">
              #{manga.rank}
            </div>
          )}

          {/* Score badge */}
          {manga.score && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-black/85 backdrop-blur-sm border border-akira-cyan text-akira-cyan text-xs font-mono numerals">
              ★ {manga.score.toFixed(2)}
            </div>
          )}

          {/* Chip "ULTIMAS" — so aparece pra ~8% dos cards (determinismo do hash) */}
          <div className="absolute bottom-14 right-2 z-20">
            <StockBadge volumeId={`${manga.id}-vol-1`} variant="chip" />
          </div>

          {/* Title */}
          <div className="absolute inset-x-0 bottom-0 p-3 z-10">
            <h3 className="display text-lg md:text-xl text-white leading-[0.95] line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              {manga.title}
            </h3>
            {manga.titleJp && (
              <p className="jp text-xs text-white/80 mt-1 line-clamp-1 drop-shadow">{manga.titleJp}</p>
            )}
          </div>

          {/* Hover onomatopeia */}
          <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
            <span className="onomatopeia text-xs">BAM!</span>
          </div>
        </div>
      </div>

      {/* Meta abaixo */}
      <div className="mt-3 px-1">
        <div className="flex items-baseline justify-between gap-2 text-xs">
          <p className="text-ink-soft font-mono truncate flex-1">
            {manga.author || "—"}
          </p>
          <p className="text-ink-muted font-mono numerals shrink-0">
            {manga.volumes ? `${manga.volumes} vol` : "ongoing"}
          </p>
        </div>
        {(manga.demographic || manga.genres[0]) && (
          <p className="mt-1 text-[10px] font-mono uppercase tracking-wider truncate">
            {manga.demographic && <span className="text-akira-yellow">{manga.demographic}</span>}
            {manga.demographic && manga.genres[0] && <span className="text-ink-muted"> · </span>}
            {manga.genres[0] && <span className="text-ink-muted">{manga.genres.slice(0, 2).join(" · ")}</span>}
          </p>
        )}
      </div>
    </Link>
  );
}
