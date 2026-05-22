"use client";

import Image from "next/image";
import { useCart } from "@/context/CartContext";

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type Props = {
  shipping?: number;
  discount?: number;
  paymentLabel?: string;
};

export default function OrderSummary({ shipping = 0, discount = 0, paymentLabel }: Props) {
  const { items, total, count } = useCart();
  const totalFinal = total + shipping - discount;

  return (
    <aside className="sticky top-24 self-start">
      <div className="panel-frame relative overflow-hidden">
        {/* Header */}
        <div className="relative bg-[var(--akira-red)] px-5 py-4">
          <div className="absolute inset-0 halftone opacity-30" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="eyebrow !text-[var(--ink)] opacity-80">Order // 注文</p>
              <h3 className="display text-2xl text-[var(--ink)]">RESUMO</h3>
            </div>
            <span className="jp text-xl text-[var(--ink)]">{count}</span>
          </div>
        </div>

        {/* Items */}
        <div className="max-h-72 overflow-y-auto no-scrollbar border-b border-[var(--line)] bg-[var(--bg-2)] px-5 py-4">
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.volumeId} className="flex items-center gap-3">
                <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden border-2 border-[var(--ink)] shadow-hard">
                  <Image src={item.coverImage} alt={item.seriesTitle} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-bold text-[var(--ink)]">{item.seriesTitle}</p>
                  <p className="font-mono text-[11px] text-[var(--ink-muted)]">
                    VOL.{String(item.volumeNumber).padStart(2, "0")} · QTD {item.quantity}
                  </p>
                </div>
                <p className="font-mono text-sm font-bold text-[var(--ink)] numerals">
                  {fmt.format(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Totals */}
        <div className="space-y-2 bg-[var(--bg-2)] px-5 py-4 text-sm">
          <div className="flex justify-between text-[var(--ink-soft)]">
            <span>Subtotal</span>
            <span className="font-mono numerals">{fmt.format(total)}</span>
          </div>
          <div className="flex justify-between text-[var(--ink-soft)]">
            <span>Frete</span>
            {shipping === 0 ? (
              <span className="font-bold text-[var(--akira-green)] glow-green text-xs">GRATIS</span>
            ) : (
              <span className="font-mono numerals">{fmt.format(shipping)}</span>
            )}
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-[var(--akira-cyan)]">
              <span>Desconto {paymentLabel ? `(${paymentLabel})` : ""}</span>
              <span className="font-mono numerals">- {fmt.format(discount)}</span>
            </div>
          )}

          <div className="mt-3 border-t-2 border-dashed border-[var(--line)] pt-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="eyebrow">Total // 合計</p>
                <p className="display text-3xl text-[var(--akira-red)] glow-red numerals">
                  {fmt.format(totalFinal)}
                </p>
              </div>
              <span className="onomatopeia text-xs">PAY!</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-[var(--bg-3)] px-5 py-3">
          <p className="font-mono text-[10px] text-[var(--ink-muted)] leading-relaxed">
            SISTEMA SEGURO · ENTREGA RASTREADA · TROCA EM 7 DIAS
          </p>
        </div>
      </div>
    </aside>
  );
}
