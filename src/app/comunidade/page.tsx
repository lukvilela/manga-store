"use client";

import Header from "@/components/Header";
import ReviewCard from "@/components/reviews/ReviewCard";
import { useReviews } from "@/lib/reviews-store";

export default function ComunidadePage() {
  const { all, hydrated } = useReviews();
  const reviews = all().slice(0, 30);

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b-4 border-akira-red bg-bg">
        <div className="absolute inset-0 halftone-lg opacity-25 pointer-events-none" aria-hidden />
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(45deg, transparent 0, transparent 40px, rgba(193,18,31,0.18) 40px, rgba(193,18,31,0.18) 42px)",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 flex items-center justify-end pointer-events-none select-none overflow-hidden pr-4 md:pr-12" aria-hidden>
          <span
            className="jp font-black opacity-[0.07] leading-none whitespace-nowrap text-ink"
            style={{ fontSize: "clamp(8rem, 22vw, 24rem)" }}
          >
            コミュ
          </span>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-1.5 h-8 bg-akira-red shadow-[3px_3px_0_var(--ink)]" />
            <p className="eyebrow text-akira-red glow-red">
              Feed da quebrada / フィード
            </p>
          </div>
          <p className="jp text-3xl md:text-5xl text-akira-yellow glow-yellow mb-3">
            コミュニティ
          </p>
          <h1 className="display text-6xl md:text-8xl leading-[0.88] mb-6">
            COMUNIDADE
          </h1>
          <p className="max-w-2xl text-base md:text-lg text-ink-soft leading-relaxed">
            As ultimas opinioes que os leitores cuspiram. Reviews fresquinhas
            dos mangas mais comentados em Akira Mangás.
          </p>
        </div>
      </section>

      {/* Feed */}
      <section className="relative bg-bg py-16 px-4 md:px-8 overflow-hidden">
        <div className="absolute inset-0 halftone opacity-10 pointer-events-none" aria-hidden />

        <div className="relative max-w-4xl mx-auto">
          {/* Header da lista */}
          <div className="flex items-end justify-between gap-4 mb-8 pb-4 border-b border-[var(--line)]">
            <div>
              <p className="eyebrow text-akira-cyan mb-1">
                Ultimas reviews / 最新
              </p>
              <h2 className="display text-3xl md:text-4xl">
                Quem opinou agora?
              </h2>
            </div>
            <p className="numerals display text-3xl text-akira-yellow glow-yellow">
              {hydrated ? reviews.length : "—"}
            </p>
          </div>

          {!hydrated && (
            <div className="text-center py-16">
              <p className="eyebrow text-ink-muted animate-pulse">
                Carregando feed...
              </p>
            </div>
          )}

          {hydrated && reviews.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-[var(--line)]">
              <p className="jp text-7xl text-akira-red glow-red mb-4">空</p>
              <p className="display text-3xl mb-3">
                Silencio na rua
              </p>
              <p className="text-sm md:text-base text-ink-muted font-mono max-w-md mx-auto mb-6">
                Ninguem publicou review ainda. Bora abrir a comunidade?
                Vai num manga e cospe sua opiniao.
              </p>
              <a
                href="/populares"
                className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-akira-red text-akira-red hover:bg-akira-red hover:text-ink font-mono text-xs uppercase tracking-widest transition-all shadow-hard"
              >
                <span>Explorar populares</span>
                <span>→</span>
              </a>
            </div>
          )}

          {hydrated && reviews.length > 0 && (
            <div className="flex flex-col gap-5">
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} showMangaInfo />
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="relative border-t-4 border-akira-red py-12 px-4 md:px-8 overflow-hidden">
        <div className="absolute inset-0 halftone-lg opacity-25 pointer-events-none" aria-hidden />
        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-3 text-xs font-mono text-ink-muted uppercase tracking-widest">
          <p>© 2026 · Akira Mangás · Comunidade</p>
          <p>
            <span className="text-akira-red glow-red">DOKI!</span> Made in Brasil
          </p>
        </div>
      </footer>
    </>
  );
}
