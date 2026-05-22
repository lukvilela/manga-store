"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import ReviewForm from "@/components/reviews/ReviewForm";
import { usePostPurchasePrompts, type PostPurchasePrompt } from "@/lib/post-purchase";

/**
 * Card destacado no topo de /conta/pedidos quando o user tem volumes ja
 * entregues que ainda nao foram avaliados. Ao clicar em "Avaliar", abre
 * modal com o ReviewForm reusado.
 */
export default function PostPurchaseReviewCTA() {
  const { prompts, hydrated } = usePostPurchasePrompts();
  const [active, setActive] = useState<PostPurchasePrompt | null>(null);

  // ESC + lock scroll quando modal aberto
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [active]);

  if (!hydrated || prompts.length === 0) return null;

  return (
    <>
      <section className="relative overflow-hidden panel-frame bg-[var(--bg-2)] p-5 md:p-6">
        <div className="absolute inset-0 halftone opacity-15 pointer-events-none" aria-hidden />
        <div className="relative">
          <div className="flex items-baseline justify-between gap-3 flex-wrap mb-4">
            <div>
              <p className="eyebrow !text-[var(--akira-yellow)]">Post-purchase // 評価</p>
              <h3 className="display text-2xl md:text-3xl text-[var(--ink)] mt-1">
                VOCES COMPRARAM, AGORA CONTEM COMO FOI!
              </h3>
              <p className="jp text-base text-[var(--ink-soft)] mt-0.5">読んだ感想を教えて</p>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
              {">"} {prompts.length} pendente{prompts.length > 1 ? "s" : ""} · +20 XP cada
            </span>
          </div>

          {/* Grid horizontal scroll */}
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
            {prompts.slice(0, 8).map((p) => (
              <button
                key={p.promptId}
                type="button"
                onClick={() => setActive(p)}
                className="group flex w-44 md:w-48 flex-shrink-0 snap-start flex-col gap-2 border-2 border-[var(--line)] bg-[var(--bg-3)] p-3 text-left transition-all hover:border-[var(--akira-yellow)] hover:shadow-hard"
              >
                <div className="relative h-56 w-full overflow-hidden border-2 border-[var(--ink)] shadow-hard">
                  <Image
                    src={p.coverImage}
                    alt={p.seriesTitle}
                    fill
                    sizes="(max-width: 768px) 50vw, 192px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-akira-yellow text-bg font-mono text-[9px] font-bold uppercase tracking-widest border-[1.5px] border-ink">
                    Vol.{String(p.volumeNumber).padStart(2, "0")}
                  </div>
                </div>
                <p className="display text-sm text-[var(--ink)] line-clamp-2 leading-tight">
                  {p.seriesTitle}
                </p>
                <span className="inline-flex items-center justify-between gap-2 border-2 border-[var(--akira-yellow)] bg-[var(--akira-yellow)]/10 px-2 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--akira-yellow)] group-hover:bg-[var(--akira-yellow)] group-hover:text-bg">
                  <span>Avaliar agora</span>
                  <span>→</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Modal com ReviewForm */}
      {active && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setActive(null)}
            className="absolute inset-0 cursor-default bg-black/75 backdrop-blur-sm"
          />
          <div className="relative z-10 my-8 w-full max-w-2xl">
            <div className="mb-2 flex items-center justify-between gap-3 border-2 border-ink bg-[var(--bg-3)] px-4 py-2 shadow-hard">
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--akira-yellow)]">
                Avaliando · {active.seriesTitle} Vol.{String(active.volumeNumber).padStart(2, "0")}
              </p>
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Fechar modal"
                className="border-2 border-[var(--line)] bg-[var(--bg-3)] px-2 py-0.5 font-mono text-xs text-[var(--ink-soft)] hover:border-[var(--akira-red)] hover:text-[var(--akira-red)]"
              >
                X
              </button>
            </div>
            <ReviewFormGameWrapper
              mangaId={active.mangaId}
              mangaTitle={active.seriesTitle}
              mangaCover={active.coverImage}
              onSubmitted={() => setActive(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Wrapper que escuta o evento de "review:change" pra fechar modal apos
 * publicacao + dispara gamification XP. Como ReviewForm so chama show()
 * + add() internamente, monitoramos o tamanho do store pra detectar post.
 */
function ReviewFormGameWrapper({
  mangaId,
  mangaTitle,
  mangaCover,
  onSubmitted,
}: {
  mangaId: string;
  mangaTitle: string;
  mangaCover: string;
  onSubmitted: () => void;
}) {
  useEffect(() => {
    const handler = () => {
      // dispara XP da review post-purchase (mesmo canal usado em add to cart)
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("gamification:cart-add", {
            detail: { kind: "review", amount: 20, points: 20 },
          })
        );
      }
      onSubmitted();
    };
    window.addEventListener("reviews:change", handler);
    return () => window.removeEventListener("reviews:change", handler);
  }, [onSubmitted]);

  return <ReviewForm mangaId={mangaId} mangaTitle={mangaTitle} mangaCover={mangaCover} />;
}
