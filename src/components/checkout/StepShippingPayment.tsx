"use client";

import { useMemo } from "react";

export type ShippingMethod = "PAC" | "SEDEX" | "PICKUP";
export type PaymentMethod = "PIX" | "CREDIT_CARD" | "BOLETO";

export type ShippingPaymentData = {
  shipping: ShippingMethod;
  payment: PaymentMethod;
  installments: number;
};

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const SHIPPING_OPTIONS: { value: ShippingMethod; label: string; kanji: string; price: number; eta: string }[] = [
  { value: "PAC", label: "PAC Correios", kanji: "便", price: 15.9, eta: "7-10 dias uteis" },
  { value: "SEDEX", label: "SEDEX Expresso", kanji: "急", price: 24.9, eta: "2-4 dias uteis" },
  { value: "PICKUP", label: "Retirada na loja", kanji: "店", price: 0, eta: "Disponivel em 24h" },
];

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; kanji: string; tag: string; tagColor: string }[] = [
  { value: "PIX", label: "PIX", kanji: "即", tag: "-5%", tagColor: "var(--akira-cyan)" },
  { value: "CREDIT_CARD", label: "Cartao de credito", kanji: "卡", tag: "12x", tagColor: "var(--akira-yellow)" },
  { value: "BOLETO", label: "Boleto bancario", kanji: "票", tag: "-3%", tagColor: "var(--akira-cyan)" },
];

type Props = {
  value: ShippingPaymentData;
  onChange: (data: ShippingPaymentData) => void;
  subtotal: number;
  onNext: () => void;
  onBack: () => void;
};

export default function StepShippingPayment({ value, onChange, subtotal, onNext, onBack }: Props) {
  const shippingPrice = useMemo(
    () => SHIPPING_OPTIONS.find((s) => s.value === value.shipping)?.price ?? 0,
    [value.shipping]
  );

  const discount =
    value.payment === "PIX" ? subtotal * 0.05 : value.payment === "BOLETO" ? subtotal * 0.03 : 0;
  const totalFinal = subtotal + shippingPrice - discount;
  const installmentValue = totalFinal / value.installments;

  return (
    <div className="space-y-8">
      <header className="border-b-2 border-[var(--line)] pb-6">
        <p className="eyebrow">Step 03 // 第三段</p>
        <div className="mt-2 flex items-baseline gap-4">
          <span className="display text-7xl text-[var(--akira-red)] glow-red leading-none">03</span>
          <div>
            <h2 className="display text-4xl text-[var(--ink)] leading-none">FRETE & PAGAMENTO</h2>
            <p className="jp mt-1 text-lg text-[var(--ink-soft)]">送料・支払い</p>
          </div>
        </div>
        <p className="mt-3 text-[var(--ink-muted)] text-sm">
          Escolha como recebe e como paga.
        </p>
      </header>

      {/* Frete */}
      <section>
        <div className="mb-4 flex items-baseline gap-3">
          <span className="display text-2xl text-[var(--ink)]">FRETE</span>
          <span className="jp text-base text-[var(--akira-cyan)]">送料</span>
          <div className="flex-1 border-b border-dashed border-[var(--line)]" />
        </div>
        <div className="grid gap-3">
          {SHIPPING_OPTIONS.map((opt) => {
            const active = value.shipping === opt.value;
            return (
              <label
                key={opt.value}
                className={`group relative flex cursor-pointer items-center gap-4 border-[2px] p-4 transition-all ${
                  active
                    ? "border-[var(--akira-red)] bg-[var(--bg-3)] shadow-[0_0_16px_rgba(193,18,31,0.3)]"
                    : "border-[var(--line)] bg-[var(--bg-2)] hover:border-[var(--ink-soft)]"
                }`}
              >
                <input
                  type="radio"
                  name="shipping"
                  className="sr-only"
                  checked={active}
                  onChange={() => onChange({ ...value, shipping: opt.value })}
                />
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center border-[2px] jp text-xl ${
                    active
                      ? "border-[var(--akira-red)] bg-[var(--akira-red)] text-[var(--ink)]"
                      : "border-[var(--line)] bg-[var(--bg-3)] text-[var(--ink-muted)]"
                  }`}
                >
                  {opt.kanji}
                </div>
                <div className="flex-1">
                  <p className="display text-lg text-[var(--ink)]">{opt.label}</p>
                  <p className="font-mono text-xs text-[var(--ink-muted)] uppercase">{opt.eta}</p>
                </div>
                <div className="text-right">
                  {opt.price === 0 ? (
                    <span className="display text-xl text-[var(--akira-green)] glow-green">GRATIS</span>
                  ) : (
                    <span className="display text-xl text-[var(--ink)] numerals">{fmt.format(opt.price)}</span>
                  )}
                </div>
                {active && (
                  <span className="pointer-events-none absolute -right-2 -top-2 onomatopeia text-[10px]">OK!</span>
                )}
              </label>
            );
          })}
        </div>
      </section>

      {/* Pagamento */}
      <section>
        <div className="mb-4 flex items-baseline gap-3">
          <span className="display text-2xl text-[var(--ink)]">PAGAMENTO</span>
          <span className="jp text-base text-[var(--akira-pink)]">支払い</span>
          <div className="flex-1 border-b border-dashed border-[var(--line)]" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {PAYMENT_OPTIONS.map((opt) => {
            const active = value.payment === opt.value;
            return (
              <label
                key={opt.value}
                className={`group relative flex cursor-pointer flex-col items-center gap-2 border-[2px] p-5 text-center transition-all ${
                  active
                    ? "border-[var(--akira-red)] bg-[var(--bg-3)] shadow-[0_0_16px_rgba(193,18,31,0.3)]"
                    : "border-[var(--line)] bg-[var(--bg-2)] hover:border-[var(--ink-soft)]"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  className="sr-only"
                  checked={active}
                  onChange={() => onChange({ ...value, payment: opt.value, installments: 1 })}
                />
                <span
                  className="absolute right-2 top-2 px-2 py-0.5 font-mono text-[10px] font-bold"
                  style={{ background: opt.tagColor, color: "var(--bg)" }}
                >
                  {opt.tag}
                </span>
                <span
                  className={`jp text-3xl ${active ? "text-[var(--akira-red)] glow-red" : "text-[var(--ink-muted)]"}`}
                >
                  {opt.kanji}
                </span>
                <p className="display text-base text-[var(--ink)]">{opt.label}</p>
              </label>
            );
          })}
        </div>

        {/* Parcelamento (so cartao) */}
        {value.payment === "CREDIT_CARD" && (
          <div className="mt-5 border-[2px] border-dashed border-[var(--akira-yellow)] bg-[var(--bg-2)] p-4">
            <div className="mb-3 flex items-baseline gap-2">
              <span className="eyebrow !text-[var(--akira-yellow)]">Parcelamento</span>
              <span className="jp text-xs text-[var(--ink-muted)]">分割</span>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => {
                const active = value.installments === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onChange({ ...value, installments: n })}
                    className={`border-[2px] py-2 font-mono text-xs font-bold transition ${
                      active
                        ? "border-[var(--akira-yellow)] bg-[var(--akira-yellow)] text-[var(--bg)]"
                        : "border-[var(--line)] bg-[var(--bg-3)] text-[var(--ink-soft)] hover:border-[var(--akira-yellow)]"
                    }`}
                  >
                    {n}x
                  </button>
                );
              })}
            </div>
            <p className="mt-3 font-mono text-xs text-[var(--ink-muted)] numerals">
              {">"} {value.installments}x de <span className="text-[var(--ink)] font-bold">{fmt.format(installmentValue)}</span> sem juros
            </p>
          </div>
        )}
      </section>

      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
}

function NavButtons({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center justify-between pt-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 border-[2px] border-[var(--ink)] bg-transparent px-5 py-3 text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--bg)]"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="square" d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        <span className="font-mono text-xs uppercase tracking-widest">Voltar</span>
      </button>
      <button
        type="button"
        onClick={onNext}
        className="shimmer group relative inline-flex items-center gap-3 border-[3px] border-[var(--ink)] bg-[var(--akira-red)] px-8 py-4 text-[var(--ink)] shadow-hard transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
      >
        <span className="display text-lg uppercase tracking-wider">Revisar</span>
        <span className="jp text-base">次</span>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="square" d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}
