import { getMangaColor, getMangaColorAlpha } from "@/lib/manga-colors";
import { getVolumeCoversByTitle } from "@/lib/mangadex-api";
import VolumeCoverImage from "./VolumeCoverImage";

type Props = {
  title: string;
  totalVolumes: number | null;
  isPublishing: boolean;
};

/**
 * Grid de volumes — agora puxa capas REAIS por volume via MangaDex.
 *
 * Fluxo:
 *  1. Tenta `getVolumeCoversByTitle(title)` no server (cache 24h via fetch ISR).
 *  2. Pra cada volume, se temos capa MangaDex -> usa next/image + badge.
 *  3. Senao -> fallback colorido (visual original).
 *
 * Mangas obscuros que nao tem registro no MangaDex caem 100% no fallback,
 * sem quebrar a UI.
 */
export default async function MangaVolumes({
  title,
  totalVolumes,
  isPublishing,
}: Props) {
  if (!totalVolumes || totalVolumes < 1) {
    return (
      <section className="bg-bg py-16 px-4 md:px-8 border-b border-[var(--line)]">
        <div className="max-w-7xl mx-auto text-center">
          <p className="eyebrow text-ink-muted">Volumes em catalogo</p>
          <p className="display text-3xl text-ink-muted mt-2">
            {isPublishing ? "Em publicacao — volumes em breve" : "Sem volumes catalogados"}
          </p>
        </div>
      </section>
    );
  }

  const color = getMangaColor(title);
  const colorSoft = getMangaColorAlpha(title, 0.6);

  // Limitar exibicao pra nao estourar (mostra primeiros 12)
  const displayCount = Math.min(totalVolumes, 12);
  const volumes = Array.from({ length: displayCount }, (_, i) => i + 1);

  // Busca capas MangaDex (server-side, cache 24h). Falha = array vazio.
  const mdxCovers = await getVolumeCoversByTitle(title);
  const coverByVolume = new Map(
    mdxCovers.map((c) => [String(parseInt(c.volumeNumber)), c.coverUrl]),
  );

  // Preco mock por volume (R$ 29.90 padrao, varia +/-)
  const priceMap = (vol: number) => {
    const base = 29.9;
    const variant = vol % 3 === 0 ? 5 : 0;
    return base + variant;
  };

  return (
    <section
      className="relative py-16 md:py-24 px-4 md:px-8 border-b border-[var(--line)] overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 60% 50% at 50% 0%, ${colorSoft} 0%, transparent 60%),
          var(--bg)
        `,
      }}
    >
      <div className="absolute inset-0 halftone-lg opacity-25 pointer-events-none" aria-hidden />

      <div className="relative max-w-7xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-1.5 h-8 shadow-[3px_3px_0_var(--ink)]" style={{ background: color }} />
              <p className="eyebrow text-akira-yellow glow-yellow">Comprar volumes</p>
              <span className="jp text-base text-akira-yellow glow-yellow">巻別購入</span>
            </div>
            <h2 className="display text-3xl md:text-5xl">
              Catalogo da serie
            </h2>
          </div>
          <div className="text-right">
            <p className="display text-4xl text-akira-red glow-red">{totalVolumes}</p>
            <p className="eyebrow text-ink-muted">volumes totais</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5 stagger">
          {volumes.map((vol) => {
            const price = priceMap(vol);
            const coverUrl = coverByVolume.get(String(vol)) ?? null;
            return (
              <button
                key={vol}
                type="button"
                className="group block text-left card-lift w-full"
              >
                <div className="relative aspect-[2/3] border-2 border-ink shadow-hard group-hover:shadow-hard-lg overflow-hidden flex items-center justify-center bg-bg">
                  <VolumeCoverImage
                    coverUrl={coverUrl}
                    seriesTitle={title}
                    volumeNumber={vol}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                  />

                  {/* Add to cart hover */}
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-black/85 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-between z-20">
                    <span className="text-xs font-mono font-bold text-akira-cyan">+ Carrinho</span>
                    <span className="text-xs">→</span>
                  </div>
                </div>
                <div className="mt-2 flex items-baseline justify-between px-1">
                  <span className="font-mono text-[10px] text-ink-muted uppercase tracking-widest">
                    Vol {String(vol).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-sm text-akira-red font-bold numerals">
                    R${price.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {totalVolumes > displayCount && (
          <p className="mt-8 text-center text-sm font-mono text-ink-muted">
            Mostrando {displayCount} de {totalVolumes} volumes.{" "}
            <button type="button" className="text-akira-cyan hover:text-akira-yellow underline">
              Ver todos →
            </button>
          </p>
        )}

        {/* Box set deal */}
        <div className="mt-12 panel-frame px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="eyebrow text-akira-yellow glow-yellow mb-2">📦 Box Set Deal</p>
            <p className="display text-2xl md:text-3xl text-ink">
              Colecao completa <span className="text-akira-red">15% off</span>
            </p>
            <p className="text-sm text-ink-muted font-mono mt-1">
              Todos os {totalVolumes} volumes em uma compra. Frete unico.
            </p>
          </div>
          <button
            type="button"
            className="shimmer px-8 py-4 bg-akira-red text-ink font-bold uppercase tracking-widest text-sm border-2 border-ink shadow-hard hover:shadow-hard-lg hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
          >
            Comprar tudo →
          </button>
        </div>
      </div>
    </section>
  );
}
