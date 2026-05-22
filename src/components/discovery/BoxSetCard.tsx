import Image from "next/image";
import { getMangaColor, getMangaColorAlpha } from "@/lib/manga-colors";
import { formatBRL, type BoxSet } from "@/lib/box-sets";

type Props = {
  boxSet: BoxSet;
  coverUrl?: string | null;
};

/**
 * Card visual da colecao completa. Usado em /manga/[id].
 * Visual: frame colorido da cor da serie + halftone, totem preco
 * com o regular riscado, lista enxuta de volumes, CTA shimmer.
 */
export default function BoxSetCard({ boxSet, coverUrl }: Props) {
  const color = getMangaColor(boxSet.mangaTitle);
  const colorSoft = getMangaColorAlpha(boxSet.mangaTitle, 0.55);

  // Lista enxuta: mostra ate 8 volumes, com "..." se >9
  const previewVols = boxSet.includedVolumes.slice(0, 8);
  const hasMore = boxSet.includedVolumes.length > 8;

  return (
    <article
      className="relative panel-frame overflow-hidden hover-tilt"
      style={{
        background: `
          radial-gradient(ellipse 70% 60% at 0% 0%, ${colorSoft} 0%, transparent 65%),
          var(--bg-2)
        `,
      }}
    >
      <div className="absolute inset-0 halftone-lg opacity-20 pointer-events-none" aria-hidden />

      <div className="relative grid grid-cols-1 md:grid-cols-[180px_1fr_auto] gap-6 items-center p-6">
        {/* Capa + badge */}
        <div className="relative w-44 md:w-full aspect-[2/3] border-2 border-ink shadow-hard overflow-hidden mx-auto">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={boxSet.mangaTitle}
              fill
              sizes="180px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, ${color} 0%, ${colorSoft} 100%)` }}
            />
          )}
          <div className="absolute top-2 left-2 px-2 py-1 bg-akira-yellow text-ink text-[10px] font-mono font-bold uppercase tracking-widest shadow-hard">
            Colecao
          </div>
        </div>

        {/* Meta + volumes */}
        <div className="min-w-0">
          <p className="eyebrow text-akira-yellow glow-yellow">Box Set Completo</p>
          <h3 className="display text-2xl md:text-3xl text-ink mt-2 leading-tight">
            {boxSet.mangaTitle}
          </h3>
          <p className="mt-1 text-xs font-mono text-ink-muted uppercase tracking-widest">
            {boxSet.totalVolumes} volumes · entrega unica · frete fechado
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {previewVols.map((v) => (
              <span
                key={v}
                className="px-2 py-1 border border-[var(--line)] text-[10px] font-mono numerals text-ink-soft"
              >
                Vol {String(v).padStart(2, "0")}
              </span>
            ))}
            {hasMore && (
              <span className="px-2 py-1 border border-akira-cyan text-akira-cyan text-[10px] font-mono">
                +{boxSet.includedVolumes.length - 8}
              </span>
            )}
          </div>
        </div>

        {/* Totem de preco + CTA */}
        <div className="flex flex-col items-stretch md:items-end gap-3 md:min-w-[200px]">
          <div className="text-right">
            <p className="text-xs font-mono text-ink-muted uppercase tracking-widest line-through numerals">
              {formatBRL(boxSet.totalRegular)}
            </p>
            <p className="display text-3xl md:text-4xl text-akira-red glow-red numerals">
              {formatBRL(boxSet.totalDiscounted)}
            </p>
            <p className="text-[11px] font-mono text-akira-green numerals">
              Voce economiza {formatBRL(boxSet.savings)} ({boxSet.discountPct}% off)
            </p>
          </div>
          <button
            type="button"
            className="shimmer w-full md:w-auto px-6 py-3 bg-akira-red text-ink font-bold uppercase tracking-widest text-sm border-2 border-ink shadow-hard hover:shadow-hard-lg hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all whitespace-nowrap"
          >
            Comprar colecao →
          </button>
        </div>
      </div>
    </article>
  );
}
