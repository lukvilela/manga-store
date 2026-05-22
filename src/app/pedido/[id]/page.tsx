"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type StoredOrder = {
  orderId: string;
  identification: { name: string; email: string; mode: string };
  address: {
    cep: string;
    street: string;
    number: string;
    complement: string;
    district: string;
    city: string;
    state: string;
  };
  shipping: "PAC" | "SEDEX" | "PICKUP";
  payment: "PIX" | "CREDIT_CARD" | "BOLETO";
  installments: number;
  items: Array<{
    volumeId: string;
    seriesTitle: string;
    volumeNumber: number;
    quantity: number;
    price: number;
    coverImage: string;
  }>;
  totals: { subtotal: number; shipping: number; discount: number; total: number };
  createdAt: string;
};

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const shippingMeta: Record<StoredOrder["shipping"], { label: string; eta: string }> = {
  PAC: { label: "PAC Correios", eta: "7-10 dias uteis" },
  SEDEX: { label: "SEDEX Expresso", eta: "2-4 dias uteis" },
  PICKUP: { label: "Retirada na loja", eta: "Disponivel em 24h" },
};

const paymentMeta: Record<StoredOrder["payment"], { label: string; status: string }> = {
  PIX: { label: "PIX", status: "Aguardando pagamento — gere o QR code" },
  CREDIT_CARD: { label: "Cartao de credito", status: "Pagamento autorizado" },
  BOLETO: { label: "Boleto bancario", status: "Aguardando compensacao (ate 3 dias)" },
};

export default function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`order:${id}`);
      if (raw) setOrder(JSON.parse(raw));
    } catch {
      // ignore
    }
    setLoaded(true);
  }, [id]);

  const ship = order ? shippingMeta[order.shipping] : null;
  const pay = order ? paymentMeta[order.payment] : null;

  return (
    <main className="relative min-h-screen bg-[var(--bg)] bg-zone-warm">
      {/* Hero sucesso */}
      <section className="relative overflow-hidden border-b-2 border-[var(--line)] py-16">
        <div className="absolute inset-0 halftone-red opacity-30" />
        <div className="absolute inset-0 action-lines-radial opacity-20" />
        <div className="bike-streak" style={{ top: "30%" }} />
        <div className="bike-streak" style={{ top: "65%", animationDelay: "1.5s" }} />

        <div className="relative mx-auto max-w-5xl px-4 text-center md:px-6">
          <span className="onomatopeia text-2xl md:text-3xl">DONE!</span>
          <p className="eyebrow mt-6">Order Confirmed // 注文完了</p>
          <h1 className="display mt-3 text-5xl text-[var(--akira-red)] glow-red md:text-7xl leading-none">
            PEDIDO CONFIRMADO
          </h1>
          <p className="jp mt-4 text-2xl text-[var(--ink-soft)]">ご注文ありがとうございます</p>

          <div className="mt-8 inline-block border-[3px] border-[var(--ink)] bg-[var(--bg-3)] px-6 py-3 shadow-hard">
            <p className="eyebrow !text-[var(--ink-muted)]">Numero do pedido</p>
            <p className="display mt-1 text-3xl text-[var(--akira-cyan)] glow-cyan numerals">
              #{id}
            </p>
          </div>
        </div>
      </section>

      {/* Conteudo */}
      <section className="mx-auto max-w-5xl px-4 py-12 md:px-6">
        {!loaded ? (
          <p className="text-center font-mono text-sm text-[var(--ink-muted)] uppercase">{">"} carregando pedido...</p>
        ) : !order ? (
          <div className="panel-frame mx-auto max-w-xl p-8 text-center">
            <p className="display text-3xl text-[var(--akira-yellow)] glow-yellow">PEDIDO NAO ENCONTRADO</p>
            <p className="jp mt-2 text-base text-[var(--ink-muted)]">見つかりません</p>
            <p className="mt-4 text-sm text-[var(--ink-soft)]">
              O pedido <span className="font-mono">{id}</span> nao esta na sessao atual.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 border-[3px] border-[var(--ink)] bg-[var(--akira-red)] px-6 py-3 text-[var(--ink)] shadow-hard"
            >
              <span className="display text-base uppercase">Voltar ao inicio</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Email confirmacao */}
            <div className="flex items-start gap-4 border-[2px] border-dashed border-[var(--akira-cyan)] bg-[var(--bg-2)] p-5">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center border-[2px] border-[var(--akira-cyan)] bg-[var(--bg-3)] jp text-xl text-[var(--akira-cyan)]">
                @
              </div>
              <div>
                <p className="eyebrow !text-[var(--akira-cyan)]">Email enviado</p>
                <p className="mt-1 text-sm text-[var(--ink)]">
                  Confirmacao enviada para{" "}
                  <span className="font-mono text-[var(--akira-cyan)]">{order.identification.email}</span>
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-[var(--ink-muted)] uppercase">
                  {">"} verifique a caixa de entrada e o spam
                </p>
              </div>
            </div>

            {/* Proximos passos */}
            <div>
              <div className="mb-5 flex items-baseline gap-3">
                <span className="display text-3xl text-[var(--ink)]">PROXIMOS PASSOS</span>
                <span className="jp text-lg text-[var(--akira-pink)]">次のステップ</span>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <NextStep
                  num="01"
                  kanji="払"
                  title="Pagamento"
                  status={pay?.status || "Processando"}
                  color="var(--akira-yellow)"
                />
                <NextStep
                  num="02"
                  kanji="箱"
                  title="Preparacao"
                  status="Separamos em ate 1 dia util"
                  color="var(--akira-cyan)"
                />
                <NextStep
                  num="03"
                  kanji="便"
                  title={ship?.label || "Envio"}
                  status={`Entrega: ${ship?.eta || "-"}`}
                  color="var(--akira-pink)"
                />
              </div>
            </div>

            {/* Resumo do pedido */}
            <div className="panel-frame bg-[var(--bg-2)] p-6 md:p-8">
              <div className="mb-5 flex items-baseline gap-3 border-b-2 border-[var(--line)] pb-4">
                <span className="display text-2xl text-[var(--ink)]">RESUMO DO PEDIDO</span>
                <span className="jp text-base text-[var(--akira-red)]">概要</span>
              </div>

              <ul className="space-y-3">
                {order.items.map((it) => (
                  <li key={it.volumeId} className="flex items-center gap-4 border-b border-[var(--line)] pb-3 last:border-0">
                    <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden border-2 border-[var(--ink)] shadow-hard">
                      <Image src={it.coverImage} alt={it.seriesTitle} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="display text-base text-[var(--ink)]">{it.seriesTitle}</p>
                      <p className="font-mono text-xs text-[var(--ink-muted)]">
                        VOL.{String(it.volumeNumber).padStart(2, "0")} · QTD {it.quantity}
                      </p>
                    </div>
                    <p className="font-mono text-sm font-bold text-[var(--ink)] numerals">
                      {fmt.format(it.price * it.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-5 space-y-1.5 border-t-2 border-dashed border-[var(--line)] pt-4 text-sm">
                <Row label="Subtotal" value={fmt.format(order.totals.subtotal)} />
                <Row
                  label="Frete"
                  value={order.totals.shipping === 0 ? "GRATIS" : fmt.format(order.totals.shipping)}
                  highlight={order.totals.shipping === 0 ? "var(--akira-green)" : undefined}
                />
                {order.totals.discount > 0 && (
                  <Row
                    label="Desconto"
                    value={`- ${fmt.format(order.totals.discount)}`}
                    highlight="var(--akira-cyan)"
                  />
                )}
                <div className="mt-3 flex items-end justify-between border-t-2 border-[var(--ink)] pt-3">
                  <span className="eyebrow !text-[var(--ink)]">Total</span>
                  <span className="display text-3xl text-[var(--akira-red)] glow-red numerals">
                    {fmt.format(order.totals.total)}
                  </span>
                </div>
                {order.payment === "CREDIT_CARD" && order.installments > 1 && (
                  <p className="mt-2 text-right font-mono text-xs text-[var(--akira-yellow)] numerals">
                    {order.installments}x de {fmt.format(order.totals.total / order.installments)} sem juros
                  </p>
                )}
              </div>
            </div>

            {/* Entrega */}
            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard kanji="宅" title="Entrega">
                <p className="font-mono text-sm text-[var(--ink)]">
                  {order.address.street}, {order.address.number}
                  {order.address.complement && ` - ${order.address.complement}`}
                </p>
                <p className="font-mono text-sm text-[var(--ink-soft)]">
                  {order.address.district} · {order.address.city}/{order.address.state}
                </p>
                <p className="font-mono text-xs text-[var(--ink-muted)]">CEP {order.address.cep}</p>
              </InfoCard>

              <InfoCard kanji="追" title="Rastreio">
                <p className="font-mono text-sm text-[var(--ink-soft)]">
                  Codigo de rastreio sera enviado por email assim que o pedido for despachado.
                </p>
                <p className="font-mono text-[10px] text-[var(--ink-muted)] uppercase mt-2">
                  {">"} acompanhe em /minha-conta/pedidos
                </p>
              </InfoCard>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 pt-6 sm:flex-row sm:justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 border-[2px] border-[var(--ink)] bg-transparent px-6 py-4 text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--bg)]"
              >
                <span className="display text-base uppercase tracking-wider">Continuar comprando</span>
                <span className="jp text-sm">続</span>
              </Link>
              <Link
                href={`/pedido/${id}`}
                className="shimmer relative inline-flex items-center justify-center gap-3 border-[3px] border-[var(--ink)] bg-[var(--akira-red)] px-8 py-4 text-[var(--ink)] shadow-hard transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                <span className="display text-base uppercase tracking-wider">Acompanhar pedido</span>
                <span className="jp text-sm">追跡</span>
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function NextStep({
  num,
  kanji,
  title,
  status,
  color,
}: {
  num: string;
  kanji: string;
  title: string;
  status: string;
  color: string;
}) {
  return (
    <div className="relative border-[2px] border-[var(--line)] bg-[var(--bg-2)] p-5 transition hover:border-[var(--ink-soft)]">
      <span
        className="absolute -right-2 -top-2 px-2 py-0.5 font-mono text-[10px] font-bold"
        style={{ background: color, color: "var(--bg)" }}
      >
        {num}
      </span>
      <div className="flex items-center gap-3">
        <span className="jp text-3xl" style={{ color }}>
          {kanji}
        </span>
        <p className="display text-lg text-[var(--ink)]">{title}</p>
      </div>
      <p className="mt-2 font-mono text-xs text-[var(--ink-soft)]">{status}</p>
    </div>
  );
}

function InfoCard({ kanji, title, children }: { kanji: string; title: string; children: React.ReactNode }) {
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

function Row({ label, value, highlight }: { label: string; value: string; highlight?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--ink-soft)]">{label}</span>
      <span
        className="font-mono numerals"
        style={highlight ? { color: highlight, fontWeight: 700 } : undefined}
      >
        {value}
      </span>
    </div>
  );
}
