"use client";

import type { IdentificationData } from "./StepIdentification";
import type { AddressData } from "./StepAddress";
import type { ShippingPaymentData } from "./StepShippingPayment";

type Props = {
  identification: IdentificationData;
  address: AddressData;
  shippingPayment: ShippingPaymentData;
  shippingPrice: number;
  discount: number;
  totalFinal: number;
  submitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
};

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const shippingLabel: Record<ShippingPaymentData["shipping"], string> = {
  PAC: "PAC Correios (7-10 dias)",
  SEDEX: "SEDEX Expresso (2-4 dias)",
  PICKUP: "Retirada na loja",
};

const paymentLabel: Record<ShippingPaymentData["payment"], string> = {
  PIX: "PIX (5% desconto)",
  CREDIT_CARD: "Cartao de credito",
  BOLETO: "Boleto bancario (3% desconto)",
};

export default function StepConfirmation({
  identification,
  address,
  shippingPayment,
  shippingPrice,
  discount,
  totalFinal,
  submitting,
  onBack,
  onSubmit,
}: Props) {
  return (
    <div className="space-y-8">
      <header className="border-b-2 border-[var(--line)] pb-6">
        <p className="eyebrow">Step 04 // 第四段</p>
        <div className="mt-2 flex items-baseline gap-4">
          <span className="display text-7xl text-[var(--akira-red)] glow-red leading-none">04</span>
          <div>
            <h2 className="display text-4xl text-[var(--ink)] leading-none">CONFIRMACAO</h2>
            <p className="jp mt-1 text-lg text-[var(--ink-soft)]">確認</p>
          </div>
        </div>
        <p className="mt-3 text-[var(--ink-muted)] text-sm">
          Revise os dados antes de finalizar.
        </p>
      </header>

      <div className="space-y-5">
        {/* Identificacao */}
        <Block kanji="認" title="Identificacao">
          <p className="font-mono text-sm text-[var(--ink)]">
            <span className="text-[var(--ink-muted)]">Nome:</span> {identification.name || "-"}
          </p>
          <p className="font-mono text-sm text-[var(--ink)]">
            <span className="text-[var(--ink-muted)]">Email:</span> {identification.email || "-"}
          </p>
          <p className="font-mono text-[10px] text-[var(--ink-muted)] uppercase">
            {identification.mode === "logged" ? "> sessao logada" : "> checkout convidado"}
          </p>
        </Block>

        {/* Endereco */}
        <Block kanji="宅" title="Entrega">
          <p className="font-mono text-sm text-[var(--ink)]">
            {address.street}, {address.number}
            {address.complement && ` - ${address.complement}`}
          </p>
          <p className="font-mono text-sm text-[var(--ink-soft)]">
            {address.district} · {address.city} / {address.state}
          </p>
          <p className="font-mono text-xs text-[var(--ink-muted)]">CEP {address.cep}</p>
        </Block>

        {/* Frete */}
        <Block kanji="便" title="Frete">
          <p className="font-mono text-sm text-[var(--ink)]">{shippingLabel[shippingPayment.shipping]}</p>
          <p className="font-mono text-sm text-[var(--akira-cyan)] numerals">
            {shippingPrice === 0 ? "GRATIS" : fmt.format(shippingPrice)}
          </p>
        </Block>

        {/* Pagamento */}
        <Block kanji="払" title="Pagamento">
          <p className="font-mono text-sm text-[var(--ink)]">{paymentLabel[shippingPayment.payment]}</p>
          {shippingPayment.payment === "CREDIT_CARD" && (
            <p className="font-mono text-sm text-[var(--akira-yellow)] numerals">
              {shippingPayment.installments}x de {fmt.format(totalFinal / shippingPayment.installments)} sem juros
            </p>
          )}
          {discount > 0 && (
            <p className="font-mono text-xs text-[var(--akira-green)]">+ desconto {fmt.format(discount)}</p>
          )}
        </Block>

        {/* Total destaque */}
        <div className="relative overflow-hidden border-[3px] border-[var(--ink)] bg-[var(--akira-red)] p-6 shadow-hard-lg">
          <div className="absolute inset-0 halftone opacity-30" />
          <div className="relative flex items-end justify-between">
            <div>
              <p className="eyebrow !text-[var(--ink)] opacity-80">Total a pagar // 合計</p>
              <p className="display text-5xl text-[var(--ink)] glow-red numerals leading-none">
                {fmt.format(totalFinal)}
              </p>
            </div>
            <span className="display text-7xl text-[var(--ink)] opacity-20 leading-none">!</span>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="border-l-4 border-[var(--akira-yellow)] bg-[var(--bg-2)] px-4 py-3 text-xs text-[var(--ink-soft)]">
          Ao finalizar voce concorda com os termos e politica de privacidade. Em seguida voce sera redirecionado para a tela de{" "}
          <span className="font-bold text-[var(--akira-red)]">
            {shippingPayment.payment === "PIX"
              ? "PIX · QR + copia-e-cola"
              : shippingPayment.payment === "BOLETO"
                ? "boleto · codigo de barras"
                : "cartao · processamento seguro"}
          </span>
          .
        </p>
      </div>

      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="inline-flex items-center gap-2 border-[2px] border-[var(--ink)] bg-transparent px-5 py-3 text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--bg)] disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="square" d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          <span className="font-mono text-xs uppercase tracking-widest">Voltar</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="shimmer group relative inline-flex items-center gap-3 border-[3px] border-[var(--ink)] bg-[var(--akira-red)] px-10 py-5 text-[var(--ink)] shadow-hard transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-hard"
        >
          {submitting ? (
            <>
              <span className="h-3 w-3 animate-pulse rounded-full bg-[var(--ink)]" />
              <span className="display text-xl uppercase tracking-wider">Processando</span>
              <span className="jp text-base pulse-neon">処理中</span>
            </>
          ) : (
            <>
              <span className="display text-xl uppercase tracking-wider">Ir para pagamento</span>
              <span className="jp text-base">支払</span>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="square" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Block({ kanji, title, children }: { kanji: string; title: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[60px_1fr] gap-4 border-[2px] border-[var(--line)] bg-[var(--bg-2)] p-4">
      <div className="flex h-12 w-12 items-center justify-center border-[2px] border-[var(--akira-red)] bg-[var(--bg-3)] jp text-xl text-[var(--akira-red)]">
        {kanji}
      </div>
      <div>
        <p className="eyebrow !text-[var(--akira-red)] mb-1.5">{title}</p>
        <div className="space-y-0.5">{children}</div>
      </div>
    </div>
  );
}
