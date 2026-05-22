import Link from "next/link";
import { getMangaColor, getMangaColorAlpha } from "@/lib/manga-colors";
import { getVolumeCoversByTitle } from "@/lib/mangadex-api";
import VolumeCoverImage from "./VolumeCoverImage";

type Props = {
  mangaId: number;
  mangaTitle: string;
  totalVolumes: number;
  currentVolume: number;
};

// Mesma regra de preco do MangaVolumes pra consistencia
function priceFor(vol: number): number {
  const base = 29.9;
  const variant = vol % 3 === 0 ? 5 : 0;
  return base + variant;
}

// Escolhe ate 8 volumes proximos ao atual, evita o atual
function pickNearby(current: number, total: number, count = 8): number[] {
  const all: number[] = [];
  for (let i = 1; i <= total; i++) if (i !== current) all.push(i);
  if (all.length <= count) return all;
  // pega janela de count em torno do current
  const sorted = [...all].sort((a, b) => Math.abs(a - current) - Math.abs(b - current));
  return sorted.slice(0, count).sort((a, b) => a - b);
}

const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default async function RelatedVolumes({
  mangaId,
  mangaTitle,
  totalVolumes,
  currentVolume,
}: Props) {
  if (!totalVolumes || totalVolumes < 2) return null;

  const color = getMangaColor(mangaTitle);
  const colorSoft = getMangaColorAlpha(mangaTitle, 0.6);

  const volumes = pickNearby(currentVolume, totalVolumes, 8);

  // Capas reais MangaDex (cache 24h, graceful fail = [])
  const mdxCovers = await getVolumeCoversByTitle(mangaTitle);
  const coverByVolume = new Map(
    mdxCovers.map((c) => [String(parseInt(c.volumeNumber)), c.coverUrl]),
  );

  return (
    <section
      className="relative py-16 md:py-20 px-4 md:px-8 border-b border-[var(--line)] overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 50% 40% at 80% 0%, ${colorSoft} 0%, transparent 60%),
          var(--bg)
        `,
      }}
    >
      <div className="absolute inset-0 halftone-lg opacity-20 pointer-events-none" aria-hidden />

      <div className="relative max-w-7xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span
                className="block w-1.5 h-8 shadow-[3px_3px_0_var(--ink)]"
                style={{ background: color }}
              />
              <p className="eyebrow text-akira-pink glow-pink">Outros volumes</p>
              <span className="jp text-base text-akira-pink glow-pink">他の巻</span>
            </div>
            <h2 className="display text-3xl md:text-5xl">Continue a serie</h2>
            <p className="mt-2 text-sm font-mono text-ink-muted uppercase tracking-widest">
              {totalVolumes} volumes na colecao · {totalVolumes - 1} disponiveis fora deste
            </p>
          </div>
          <Link
            href={`/manga/${mangaId}`}
            className="inline-flex items-center gap-2 px-5 py-3 border-2 border-akira-cyan text-akira-cyan font-mono text-[11px] font-bold uppercase tracking-widest hover:bg-akira-cyan hover:text-bg transition-colors"
          >
            <span>Ver colecao completa</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-5 stagger">
          {volumes.map((vol) => {
            const price = priceFor(vol);
            const isAdjacent = Math.abs(vol - currentVolume) === 1;
            const coverUrl = coverByVolume.get(String(vol)) ?? null;
            return (
              <Link
                key={vol}
                href={`/manga/${mangaId}/volume/${vol}`}
                className="group block text-left card-lift"
              >
                <div className="relative aspect-[2/3] border-2 border-ink shadow-hard group-hover:shadow-hard-lg overflow-hidden flex items-center justify-center bg-bg">
                  <VolumeCoverImage
                    coverUrl={coverUrl}
                    seriesTitle={mangaTitle}
                    volumeNumber={vol}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />

                  {isAdjacent && (
                    // Quando tem coverUrl, "Capa oficial" ocupa top-right do VolumeCoverImage
                    // Empurra o badge "Anterior/Proximo" pra baixo dele
                    <span
                      className={`absolute right-2 px-2 py-0.5 bg-akira-pink text-bg text-[9px] font-mono font-bold uppercase tracking-widest shadow-hard z-20 ${coverUrl ? "top-9" : "top-2"}`}
                    >
                      {vol < currentVolume ? "Anterior" : "Proximo"}
                    </span>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-2 bg-black/85 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-between z-20">
                    <span className="text-[11px] font-mono font-bold text-akira-cyan">
                      Ver volume
                    </span>
                    <span className="text-xs">→</span>
                  </div>
                </div>
                <div className="mt-2 flex items-baseline justify-between px-1">
                  <span className="font-mono text-[10px] text-ink-muted uppercase tracking-widest">
                    Vol {String(vol).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-sm text-akira-red font-bold numerals">
                    {fmtBRL(price)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
