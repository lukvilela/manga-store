"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "@/context/CartContext";
import CouponInput from "@/components/cart/CouponInput";
import { formatCouponLabel } from "@/lib/coupons-store";

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const FRETE_GRATIS_MIN = 150;
const FRETE_PADRAO = 15.9;

/**
 * Resumo do pedido (sticky sidebar).
 *
 * Frete: gratis se subtotal >= R$150 OU cupom de frete gratis, senao R$15,90.
 * Cupons: gerenciados pelo CartContext via CouponInput (lib/coupons-store).
 */
export default function CartSummary() {
  const { total, count, coupon, couponAmountOff, couponFreeShipping } = useCart();

  const subtotalComDesconto = Math.max(0, total - couponAmountOff);
  const fretePadraoAplicavel = subtotalComDesconto < FRETE_GRATIS_MIN;
  const frete = couponFreeShipping ? 0 : fretePadraoAplicavel ? FRETE_PADRAO : 0;
  const totalFinal = subtotalComDesconto + frete;

  const faltaFreteGratis = Math.max(0, FRETE_GRATIS_MIN - subtotalComDesconto);
  const progressoFrete = Math.min(100, (subtotalComDesconto / FRETE_GRATIS_MIN) * 100);

  const selos = useMemo(
    () => [
      { jp: "安全", label: "Compra segura · SSL", color: "text-akira-green" },
      { jp: "配送", label: "Frete rastreado", color: "text-akira-cyan" },
      { jp: "支払", label: "PIX · Cartao · Boleto", color: "text-akira-yellow" },
    ],
    []
  );

  return (
    <aside className="lg:sticky lg:top-24 h-fit space-y-4">
      {/* Resumo box */}
      <div className="panel-frame p-5 md:p-6">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <p className="eyebrow text-akira-cyan glow-cyan">明細 · RESUMO</p>
            <h2 className="display text-2xl text-ink mt-1">Seu Pedido</h2>
          </div>
          <span className="text-xs font-mono text-ink-muted numerals">
            {count} {count === 1 ? "item" : "itens"}
          </span>
        </div>

        {/* Barra frete gratis (so se cupom nao for free_shipping) */}
        {!couponFreeShipping && frete > 0 ? (
          <div className="mb-5 p-3 bg-bg border border-line">
            <p className="text-xs text-ink-soft mb-2">
              Falta <span className="text-akira-yellow font-bold numerals">{fmt.format(faltaFreteGratis)}</span> pra <span className="text-akira-yellow">FRETE GRATIS</span>
            </p>
            <div className="h-2 bg-bg-3 border border-line overflow-hidden">
              <div
                className="h-full bg-akira-yellow transition-all duration-500"
                style={{ width: `${progressoFrete}%`, boxShadow: "0 0 12px var(--akira-yellow)" }}
              />
            </div>
          </div>
        ) : (
          <div className="mb-5 p-3 bg-akira-green/10 border border-akira-green/40">
            <p className="text-xs text-akira-green font-mono uppercase tracking-widest flex items-center gap-2">
              <span className="pulse-neon">●</span> FRETE GRATIS DESBLOQUEADO
            </p>
          </div>
        )}

        {/* Linhas calculo */}
        <div className="space-y-2.5 text-sm">
          <Row label="Subtotal" value={fmt.format(total)} />
          {coupon && couponAmountOff > 0 && (
            <Row
              label={`Cupom ${coupon.code}`}
              value={`− ${fmt.format(couponAmountOff)}`}
              accent="green"
            />
          )}
          {coupon && couponFreeShipping && (
            <Row label={`Cupom ${coupon.code}`} value={formatCouponLabel(coupon)} accent="green" />
          )}
          <Row
            label="Frete"
            value={frete === 0 ? "Gratis" : fmt.format(frete)}
            accent={frete === 0 ? "green" : undefined}
          />
        </div>

        {/* Cupom */}
        <div className="mt-5 pt-5 border-t border-line">
          <CouponInput variant="full" />
        </div>

        {/* Total */}
        <div className="mt-6 pt-5 border-t-2 border-akira-red">
          <div className="flex items-baseline justify-between mb-1">
            <span className="eyebrow text-ink-muted">合計 · TOTAL</span>
            <span className="text-[10px] font-mono text-ink-muted">em ate 10x sem juros</span>
          </div>
          <p className="display text-5xl md:text-6xl text-akira-red glow-red numerals leading-none mt-2">
            {fmt.format(totalFinal)}
          </p>
          <p className="mt-2 text-xs font-mono text-ink-soft numerals">
            ou <span className="text-akira-cyan">{fmt.format(totalFinal * 0.95)}</span> no PIX (5% off)
          </p>
        </div>

        {/* CTA checkout */}
        <Link
          href="/checkout"
          className="mt-5 group relative inline-flex w-full items-center justify-center gap-3 px-6 py-4 bg-akira-red text-ink font-bold uppercase tracking-widest text-sm border-2 border-akira-red shadow-hard-lg hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[12px_12px_0_var(--ink)] transition-all shimmer box-glow-red"
        >
          <span>Ir pra Checkout</span>
          <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
        </Link>

        <Link
          href="/busca"
          className="mt-3 block text-center text-xs font-mono uppercase tracking-widest text-akira-cyan hover:text-akira-pink transition-colors"
        >
          ← Continuar comprando
        </Link>
      </div>

      {/* Selos confianca */}
      <div className="bg-bg-2 border-2 border-ink shadow-hard p-4 space-y-2.5">
        <p className="eyebrow text-ink-muted mb-3">保証 · GARANTIAS</p>
        {selos.map((s) => (
          <div key={s.label} className="flex items-center gap-3 text-xs">
            <span className={`jp text-base ${s.color}`}>{s.jp}</span>
            <span className="text-ink-soft font-mono">{s.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "green" | "red";
}) {
  const valueColor =
    accent === "green" ? "text-akira-green" : accent === "red" ? "text-akira-red" : "text-ink";
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-soft">{label}</span>
      <span className={`font-mono numerals ${valueColor}`}>{value}</span>
    </div>
  );
}
