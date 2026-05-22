import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { getNovidadesManga, toCardData, type JikanManga } from "@/lib/manga-api";
import { getMangaColor, getMangaColorAlpha } from "@/lib/manga-colors";

export const revalidate = 3600;

function extractYear(m: JikanManga & { published?: { from?: string | null } }): number | null {
  // Jikan retorna .published.from no /manga (mas o tipo basico nao tem — defensivo)
  const raw = (m as unknown as { published?: { from?: string | null } }).published?.from;
  if (raw) {
    const y = new Date(raw).getFullYear();
    if (!isNaN(y)) return y;
  }
  return null;
}

export default async function NovidadesPage() {
  const mangas = await getNovidadesManga(30);
  const cards = mangas.map((m, i) => ({
    card: toCardData(m),
    year: extractYear(m),
    isFresh: i < 6,
  }));

  return (
    <>
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[var(--line)] bg-zone-cyan">
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden
        >
          <span
            className="jp text-akira-cyan opacity-[0.07] font-black leading-none"
            style={{ fontSize: "clamp(18rem, 42vw, 50rem)" }}
          >
            新作
          </span>
        </div>
        <div className="absolute inset-0 halftone-lg opacity-30 pointer-events-none" aria-hidden />
        <div className="bike-streak" style={{ top: "30%" }} />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
          <div className="flex items-center gap-3 mb-6">
            <span className="pulse-neon w-2 h-2 rounded-full bg-akira-cyan shadow-[0_0_12px_var(--akira-cyan)]" />
            <span className="eyebrow text-akira-cyan glow-cyan">JUST DROPPED / 新着</span>
            <span className="hidden md:inline eyebrow text-ink-muted">·</span>
            <span className="hidden md:inline eyebrow text-akira-yellow glow-yellow">FRESH 2025-2026</span>
          </div>

          <div className="mb-3">
            <span className="jp text-akira-cyan text-3xl md:text-5xl font-black glow-cyan">新作漫画</span>
          </div>

          <h1 className="display text-[clamp(3rem,11vw,9rem)] leading-[0.85]">
            <span className="block">NOVI-</span>
            <span className="block text-akira-cyan glow-cyan action-lines pl-2">DADES.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg md:text-xl text-ink-soft leading-relaxed">
            Series <span className="text-akira-cyan glow-cyan">recem-lancadas</span> e ainda
            publicando. Comece cedo, pegue o hype antes do anime,{" "}
            <span className="text-akira-pink glow-pink">flex no Twitter</span>. Os primeiros sempre
            sabem.
          </p>

          {/* Onomatopeias */}
          <div className="absolute top-12 right-6 md:right-12">
            <span className="onomatopeia text-3xl md:text-5xl">FRESH!</span>
          </div>
          <div className="absolute bottom-16 right-1/3 hidden md:block">
            <span className="jp text-akira-pink text-5xl font-black opacity-50 glow-pink">新!</span>
          </div>
        </div>
      </section>

      {/* GRID custom — com badge "Lancado em [year]" */}
      <main className="bg-zone-warm py-12 md:py-20 px-4 md:px-8 border-b border-[var(--line)] relative overflow-hidden">
        <div className="absolute inset-0 halftone opacity-20 pointer-events-none" aria-hidden />

        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <p className="eyebrow text-akira-cyan glow-cyan mb-2">Drop recente</p>
              <h2 className="display text-3xl md:text-5xl text-ink">JUST IN</h2>
            </div>
            <div className="text-right">
              <p className="display text-4xl text-akira-cyan glow-cyan">{cards.length}</p>
              <p className="eyebrow text-ink-muted">titulos novos</p>
            </div>
          </div>

          {cards.length === 0 ? (
            <div className="relative border-2 border-dashed border-[var(--line)] py-20 px-6 text-center overflow-hidden">
              <div className="absolute inset-0 halftone opacity-30" aria-hidden />
              <div className="relative">
                <p className="jp text-akira-cyan text-7xl font-black glow-cyan mb-4">空</p>
                <p className="display text-2xl text-ink mb-2">SEM NOVIDADES</p>
                <p className="text-sm text-ink-muted font-mono uppercase tracking-widest">
                  Jikan API offline. Volte em alguns minutos.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-7 justify-items-center">
              {cards.map(({ card, year, isFresh }) => {
                const color = getMangaColor(card.title);
                const colorSoft = getMangaColorAlpha(card.title, 0.65);
                return (
                  <Link
                    key={card.id}
                    href={`/manga/${card.id}`}
                    className="group block flex-shrink-0 card-lift w-52"
                  >
                    <div
                      className="p-1.5 border-2 border-ink shadow-hard group-hover:shadow-hard-lg transition-all relative"
                      style={{ background: `linear-gradient(135deg, ${color} 0%, ${colorSoft} 100%)` }}
                    >
                      <div className="relative h-72 overflow-hidden">
                        {card.cover && (
                          <Image
                            src={card.cover}
                            alt={card.title}
                            fill
                            sizes="(max-width: 768px) 50vw, 256px"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            unoptimized
                          />
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />

                        {/* Badge FRESH ou ANO */}
                        {isFresh ? (
                          <div className="absolute top-2 left-2 px-2 py-1 bg-akira-cyan text-bg text-[10px] font-mono font-bold uppercase tracking-widest shadow-hard">
                            FRESH
                          </div>
                        ) : year ? (
                          <div className="absolute top-2 left-2 px-2 py-1 bg-akira-yellow text-bg text-[10px] font-mono font-bold uppercase tracking-widest shadow-hard">
                            {year}
                          </div>
                        ) : null}

                        {card.score && (
                          <div className="absolute top-2 right-2 px-2 py-1 bg-black/85 backdrop-blur-sm border border-akira-cyan text-akira-cyan text-xs font-mono numerals">
                            ★ {card.score.toFixed(2)}
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 p-3 z-10">
                          <h3 className="display text-lg md:text-xl text-white leading-[0.95] line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                            {card.title}
                          </h3>
                          {card.titleJp && (
                            <p className="jp text-xs text-white/80 mt-1 line-clamp-1 drop-shadow">{card.titleJp}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 px-1">
                      <div className="flex items-baseline justify-between gap-2 text-xs">
                        <p className="text-ink-soft font-mono truncate flex-1">{card.author || "—"}</p>
                        <p className="text-ink-muted font-mono numerals shrink-0">
                          {year ? `${year}` : "ongoing"}
                        </p>
                      </div>
                      {(card.demographic || card.genres[0]) && (
                        <p className="mt-1 text-[10px] font-mono uppercase tracking-wider truncate">
                          {card.demographic && <span className="text-akira-yellow">{card.demographic}</span>}
                          {card.demographic && card.genres[0] && <span className="text-ink-muted"> · </span>}
                          {card.genres[0] && <span className="text-ink-muted">{card.genres.slice(0, 2).join(" · ")}</span>}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t-2 border-akira-cyan py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-3 text-xs font-mono text-ink-muted uppercase tracking-widest">
          <p>© 2026 · Akira Mangás · Novidades atualizadas a cada 1h</p>
          <p><span className="text-akira-cyan">FRESH!</span> Pegue antes do mainstream</p>
        </div>
      </footer>
    </>
  );
}
