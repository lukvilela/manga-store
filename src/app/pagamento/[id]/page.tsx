"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PixPaymentPanel from "@/components/payment/PixPaymentPanel";
import CardPaymentPanel from "@/components/payment/CardPaymentPanel";
import BoletoPaymentPanel from "@/components/payment/BoletoPaymentPanel";
import { useOrder, deriveStatus, markAsPaid } from "@/lib/orders-store";
import { useToast } from "@/context/ToastContext";

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const methodMeta = {
  PIX: {
    label: "PIX",
    kanji: "瞬",
    sub: "Pagamento instantaneo · 5% desconto",
    accent: "var(--akira-green)",
  },
  CREDIT_CARD: {
    label: "Cartao de credito",
    kanji: "卡",
    sub: "Processamento seguro · ate 6x sem juros",
    accent: "var(--akira-cyan)",
  },
  BOLETO: {
    label: "Boleto bancario",
    kanji: "票",
    sub: "Compensacao em ate 2 dias uteis · 3% desconto",
    accent: "var(--akira-yellow)",
  },
} as const;

export default function PaymentGatewayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { show } = useToast();
  const { order, hydrated } = useOrder(id);
  const [submitting, setSubmitting] = useState(false);

  const status = order ? deriveStatus(order) : null;
  const alreadyPaid = !!order?.paidAt;

  // Handler compartilhado: marca como pago + toast + redireciona
  const handlePaid = (kind: "success" | "info" = "success", msg = "Pagamento confirmado!") => {
    if (!order) return;
    setSubmitting(true);
    markAsPaid(order.orderId);
    show(msg, kind, 3500);
    // Pequeno delay pra usuario ver o feedback antes de mudar de rota
    setTimeout(() => router.push(`/pedido/${order.orderId}`), 700);
  };

  // Nota: nao redireciona automatico quando ja pago — deixa usuario clicar
  // (UX comum em gateways pra evitar bounce involuntario).

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <span className="display text-3xl text-[var(--akira-red)] glow-red pulse-neon">CARREGANDO</span>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] bg-zone-warm px-4">
        <div className="panel-frame max-w-md p-8 text-center">
          <p className="display text-3xl text-[var(--akira-yellow)] glow-yellow">PEDIDO NAO ENCONTRADO</p>
          <p className="jp mt-2 text-base text-[var(--ink-muted)]">見つかりません</p>
          <p className="mt-4 text-sm text-[var(--ink-soft)]">
            O pedido <span className="font-mono">{id}</span> nao existe ou expirou.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 border-[3px] border-[var(--ink)] bg-[var(--akira-red)] px-6 py-3 text-[var(--ink)] shadow-hard"
          >
            <span className="display text-base uppercase">Voltar ao inicio</span>
          </Link>
        </div>
      </main>
    );
  }

  const meta = methodMeta[order.payment];

  return (
    <main className="relative min-h-screen bg-[var(--bg)] bg-zone-warm">
      {/* Hero */}
      <section className="relative overflow-hidden border-b-2 border-[var(--line)]">
        <div className="absolute inset-0 halftone-red opacity-30" />
        <div className="bike-streak top-1/2" style={{ animationDelay: "0.3s" }} />
        <div className="relative mx-auto max-w-5xl px-4 py-10 md:px-6">
          <div className="flex flex-wrap items-baseline gap-4">
            <span className="eyebrow">/ pagamento / 支払</span>
            <Link
              href={`/pedido/${id}`}
              className="font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest hover:text-[var(--akira-cyan)]"
            >
              {">"} ver pedido #{id}
            </Link>
          </div>
          <div className="mt-2 flex items-baseline gap-5">
            <h1 className="display text-5xl md:text-7xl text-[var(--ink)] glow-red leading-none">
              PAGAMENTO
            </h1>
            <span className="jp text-2xl md:text-3xl text-[var(--akira-red)] glow-red">支払</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span
              className="inline-flex items-center gap-2 border-[2px] border-[var(--ink)] px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest shadow-hard"
              style={{ background: meta.accent, color: "var(--bg)" }}
            >
              <span className="jp text-sm">{meta.kanji}</span>
              {meta.label}
            </span>
            <span className="font-mono text-xs text-[var(--ink-muted)]">{meta.sub}</span>
          </div>
        </div>
      </section>

      {/* Resumo curto */}
      <section className="border-b-2 border-[var(--line)] bg-[var(--bg-2)]">
        <div className="mx-auto max-w-5xl px-4 py-4 md:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <span className="eyebrow !text-[var(--ink-muted)]">Total</span>
            <span className="display text-2xl text-[var(--akira-red)] glow-red numerals">
              {fmt.format(order.totals.total)}
            </span>
            {order.payment === "CREDIT_CARD" && order.installments > 1 && (
              <span className="font-mono text-xs text-[var(--akira-yellow)] numerals">
                {order.installments}x de {fmt.format(order.totals.total / order.installments)}
              </span>
            )}
          </div>
          <p className="font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-wider">
            {">"} pedido #{order.orderId} · {order.items.length} item(ns)
          </p>
        </div>
      </section>

      {/* Conteudo principal */}
      <section className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        {alreadyPaid && status !== "pendente" ? (
          <div className="panel-frame bg-[var(--bg-2)] p-8 text-center">
            <span className="onomatopeia text-2xl">PAID!</span>
            <p className="display mt-4 text-3xl text-[var(--akira-green)] glow-green leading-none">
              PAGAMENTO JA CONFIRMADO
            </p>
            <p className="jp mt-2 text-base text-[var(--ink-soft)]">支払い済み</p>
            <p className="mt-4 text-sm text-[var(--ink-soft)]">
              Este pedido ja foi pago. Acompanhe o rastreio na pagina do pedido.
            </p>
            <Link
              href={`/pedido/${order.orderId}`}
              className="shimmer relative mt-6 inline-flex items-center gap-3 border-[3px] border-[var(--ink)] bg-[var(--akira-green)] px-8 py-4 text-[var(--bg)] shadow-hard transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              <span className="display text-base uppercase tracking-wider">Ver pedido</span>
              <span className="jp text-sm">注文</span>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="square" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        ) : (
          <>
            {order.payment === "PIX" && (
              <PixPaymentPanel
                amount={order.totals.total}
                submitting={submitting}
                onConfirm={() => handlePaid("success", "PIX confirmado · obrigado!")}
              />
            )}
            {order.payment === "CREDIT_CARD" && (
              <CardPaymentPanel
                amount={order.totals.total}
                installments={order.installments}
                submitting={submitting}
                setSubmitting={setSubmitting}
                onConfirm={(msg) => handlePaid("success", msg)}
              />
            )}
            {order.payment === "BOLETO" && (
              <BoletoPaymentPanel
                amount={order.totals.total}
                submitting={submitting}
                onConfirm={() => handlePaid("success", "Boleto compensado · pagamento OK")}
              />
            )}

            {/* Link "ja paguei depois" pra quem fechou aba */}
            <div className="mt-8 flex flex-col items-center gap-2 border-t-2 border-dashed border-[var(--line)] pt-6">
              <p className="font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest">
                {">"} mudou de ideia?
              </p>
              <Link
                href={`/pedido/${order.orderId}`}
                className="font-mono text-xs text-[var(--ink-soft)] uppercase tracking-wider hover:text-[var(--akira-cyan)]"
              >
                Pagar mais tarde · acompanhar pedido →
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
