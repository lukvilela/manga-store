"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

// Cupons mock — em prod isso vem do backend
const CUPONS: Record<string, { desconto: number; rotulo: string }> = {
  OTAKU10: { desconto: 0.1, rotulo: "10% OFF Otaku" },
  BAKA: { desconto: 0.05, rotulo: "5% OFF Baka" },
};

const FRETE_GRATIS_MIN = 150;
const FRETE_PADRAO = 15.9;

/**
 * Resumo do pedido (sticky sidebar).
 *
 * Frete: gratis se subtotal >= R$150, senao R$15,90.
 * Cupons aceitos: OTAKU10 (10% off), BAKA (5% off).
 * Calculos locais — useCart fornece total/count.
 */
export default function CartSummary() {
  const { total, count } = useCart();
  const [cupomInput, setCupomInput] = useState("");
  const [cupomAplicado, setCupomAplicado] = useState<keyof typeof CUPONS | null>(null);
  const [cupomErro, setCupomErro] = useState<string | null>(null);

  const cupomData = cupomAplicado ? CUPONS[cupomAplicado] : null;
  const desconto = cupomData ? total * cupomData.desconto : 0;
  const subtotalComDesconto = total - desconto;
  const frete = subtotalComDesconto >= FRETE_GRATIS_MIN ? 0 : FRETE_PADRAO;
  const totalFinal = subtotalComDesconto + frete;

  // Quanto falta pra frete gratis
  const faltaFreteGratis = Math.max(0, FRETE_GRATIS_MIN - subtotalComDesconto);
  const progressoFrete = Math.min(100, (subtotalComDesconto / FRETE_GRATIS_MIN) * 100);

  function aplicarCupom(e: React.FormEvent) {
    e.preventDefault();
    const code = cupomInput.trim().toUpperCase();
    if (!code) return;
    if (CUPONS[code]) {
      setCupomAplicado(code as keyof typeof CUPONS);
      setCupomErro(null);
      setCupomInput("");
    } else {
      setCupomErro("Cupom invalido");
      setCupomAplicado(null);
    }
  }

  function removerCupom() {
    setCupomAplicado(null);
    setCupomErro(null);
  }

  // Selos confianca
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

        {/* Barra frete gratis */}
        {frete > 0 ? (
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
          {cupomData && (
            <Row
              label={`Cupom ${cupomAplicado}`}
              value={`− ${fmt.format(desconto)}`}
              accent="green"
              extra={
                <button
                  type="button"
                  onClick={removerCupom}
                  className="ml-2 text-[10px] text-ink-muted hover:text-akira-red transition-colors"
                  aria-label="Remover cupom"
                >
                  [x]
                </button>
              }
            />
          )}
          <Row
            label="Frete"
            value={frete === 0 ? "Gratis" : fmt.format(frete)}
            accent={frete === 0 ? "green" : undefined}
          />
        </div>

        {/* Cupom */}
        <form onSubmit={aplicarCupom} className="mt-5 pt-5 border-t border-line">
          <label className="eyebrow text-ink-muted block mb-2">クーポン · CUPOM</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={cupomInput}
              onChange={(e) => {
                setCupomInput(e.target.value);
                if (cupomErro) setCupomErro(null);
              }}
              placeholder="OTAKU10"
              className="flex-1 bg-bg border-2 border-ink px-3 py-2 text-sm font-mono uppercase tracking-wider text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-akira-cyan focus:shadow-[0_0_0_3px_rgba(0,212,228,0.2)] transition-all"
              aria-label="Codigo do cupom"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-akira-cyan text-bg font-bold text-xs uppercase tracking-widest border-2 border-akira-cyan shadow-hard hover:bg-bg hover:text-akira-cyan transition-all"
            >
              Aplicar
            </button>
          </div>
          {cupomErro && (
            <p className="mt-2 text-xs text-akira-red font-mono uppercase tracking-wider">
              × {cupomErro}
            </p>
          )}
          {!cupomAplicado && !cupomErro && (
            <p className="mt-2 text-[10px] text-ink-muted font-mono">
              Tente <span className="text-akira-yellow">OTAKU10</span> ou <span className="text-akira-yellow">BAKA</span>
            </p>
          )}
        </form>

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
  extra,
}: {
  label: string;
  value: string;
  accent?: "green" | "red";
  extra?: React.ReactNode;
}) {
  const valueColor =
    accent === "green" ? "text-akira-green" : accent === "red" ? "text-akira-red" : "text-ink";
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-soft flex items-center">
        {label}
        {extra}
      </span>
      <span className={`font-mono numerals ${valueColor}`}>{value}</span>
    </div>
  );
}
