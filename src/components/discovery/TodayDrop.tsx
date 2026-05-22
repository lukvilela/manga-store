import Link from "next/link";
import Image from "next/image";
import { getMangaColor, getMangaColorAlpha } from "@/lib/manga-colors";
import type { MangaCardData } from "@/lib/manga-api";

type Props = {
  novo: MangaCardData | null;
  maisVendido: MangaCardData | null;
  joia: MangaCardData | null;
};

/**
 * "Hoje em destaque" — bloco diario na home.
 * 3 picks: novidade, mais vendido (mock = pega 1 do top), joia escondida.
 * Data atual em PT-BR aparece no header (renderiza no server, sem mismatch).
 */
export default function TodayDrop({ novo, maisVendido, joia }: Props) {
  const today = new Date();
  const fmt = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const dateLabel = fmt.format(today);

  const items: Array<{ card: MangaCardData | null; tag: string; emoji: string; accent: string; jp: string }> = [
    { card: novo, tag: "Novo no catalogo", emoji: "🆕", accent: "akira-cyan", jp: "新着" },
    { card: maisVendido, tag: "Mais vendido hoje", emoji: "🔥", accent: "akira-red", jp: "売れ筋" },
    { card: joia, tag: "Joia escondida", emoji: "💎", accent: "akira-violet", jp: "隠し玉" },
  ];

  return (
    <section className="relative bg-zone-warm py-16 md:py-20 px-4 md:px-8 border-b border-[var(--line)] overflow-hidden">
      <div className="absolute inset-0 halftone opacity-30 pointer-events-none" aria-hidden />
      <div className="bike-streak" style={{ top: "30%" }} />

      <div className="relative max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-1.5 h-8 bg-akira-yellow shadow-[3px_3px_0_var(--ink)]" />
              <p className="eyebrow text-akira-yellow glow-yellow">Hoje em destaque</p>
              <span className="jp text-base text-akira-yellow glow-yellow">本日のピック</span>
            </div>
            <h2 className="display text-4xl md:text-5xl text-ink">
              Drop do dia
            </h2>
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
            📅 {dateLabel}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7 stagger">
          {items.map((it, idx) => (
            <DropCard key={idx} {...it} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DropCard({
  card,
  tag,
  emoji,
  accent,
  jp,
}: {
  card: MangaCardData | null;
  tag: string;
  emoji: string;
  accent: string;
  jp: string;
}) {
  if (!card) {
    return (
      <div className="border-2 border-dashed border-[var(--line)] p-6 h-full flex items-center justify-center">
        <p className="text-ink-muted font-mono text-xs uppercase tracking-widest">
          Sem destaque hoje
        </p>
      </div>
    );
  }

  const color = getMangaColor(card.title);
  const colorSoft = getMangaColorAlpha(card.title, 0.6);

  return (
    <Link
      href={`/manga/${card.id}`}
      className="group block card-lift border-2 border-ink shadow-hard hover:shadow-hard-lg transition-all bg-bg-2 relative overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity"
        style={{ background: `radial-gradient(ellipse at 100% 0%, ${colorSoft} 0%, transparent 60%)` }}
        aria-hidden
      />

      <div className="relative flex gap-4 p-4 md:p-5">
        {/* Capa */}
        <div
          className="relative w-24 md:w-28 aspect-[2/3] flex-shrink-0 border-2 border-ink shadow-hard overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${color} 0%, ${colorSoft} 100%)` }}
        >
          {card.cover && (
            <Image
              src={card.cover}
              alt={card.title}
              fill
              sizes="120px"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              unoptimized
            />
          )}
        </div>

        {/* Meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl leading-none" aria-hidden>{emoji}</span>
            <span className={`jp text-xs text-${accent}`}>{jp}</span>
          </div>
          <p className={`eyebrow text-${accent}`}>{tag}</p>
          <h3 className="display text-lg md:text-xl text-ink mt-1 leading-tight line-clamp-2">
            {card.title}
          </h3>
          {card.titleJp && (
            <p className="jp text-xs text-ink-muted mt-1 line-clamp-1">{card.titleJp}</p>
          )}
          <div className="mt-3 flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-ink-muted">
            {card.score && (
              <span className="text-akira-cyan numerals">★ {card.score.toFixed(2)}</span>
            )}
            {card.rank && (
              <>
                <span>·</span>
                <span className="numerals">#{card.rank}</span>
              </>
            )}
            {card.volumes && (
              <>
                <span>·</span>
                <span className="numerals">{card.volumes} vol</span>
              </>
            )}
          </div>
          <p className="mt-3 inline-block text-xs font-mono uppercase tracking-widest text-ink group-hover:text-akira-yellow transition-colors">
            Ver detalhes →
          </p>
        </div>
      </div>
    </Link>
  );
}
