import Link from "next/link";
import MangaCard from "@/components/MangaCard";
import type { MangaCardData } from "@/lib/manga-api";

type Props = {
  sugestoes: MangaCardData[];
};

/**
 * Empty state do carrinho.
 *
 * Recebe sugestoes pre-fetched do Server Component pai (page.tsx),
 * permitindo cache ISR sem virar client-only.
 */
export default function EmptyCart({ sugestoes }: Props) {
  const cards = sugestoes;

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 halftone-lg opacity-30 pointer-events-none" aria-hidden />
      <div className="absolute inset-0 akira-trail pointer-events-none" aria-hidden />

      <div className="relative max-w-5xl mx-auto px-4 md:px-8 py-20 md:py-28 text-center">
        {/* 空 gigante */}
        <div className="relative inline-block">
          <span
            className="jp display text-akira-red glow-red leading-none block"
            style={{ fontSize: "clamp(10rem, 28vw, 22rem)" }}
            aria-hidden
          >
            空
          </span>
          {/* Onomatopeia decorativa */}
          <span className="onomatopeia text-xl md:text-3xl absolute -top-2 -right-6 md:-right-12 rotate-12">
            VAZIO!
          </span>
        </div>

        <div className="mt-8 reveal">
          <p className="eyebrow text-akira-cyan glow-cyan mb-3">KARA · EMPTY · 00.00</p>
          <h2 className="display text-4xl md:text-6xl text-ink leading-[0.95]">
            SEU CARRINHO ESTA <span className="text-akira-red glow-red">VAZIO</span>
          </h2>
          <p className="mt-5 text-ink-soft text-base md:text-lg max-w-xl mx-auto">
            Sem volumes reservados ainda. Que tal explorar o catalogo
            e comecar sua coleção?
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/busca"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-akira-red text-ink font-bold uppercase tracking-widest text-sm border-2 border-akira-red shadow-hard-lg hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[12px_12px_0_var(--ink)] transition-all shimmer"
          >
            <span>Voltar ao Catalogo</span>
            <span className="group-hover:translate-x-1 transition-transform text-xl">→</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-3 px-6 py-3 border-2 border-akira-cyan text-akira-cyan font-bold uppercase tracking-widest text-xs hover:bg-akira-cyan hover:text-bg transition-all"
          >
            Home
          </Link>
        </div>

        {cards.length > 0 && (
          <div className="mt-24">
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="h-px flex-1 bg-akira-red opacity-40" />
              <span className="eyebrow text-akira-yellow glow-yellow whitespace-nowrap">
                オススメ · PRA VOCE COMECAR
              </span>
              <span className="h-px flex-1 bg-akira-red opacity-40" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 stagger">
              {cards.map((m) => (
                <div key={m.id} className="flex justify-center">
                  <MangaCard manga={m} size="sm" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
