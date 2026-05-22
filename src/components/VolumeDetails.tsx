import { getMangaColor, getMangaColorAlpha } from "@/lib/manga-colors";

type Props = {
  mangaTitle: string;
  mangaId: number;
  volumeNumber: number;
  totalVolumes: number;
  isPublishing: boolean;
  synopsis: string | null;
};

// Editora mock — alterna entre as duas conhecidas no BR
function pickPublisher(mangaId: number, volume: number): string {
  const opts = ["Panini Comics", "Editora JBC", "NewPOP", "Devir"];
  return opts[(mangaId + volume) % opts.length];
}

// Paginas mock entre 192 e 220
function pickPages(mangaId: number, volume: number): number {
  return 192 + ((mangaId + volume * 7) % 29);
}

// ISBN mock (estilo 978-XX-XXXX-XXX-X)
function pickIsbn(mangaId: number, volume: number): string {
  const seed = mangaId * 113 + volume * 17;
  const a = String(10 + (seed % 90));
  const b = String(1000 + ((seed * 3) % 9000));
  const c = String(100 + ((seed * 7) % 900));
  const d = String((seed * 13) % 10);
  return `978-${a}-${b}-${c}-${d}`;
}

// Peso mock entre 180g e 260g
function pickWeight(mangaId: number, volume: number): number {
  return 180 + ((mangaId + volume * 3) % 81);
}

export default function VolumeDetails({
  mangaTitle,
  mangaId,
  volumeNumber,
  totalVolumes,
  isPublishing,
  synopsis,
}: Props) {
  const color = getMangaColor(mangaTitle);
  const colorSoft = getMangaColorAlpha(mangaTitle, 0.4);

  const publisher = pickPublisher(mangaId, volumeNumber);
  const pages = pickPages(mangaId, volumeNumber);
  const isbn = pickIsbn(mangaId, volumeNumber);
  const weight = pickWeight(mangaId, volumeNumber);

  const volStr = String(volumeNumber).padStart(2, "0");
  const totalStr = String(totalVolumes).padStart(2, "0");

  // Sinopse curta da serie como teaser do volume
  const teaser = synopsis
    ? synopsis.slice(0, 320).trim() + (synopsis.length > 320 ? "..." : "")
    : null;

  const fichaTecnica: Array<[string, string]> = [
    ["Editora", publisher],
    ["Formato", "Capa comum · Brochura"],
    ["Paginas", `${pages} paginas`],
    ["Idioma", "Portugues (BR)"],
    ["ISBN-13", isbn],
    ["Peso", `${weight} g`],
    ["Dimensoes", "13,5 × 20,5 × 1,5 cm"],
    ["Volume", `${volStr} de ${totalStr}${isPublishing ? " (em publicacao)" : ""}`],
  ];

  return (
    <section
      className="relative py-16 md:py-20 px-4 md:px-8 border-b border-[var(--line)] overflow-hidden"
      style={{
        background: `radial-gradient(ellipse 70% 50% at 20% 0%, ${colorSoft} 0%, transparent 65%), var(--bg)`,
      }}
    >
      <div className="absolute inset-0 halftone opacity-20 pointer-events-none" aria-hidden />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Coluna 1 — descricao + teaser */}
        <div className="lg:col-span-7">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="block w-1.5 h-8 shadow-[3px_3px_0_var(--ink)]"
              style={{ background: color }}
            />
            <p className="eyebrow text-akira-cyan glow-cyan">Detalhes do volume</p>
            <span className="jp text-base text-akira-cyan glow-cyan">第{volumeNumber}巻</span>
          </div>

          <h2 className="display text-3xl md:text-5xl mb-6">
            Volume {volStr} <span className="text-ink-muted">/</span>{" "}
            <span className="text-akira-red glow-red">{totalStr}</span>
          </h2>

          <div className="space-y-5 text-base md:text-lg leading-relaxed text-ink-soft max-w-3xl">
            <p>
              <span className="text-akira-yellow font-bold">Volume {volStr}</span> da aclamada
              serie {mangaTitle}. Acompanhe mais um capitulo desta jornada que conquistou
              leitores no mundo todo. Edicao impressa em papel de alta gramatura, com sobrecapa
              e brindes exclusivos da {publisher}.
            </p>
            <p className="text-ink-muted text-sm italic border-l-2 border-akira-red pl-4">
              Confira a sinopse completa da serie na pagina principal. Os spoilers do volume
              ficam por conta do leitor — abra o lacre e mergulhe.
            </p>
            {teaser && (
              <details className="group">
                <summary className="cursor-pointer text-akira-cyan font-mono text-xs uppercase tracking-widest hover:text-akira-yellow transition-colors">
                  Resumo da serie ↓
                </summary>
                <p className="mt-3 text-sm text-ink-muted leading-relaxed">{teaser}</p>
              </details>
            )}
          </div>

          {/* Selos */}
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="px-3 py-2 bg-akira-red/15 border-2 border-akira-red text-akira-red font-mono text-[11px] font-bold uppercase tracking-widest">
              ✓ Edicao oficial BR
            </span>
            <span className="px-3 py-2 bg-akira-cyan/10 border-2 border-akira-cyan text-akira-cyan font-mono text-[11px] font-bold uppercase tracking-widest">
              ✓ Lacrado de fabrica
            </span>
            <span className="px-3 py-2 bg-akira-yellow/10 border-2 border-akira-yellow text-akira-yellow font-mono text-[11px] font-bold uppercase tracking-widest">
              ✓ Troca em 7 dias
            </span>
          </div>
        </div>

        {/* Coluna 2 — ficha tecnica */}
        <div className="lg:col-span-5">
          <div className="panel-frame p-6 md:p-7 bg-bg-2">
            <div className="flex items-center gap-3 mb-5">
              <span className="block w-1 h-6 bg-akira-yellow shadow-[2px_2px_0_var(--ink)]" />
              <p className="eyebrow text-akira-yellow glow-yellow">Ficha tecnica</p>
            </div>
            <dl className="divide-y divide-[var(--line)]">
              {fichaTecnica.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-4 py-3"
                >
                  <dt className="text-[11px] font-mono text-ink-muted uppercase tracking-widest shrink-0">
                    {label}
                  </dt>
                  <dd className="text-sm font-mono text-ink text-right numerals">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 pt-5 border-t-2 border-akira-red/40">
              <p className="text-[11px] font-mono text-ink-muted uppercase tracking-widest mb-2">
                Garantia
              </p>
              <p className="text-sm text-ink-soft leading-relaxed">
                MangaVerse garante autenticidade e troca em caso de defeito de fabrica.
                Envio com embalagem reforcada anti-amasso.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
