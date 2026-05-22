"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useCart } from "@/context/CartContext";
import CartItemRow from "@/components/CartItemRow";
import CartSummary from "@/components/CartSummary";
import ShippingCalculator from "@/components/cart/ShippingCalculator";

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type Props = {
  emptyState: ReactNode;
};

/**
 * Cliente que orquestra empty vs items.
 *
 * Recebe emptyState pre-renderizado pelo Server Component pai
 * (mantem cache ISR das sugestoes intacto). Aguarda mount pra
 * evitar flash de empty state durante hydration do CartContext
 * (que le localStorage no client).
 */
export default function CartContent({ emptyState }: Props) {
  const { items, count, total } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-hydration: skeleton minimo (evita layout shift + empty flash)
  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
        <div className="h-12 w-64 bg-bg-2 animate-pulse mb-8" />
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 bg-bg-2 border-2 border-line animate-pulse" />
            ))}
          </div>
          <div className="lg:col-span-4">
            <div className="h-96 bg-bg-2 border-2 border-line animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (count === 0) {
    return <>{emptyState}</>;
  }

  return (
    <>
      <CartHero count={count} total={total} />

      <section className="relative max-w-7xl mx-auto px-4 md:px-8 pb-24">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Coluna principal — lista */}
          <div className="lg:col-span-8">
            {/* Header da lista */}
            <div className="flex items-center justify-between gap-4 mb-5 pb-3 border-b-2 border-akira-red">
              <div className="flex items-center gap-3">
                <span className="jp text-akira-red glow-red text-2xl">本</span>
                <h2 className="display text-2xl text-ink">
                  Volumes <span className="text-akira-red">·</span>{" "}
                  <span className="text-akira-cyan numerals">{count}</span>
                </h2>
              </div>
              <p className="hidden md:block eyebrow text-ink-muted">
                Reservados por 30 min
              </p>
            </div>

            <div className="space-y-4 stagger">
              {items.map((item) => (
                <CartItemRow key={item.volumeId} item={item} />
              ))}
            </div>

            {/* Calculadora de frete pre-checkout */}
            <div className="mt-8">
              <ShippingCalculator />
            </div>

            {/* Footer da lista — confianca extra */}
            <div className="mt-6 p-4 bg-bg-2 border-2 border-dashed border-line text-center">
              <p className="text-xs font-mono text-ink-muted">
                <span className="text-akira-cyan">★</span> Sua compra protegida.
                Devolucao gratuita em 7 dias <span className="text-akira-cyan">★</span>
              </p>
            </div>
          </div>

          {/* Sidebar — resumo */}
          <div className="lg:col-span-4">
            <CartSummary />
          </div>
        </div>
      </section>
    </>
  );
}

/**
 * Hero da pagina — vibe Akira com katakana de fundo + display gigante.
 */
function CartHero({ count, total }: { count: number; total: number }) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      {/* AKIRA katakana background */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden
      >
        <span
          className="jp text-akira-red opacity-[0.07] font-black leading-none"
          style={{ fontSize: "clamp(14rem, 36vw, 42rem)" }}
        >
          アキラ
        </span>
      </div>

      {/* Halftone overlay + trail */}
      <div className="absolute inset-0 halftone-lg opacity-30 pointer-events-none" aria-hidden />
      <div className="bike-streak" style={{ top: "40%" }} />
      <div className="akira-trail absolute inset-0 pointer-events-none" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-14 md:py-20">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-6 reveal">
          <span className="pulse-neon w-2 h-2 rounded-full bg-akira-red shadow-[0_0_12px_var(--akira-red)]" />
          <span className="eyebrow text-akira-cyan glow-cyan">
            CART · 買い物カゴ · ATIVO
          </span>
          <span className="hidden md:inline eyebrow text-ink-muted">·</span>
          <span className="hidden md:inline eyebrow text-akira-yellow glow-yellow">
            RESERVADO 30 MIN
          </span>
        </div>

        {/* Jp title */}
        <div className="reveal" style={{ animationDelay: "0.1s" }}>
          <span className="jp text-akira-red text-2xl md:text-4xl font-black glow-red">
            買い物カゴ
          </span>
        </div>

        {/* Display title */}
        <h1
          className="display text-[clamp(3rem,10vw,8rem)] mt-3 leading-[0.88] reveal"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="block">MEU</span>
          <span className="block text-akira-red glow-red action-lines pl-2">
            CARRINHO.
          </span>
        </h1>

        {/* Quick stats */}
        <div
          className="mt-8 flex flex-wrap items-end gap-6 md:gap-10 reveal"
          style={{ animationDelay: "0.4s" }}
        >
          <div>
            <p className="eyebrow text-ink-muted mb-1">件数 · ITENS</p>
            <p className="display text-4xl md:text-5xl text-ink numerals">
              {String(count).padStart(2, "0")}
            </p>
          </div>
          <div className="h-12 w-px bg-akira-red opacity-50" aria-hidden />
          <div>
            <p className="eyebrow text-ink-muted mb-1">合計 · SUBTOTAL</p>
            <p className="display text-4xl md:text-5xl text-akira-cyan glow-cyan numerals">
              {fmt.format(total)}
            </p>
          </div>
          <div className="hidden md:block h-12 w-px bg-akira-red opacity-50" aria-hidden />
          <div className="hidden md:block">
            <p className="eyebrow text-ink-muted mb-1">状態 · STATUS</p>
            <p className="text-sm font-mono uppercase tracking-widest text-akira-green flex items-center gap-2">
              <span className="pulse-neon">●</span> Pronto pra checkout
            </p>
          </div>
        </div>

        {/* Onomatopeia decorativa */}
        <span className="onomatopeia text-2xl md:text-4xl absolute top-8 right-4 md:right-12 reveal" style={{ animationDelay: "0.6s" }}>
          GO!
        </span>
      </div>
    </section>
  );
}
