/**
 * Pagina de comparacao Vs. Server component.
 *
 * Sem query: tela inicial com 2 inputs (ComparePicker client).
 * Com ?a=ID&b=ID: split-screen 50/50 com stats comparison.
 *
 * Jikan rate limit: 3 req/s — fazemos 2 requests em paralelo (Promise.all OK).
 */

import Header from "@/components/Header";
import MangaSlot from "@/components/compare/MangaSlot";
import VsDivider from "@/components/compare/VsDivider";
import StatCompare, { countWins } from "@/components/compare/StatCompare";
import ComparePicker from "@/components/compare/ComparePicker";
import CompareActions from "@/components/compare/CompareActions";
import { getMangaById } from "@/lib/manga-api";

export const revalidate = 600;

type SP = { a?: string; b?: string };

export default async function CompararPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const { a, b } = await searchParams;
  const aId = a ? parseInt(a) : null;
  const bId = b ? parseInt(b) : null;

  // Tela inicial — sem IDs validos
  if (!aId || !bId || isNaN(aId) || isNaN(bId)) {
    return (
      <>
        <Header />
        <section className="relative overflow-hidden border-b border-[var(--line)] bg-zone-cool">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" aria-hidden>
            <span
              className="jp text-akira-yellow opacity-[0.05] font-black leading-none"
              style={{ fontSize: "clamp(15rem, 35vw, 40rem)" }}
            >
              対決
            </span>
          </div>
          <div className="absolute inset-0 halftone opacity-30 pointer-events-none" aria-hidden />
          <ComparePicker />
        </section>
        <footer className="border-t-2 border-akira-red py-8 px-4 md:px-8">
          <div className="max-w-7xl mx-auto text-center text-xs font-mono text-ink-muted uppercase tracking-widest">
            <p>© 2026 · Akira Mangás · <span className="text-akira-red">DOKI!</span> Made in Brasil</p>
          </div>
        </footer>
      </>
    );
  }

  // Carrega os 2 em paralelo
  const [mangaA, mangaB] = await Promise.all([getMangaById(aId), getMangaById(bId)]);

  if (!mangaA || !mangaB) {
    return (
      <>
        <Header />
        <div className="max-w-3xl mx-auto py-20 px-6 text-center">
          <p className="jp text-akira-red text-7xl font-black glow-red mb-4">空</p>
          <p className="display text-2xl text-ink mb-4">
            Nao encontramos {!mangaA ? "o primeiro" : "o segundo"} manga
          </p>
          <p className="text-sm text-ink-muted font-mono mb-6">
            IDs invalidos ou Jikan offline. Tente outros.
          </p>
          <CompareActions aId={aId} bId={bId} />
        </div>
      </>
    );
  }

  // Stats comparativas — best of 5
  const comparisons = [
    { a: mangaA.score, b: mangaB.score, lowerIsBetter: false },
    { a: mangaA.rank, b: mangaB.rank, lowerIsBetter: true },
    { a: mangaA.popularity, b: mangaB.popularity, lowerIsBetter: true },
    { a: mangaA.volumes, b: mangaB.volumes, lowerIsBetter: false },
    { a: mangaA.chapters, b: mangaB.chapters, lowerIsBetter: false },
  ];
  const { aWins, bWins, ties } = countWins(comparisons);
  const aIsWinner = aWins > bWins;
  const bIsWinner = bWins > aWins;

  return (
    <>
      <Header />

      <main className="bg-bg border-b border-[var(--line)]">
        {/* Hero compacto */}
        <section className="relative overflow-hidden border-b border-[var(--line)] bg-zone-warm py-10 md:py-14 px-4 md:px-8">
          <div className="absolute inset-0 halftone opacity-20 pointer-events-none" aria-hidden />
          <div className="relative max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="block w-1.5 h-7 bg-akira-yellow shadow-[3px_3px_0_var(--ink)]" />
              <span className="eyebrow text-akira-yellow glow-yellow">VS BATTLE / 対決</span>
              <span className="block w-1.5 h-7 bg-akira-yellow shadow-[3px_3px_0_var(--ink)]" />
            </div>
            <h1 className="display text-3xl md:text-5xl leading-[0.95]">
              <span className="text-akira-red glow-red">{mangaA.title}</span>
              <span className="text-akira-yellow mx-3">vs</span>
              <span className="text-akira-cyan glow-cyan">{mangaB.title}</span>
            </h1>
          </div>
        </section>

        {/* Split screen 50/50 */}
        <section className="px-4 md:px-8 py-8 md:py-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch gap-4">
            <MangaSlot manga={mangaA} side="a" winner={aIsWinner} />
            <VsDivider />
            <MangaSlot manga={mangaB} side="b" winner={bIsWinner} />
          </div>
        </section>

        {/* Stats comparison */}
        <section className="px-4 md:px-8 py-10 md:py-16 bg-zone-cool border-t border-[var(--line)] relative overflow-hidden">
          <div className="absolute inset-0 halftone opacity-15 pointer-events-none" aria-hidden />
          <div className="relative max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <span className="block w-1.5 h-7 bg-akira-cyan shadow-[3px_3px_0_var(--ink)]" />
              <p className="eyebrow text-akira-cyan glow-cyan">Stats Battle / 戦闘力</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <StatCompare
                label="Score"
                jp="評価"
                a={mangaA.score}
                b={mangaB.score}
                format={(n) => `★ ${n.toFixed(2)}`}
              />
              <StatCompare
                label="Rank (menor = melhor)"
                jp="順位"
                a={mangaA.rank}
                b={mangaB.rank}
                format={(n) => `#${n}`}
                lowerIsBetter
              />
              <StatCompare
                label="Popularidade (menor = melhor)"
                jp="人気"
                a={mangaA.popularity}
                b={mangaB.popularity}
                format={(n) => `#${n}`}
                lowerIsBetter
              />
              <StatCompare
                label="Volumes"
                jp="巻数"
                a={mangaA.volumes}
                b={mangaB.volumes}
                format={(n) => `${n} vols`}
              />
              <StatCompare
                label="Capitulos"
                jp="章"
                a={mangaA.chapters}
                b={mangaB.chapters}
                format={(n) => `${n} caps`}
              />
            </div>

            {/* Placar final */}
            <div className="border-2 border-ink bg-bg-2 p-6 text-center mb-8 relative overflow-hidden">
              <div className="absolute inset-0 halftone opacity-10 pointer-events-none" aria-hidden />
              <div className="relative">
                <p className="eyebrow text-ink-muted mb-3">Placar Final / 最終得点</p>
                <div className="flex items-center justify-center gap-6 md:gap-10 mb-4">
                  <div className="text-center">
                    <p className={`display text-5xl md:text-7xl ${aIsWinner ? "text-akira-green glow-cyan" : "text-akira-red"}`}>
                      {aWins}
                    </p>
                    <p className="text-xs font-mono text-akira-red uppercase tracking-widest mt-1">
                      A
                    </p>
                  </div>
                  <span className="display text-3xl text-ink-muted">×</span>
                  <div className="text-center">
                    <p className={`display text-5xl md:text-7xl ${bIsWinner ? "text-akira-green glow-cyan" : "text-akira-cyan"}`}>
                      {bWins}
                    </p>
                    <p className="text-xs font-mono text-akira-cyan uppercase tracking-widest mt-1">
                      B
                    </p>
                  </div>
                </div>
                {ties > 0 && (
                  <p className="text-xs font-mono text-ink-muted mb-3">
                    {ties} empate{ties > 1 ? "s" : ""} (dados faltando)
                  </p>
                )}
                <p className="display text-2xl md:text-3xl">
                  {aIsWinner && (
                    <span className="text-akira-red glow-red">{mangaA.title} VENCE!</span>
                  )}
                  {bIsWinner && (
                    <span className="text-akira-cyan glow-cyan">{mangaB.title} VENCE!</span>
                  )}
                  {!aIsWinner && !bIsWinner && (
                    <span className="text-akira-yellow glow-yellow">EMPATE! / 引き分け</span>
                  )}
                </p>
              </div>
            </div>

            <CompareActions aId={aId} bId={bId} />
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-akira-red py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center text-xs font-mono text-ink-muted uppercase tracking-widest">
          <p>© 2026 · Akira Mangás · <span className="text-akira-red">DOKI!</span> Made in Brasil</p>
        </div>
      </footer>
    </>
  );
}
