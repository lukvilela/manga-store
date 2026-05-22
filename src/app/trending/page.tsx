import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import MangaGrid from "@/components/MangaGrid";
import { getTrendingManga, toCardData } from "@/lib/manga-api";
import { getMangaColor, getMangaColorAlpha } from "@/lib/manga-colors";

export const revalidate = 3600;

export default async function TrendingPage() {
  const mangas = await getTrendingManga(30);
  const cards = mangas.map(toCardData);
  const top3 = cards.slice(0, 3);
  const rest = cards.slice(3);

  return (
    <>
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[var(--line)] bg-zone-red">
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden
        >
          <span
            className="jp text-akira-red opacity-[0.07] font-black leading-none"
            style={{ fontSize: "clamp(18rem, 42vw, 50rem)" }}
          >
            話題
          </span>
        </div>
        <div className="absolute inset-0 halftone-lg opacity-30 pointer-events-none" aria-hidden />
        <div className="bike-streak" style={{ top: "20%" }} />
        <div className="bike-streak" style={{ top: "60%", animationDelay: "1.5s" }} />
        <div className="bike-streak" style={{ top: "80%", animationDelay: "3s" }} />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
          <div className="flex items-center gap-3 mb-6">
            <span className="pulse-neon w-2 h-2 rounded-full bg-akira-red shadow-[0_0_12px_var(--akira-red)]" />
            <span className="eyebrow text-akira-red glow-red">LIVE · EM ALTA AGORA</span>
            <span className="hidden md:inline eyebrow text-ink-muted">·</span>
            <span className="hidden md:inline eyebrow text-akira-yellow glow-yellow">PUBLICANDO</span>
          </div>

          <div className="mb-3">
            <span className="jp text-akira-red text-3xl md:text-5xl font-black glow-red">話題沸騰</span>
          </div>

          <h1 className="display text-[clamp(3rem,11vw,9rem)] leading-[0.85]">
            <span className="block">EM</span>
            <span className="block text-akira-red glow-red action-lines pl-2">ALTA.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg md:text-xl text-ink-soft leading-relaxed">
            O que esta <span className="text-akira-red glow-red">fervendo</span> no Japao agora.
            Series <span className="text-akira-yellow">em publicacao</span> com score acima de 7.0,
            ordenadas por aclamacao. Atualizado direto da{" "}
            <span className="text-akira-cyan glow-cyan">MyAnimeList</span>.
          </p>

          {/* Onomatopeias */}
          <div className="absolute top-12 right-6 md:right-12">
            <span className="onomatopeia text-3xl md:text-5xl">BOOM!</span>
          </div>
          <div className="absolute bottom-20 right-1/4 hidden md:block">
            <span className="jp text-akira-yellow text-5xl font-black opacity-50 glow-yellow">爆!</span>
          </div>
        </div>
      </section>

      {/* TOP 3 SPOTLIGHT */}
      {top3.length > 0 && (
        <section className="bg-zone-warm py-12 md:py-16 px-4 md:px-8 border-b border-[var(--line)] relative overflow-hidden">
          <div className="absolute inset-0 halftone opacity-15 pointer-events-none" aria-hidden />

          <div className="relative max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <span className="block w-1.5 h-8 bg-akira-red shadow-[3px_3px_0_var(--ink)]" />
              <p className="eyebrow text-akira-red glow-red">TOP 3 / 注目作</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {top3.map((m, i) => {
                const color = getMangaColor(m.title);
                const colorSoft = getMangaColorAlpha(m.title, 0.5);
                return (
                  <Link
                    key={m.id}
                    href={`/manga/${m.id}`}
                    className="group relative block card-lift"
                  >
                    <div
                      className="relative aspect-[3/4] border-2 border-ink shadow-hard-lg overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${color} 0%, ${colorSoft} 100%)` }}
                    >
                      {m.cover && (
                        <Image
                          src={m.cover}
                          alt={m.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          unoptimized
                        />
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black via-black/80 to-transparent" />

                      {/* Rank gigante */}
                      <div className="absolute top-3 left-3 display text-akira-red glow-red text-6xl md:text-7xl leading-none drop-shadow-[2px_2px_0_var(--ink)]">
                        {i + 1}
                      </div>

                      {/* Badge HOT */}
                      <div className="absolute top-3 right-3 px-2 py-1 bg-akira-red text-ink text-[10px] font-mono font-bold uppercase tracking-widest shadow-hard">
                        EM ALTA
                      </div>

                      {/* Title */}
                      <div className="absolute inset-x-0 bottom-0 p-5 z-10">
                        <p className="eyebrow text-akira-yellow glow-yellow mb-1">PUBLICANDO</p>
                        <h3 className="display text-2xl md:text-3xl text-white leading-[0.95] line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                          {m.title}
                        </h3>
                        {m.titleJp && (
                          <p className="jp text-sm text-white/80 mt-2 line-clamp-1 drop-shadow">{m.titleJp}</p>
                        )}
                        <div className="mt-3 flex items-center gap-3 text-xs font-mono">
                          <span className="text-akira-cyan">★ {m.score?.toFixed(2) ?? "—"}</span>
                          {m.demographic && <span className="text-akira-yellow">{m.demographic}</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* GRID RESTANTE */}
      <main className="bg-zone-warm py-12 md:py-20 px-4 md:px-8 border-b border-[var(--line)] relative overflow-hidden">
        <div className="absolute inset-0 halftone opacity-20 pointer-events-none" aria-hidden />

        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <p className="eyebrow text-akira-cyan glow-cyan mb-2">Continuacao</p>
              <h2 className="display text-3xl md:text-5xl text-ink">+ EM ALTA</h2>
            </div>
            <div className="text-right">
              <p className="display text-4xl text-akira-red glow-red">{rest.length}</p>
              <p className="eyebrow text-ink-muted">series</p>
            </div>
          </div>

          <MangaGrid mangas={rest} emptyText="Nada fervendo agora. Volte em 1h." />
        </div>
      </main>

      <footer className="border-t-2 border-akira-red py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-3 text-xs font-mono text-ink-muted uppercase tracking-widest">
          <p>© 2026 · Akira Mangás · Trending recalibrado a cada 1h</p>
          <p><span className="text-akira-red">BOOM!</span> Live from Tokyo</p>
        </div>
      </footer>
    </>
  );
}
