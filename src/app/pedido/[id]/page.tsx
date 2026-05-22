"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import OrderTimeline from "@/components/order/OrderTimeline";
import TrackingCode from "@/components/order/TrackingCode";
import CancelOrderModal from "@/components/order/CancelOrderModal";
import ReturnRequestModal from "@/components/order/ReturnRequestModal";
import ReviewForm from "@/components/reviews/ReviewForm";
import { useToast } from "@/context/ToastContext";
import { useReviews } from "@/lib/reviews-store";
import { useAuth } from "@/context/AuthContext";
import {
  buildTimeline,
  deriveStatus,
  getOrder,
  getStatusMeta,
  type StoredOrder,
} from "@/lib/orders-store";

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFmtFull = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const paymentMeta: Record<StoredOrder["payment"], { label: string; status: string }> = {
  PIX: { label: "PIX", status: "Aguardando pagamento — gere o QR code" },
  CREDIT_CARD: { label: "Cartao de credito", status: "Pagamento autorizado" },
  BOLETO: { label: "Boleto bancario", status: "Aguardando compensacao (ate 3 dias)" },
};

// Metodos que exigem acao do cliente apos checkout
const NEEDS_PAYMENT_ACTION: StoredOrder["payment"][] = ["PIX", "BOLETO", "CREDIT_CARD"];

// Status em que o cliente ainda pode cancelar sozinho (antes de despachar)
const CANCELLABLE_STATUSES = new Set(["pendente", "confirmado", "preparando"]);

export default function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { show } = useToast();
  const { user } = useAuth();
  const { items: reviewItems } = useReviews();
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [, setTick] = useState(0);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  // Item ativo no inline-review modal pos-entrega (orderId+volumeId nao precisam — usa mangaId direto)
  const [reviewingItem, setReviewingItem] = useState<StoredOrder["items"][number] | null>(null);

  const reloadOrder = () => {
    const fresh = getOrder(id);
    setOrder(fresh ?? null);
  };

  useEffect(() => {
    // Hidrata do localStorage (com fallback pra sessionStorage legado)
    let stored = getOrder(id);
    if (!stored) {
      try {
        const raw = sessionStorage.getItem(`order:${id}`);
        if (raw) stored = JSON.parse(raw);
      } catch {
        // ignore
      }
    }
    setOrder(stored ?? null);
    setLoaded(true);

    // Reage a mudancas no store (cancel/return em outro tab tambem propaga)
    const sync = () => setOrder(getOrder(id));
    window.addEventListener("orders:change", sync);
    window.addEventListener("storage", sync);

    // Tick a cada 30s pra timeline evoluir visualmente
    const interval = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => {
      clearInterval(interval);
      window.removeEventListener("orders:change", sync);
      window.removeEventListener("storage", sync);
    };
  }, [id]);

  // Fecha modal de review quando user posta (reviews-store dispara event)
  useEffect(() => {
    if (!reviewingItem) return;
    // Se o user ja tem review pra esse manga, fecha o modal
    if (!user) return;
    const mangaId = reviewingItem.volumeId.replace(/-vol-\d+$/i, "");
    const already = reviewItems.some(
      (r) => r.userName === user.name && r.mangaId === mangaId
    );
    if (already) {
      setReviewingItem(null);
      window.dispatchEvent(
        new CustomEvent("gamification:cart-add", {
          detail: { kind: "review", amount: 20, points: 20 },
        })
      );
    }
  }, [reviewItems, reviewingItem, user]);

  // Avisa quando status mudar ao longo da sessao
  const status = order ? deriveStatus(order) : null;
  const [lastStatus, setLastStatus] = useState<typeof status>(null);
  useEffect(() => {
    if (!status) return;
    if (lastStatus && lastStatus !== status) {
      const meta = getStatusMeta(status);
      show(`Status atualizado: ${meta.label}`, "success", 4000);
    }
    setLastStatus(status);
  }, [status, lastStatus, show]);

  const timeline = useMemo(() => (order ? buildTimeline(order) : []), [order]);
  const statusMeta = status ? getStatusMeta(status) : null;

  const trackingAvailable =
    !!status && ["enviado", "a_caminho", "entregue"].includes(status);

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

          {statusMeta && (
            <div className="mt-4">
              <span
                className="inline-block border-[2px] border-[var(--ink)] px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest"
                style={{ background: statusMeta.color, color: "var(--bg)" }}
              >
                {statusMeta.kanji} · {statusMeta.label}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Conteudo */}
      <section className="mx-auto max-w-5xl px-4 py-12 md:px-6">
        {!loaded ? (
          <p className="text-center font-mono text-sm text-[var(--ink-muted)] uppercase">
            {">"} carregando pedido...
          </p>
        ) : !order ? (
          <div className="panel-frame mx-auto max-w-xl p-8 text-center">
            <p className="display text-3xl text-[var(--akira-yellow)] glow-yellow">PEDIDO NAO ENCONTRADO</p>
            <p className="jp mt-2 text-base text-[var(--ink-muted)]">見つかりません</p>
            <p className="mt-4 text-sm text-[var(--ink-soft)]">
              O pedido <span className="font-mono">{id}</span> nao foi encontrado.
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
            {/* Banner cancelado — substitui visual normal de progresso */}
            {status === "cancelado" && (
              <div className="relative overflow-hidden border-[4px] border-[var(--ink)] bg-[var(--bg-3)] p-6 shadow-hard-lg md:p-8">
                <div className="absolute inset-0 halftone opacity-15 pointer-events-none" aria-hidden />
                <div className="relative">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="onomatopeia text-2xl md:text-3xl">CANCELED!</span>
                    <span className="jp text-xl text-[var(--ink-muted)]">中止</span>
                  </div>
                  <h2 className="display mt-3 text-4xl md:text-5xl text-[var(--ink-muted)] leading-none">
                    PEDIDO CANCELADO
                  </h2>
                  {order.cancelledAt && (
                    <p className="mt-3 font-mono text-xs text-[var(--ink-soft)] uppercase tracking-widest">
                      {">"} cancelado em {dateFmtFull.format(new Date(order.cancelledAt))}
                    </p>
                  )}
                  {order.cancelReason && (
                    <p className="mt-2 font-mono text-sm text-[var(--ink-soft)]">
                      <span className="text-[var(--ink-muted)] uppercase tracking-widest text-[10px]">Motivo: </span>
                      {order.cancelReason}
                    </p>
                  )}
                  <div className="mt-5 border-2 border-dashed border-[var(--akira-cyan)] bg-[var(--akira-cyan)]/10 p-3">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--akira-cyan)] font-bold">
                      Estorno em ate 5 dias uteis
                    </p>
                    <p className="mt-1 font-mono text-xs text-[var(--ink-soft)]">
                      Reembolso de <span className="numerals font-bold">{fmt.format(order.totals.total)}</span> sera processado no mesmo metodo de pagamento.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Banner devolucao em analise */}
            {order.returnRequestedAt && status !== "cancelado" && (
              <div className="border-[3px] border-[var(--akira-yellow)] bg-[var(--akira-yellow)]/10 p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <span className="jp text-2xl text-[var(--akira-yellow)] glow-yellow pulse-neon">返</span>
                  <div className="flex-1">
                    <p className="display text-lg text-[var(--akira-yellow)]">DEVOLUCAO EM ANALISE</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-soft)]">
                      {">"} status: {order.returnStatus ?? "solicitada"} · resposta em ate 24h
                    </p>
                    {order.returnReason && (
                      <p className="mt-2 font-mono text-xs text-[var(--ink-soft)] leading-relaxed">
                        <span className="text-[var(--ink-muted)] uppercase tracking-widest text-[10px]">Motivo: </span>
                        {order.returnReason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Banner pagamento pendente — link de fallback se cliente fechou aba */}
            {status === "pendente" && NEEDS_PAYMENT_ACTION.includes(order.payment) && (
              <Link
                href={`/pagamento/${id}`}
                className="group block border-[3px] border-[var(--ink)] bg-[var(--akira-yellow)] p-4 shadow-hard transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="jp text-3xl text-[var(--bg)] pulse-neon">払</span>
                    <div>
                      <p className="display text-base text-[var(--bg)] uppercase tracking-wider">
                        Concluir pagamento
                      </p>
                      <p className="font-mono text-xs text-[var(--bg)] opacity-80 uppercase">
                        {">"} {order.payment === "PIX"
                          ? "gere o qr code pix"
                          : order.payment === "BOLETO"
                            ? "abra o boleto pra pagar"
                            : "informe os dados do cartao"}
                      </p>
                    </div>
                  </div>
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6 text-[var(--bg)] transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="square" d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </div>
              </Link>
            )}

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
                  {">"} verifique a caixa de entrada e o spam · email mock pra demo
                </p>
              </div>
            </div>

            {/* Timeline de rastreio */}
            <OrderTimeline timeline={timeline} />

            {/* Codigo de rastreio */}
            <TrackingCode code={order.trackingCode} available={trackingAvailable} />

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
                      <Image src={it.coverImage} alt={it.seriesTitle} fill className="object-cover" unoptimized />
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
                  label={`Frete · ${order.shippingLabel}`}
                  value={order.totals.shipping === 0 ? "GRATIS" : fmt.format(order.totals.shipping)}
                  highlight={order.totals.shipping === 0 ? "var(--akira-green)" : undefined}
                />
                {order.totals.discount > 0 && (
                  <Row
                    label={`Desconto · ${pay?.label ?? ""}`}
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

              <InfoCard kanji="便" title="Frete & ETA">
                <p className="font-mono text-sm text-[var(--ink)]">{order.shippingLabel}</p>
                <p className="font-mono text-sm text-[var(--ink-soft)]">
                  Previsao: {order.shippingEtaDays} dia{order.shippingEtaDays > 1 ? "s" : ""} util(eis)
                </p>
                <p className="font-mono text-[10px] text-[var(--ink-muted)] mt-1 uppercase">
                  {">"} status atualizado automaticamente
                </p>
              </InfoCard>
            </div>

            {/* Banner pos-entrega — avaliar produtos */}
            {status === "entregue" && !order.returnRequestedAt && user && (
              <PostDeliveryReviewBanner
                items={order.items}
                reviewedMangaIds={
                  new Set(
                    reviewItems
                      .filter((r) => r.userName === user.name)
                      .map((r) => r.mangaId)
                  )
                }
                onReview={(it) => setReviewingItem(it)}
              />
            )}

            {/* Acoes pos-venda — cancelar / devolver */}
            {(status && CANCELLABLE_STATUSES.has(status)) || (status === "entregue" && !order.returnRequestedAt) ? (
              <div className="border-2 border-dashed border-[var(--line)] bg-[var(--bg-2)] p-4">
                <p className="eyebrow !text-[var(--ink-muted)] mb-3">Acoes pos-venda</p>
                <div className="flex flex-wrap gap-3">
                  {status && CANCELLABLE_STATUSES.has(status) && (
                    <button
                      type="button"
                      onClick={() => setCancelOpen(true)}
                      className="inline-flex items-center gap-2 border-2 border-[var(--akira-red)] bg-transparent px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-[var(--akira-red)] transition-colors hover:bg-[var(--akira-red)] hover:text-[var(--ink)]"
                    >
                      <span className="jp text-base">中</span>
                      <span>Cancelar pedido</span>
                    </button>
                  )}
                  {status === "entregue" && !order.returnRequestedAt && (
                    <button
                      type="button"
                      onClick={() => setReturnOpen(true)}
                      className="inline-flex items-center gap-2 border-2 border-[var(--akira-cyan)] bg-transparent px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-[var(--akira-cyan)] transition-colors hover:bg-[var(--akira-cyan)] hover:text-bg"
                    >
                      <span className="jp text-base">返</span>
                      <span>Solicitar devolucao</span>
                    </button>
                  )}
                </div>
                {status && CANCELLABLE_STATUSES.has(status) && (
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
                    {">"} apos despacho nos correios o cancelamento direto nao e mais possivel
                  </p>
                )}
              </div>
            ) : null}

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
                href="/conta/pedidos"
                className="shimmer relative inline-flex items-center justify-center gap-3 border-[3px] border-[var(--ink)] bg-[var(--akira-red)] px-8 py-4 text-[var(--ink)] shadow-hard transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                <span className="display text-base uppercase tracking-wider">Meus pedidos</span>
                <span className="jp text-sm">注文</span>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Modais */}
      {order && (
        <>
          <CancelOrderModal
            order={order}
            open={cancelOpen}
            onClose={() => setCancelOpen(false)}
            onCancelled={reloadOrder}
          />
          <ReturnRequestModal
            order={order}
            open={returnOpen}
            onClose={() => setReturnOpen(false)}
            onRequested={reloadOrder}
          />
        </>
      )}

      {/* Modal inline de review pos-entrega */}
      {reviewingItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setReviewingItem(null)}
            className="absolute inset-0 cursor-default bg-black/75 backdrop-blur-sm"
          />
          <div className="relative z-10 my-8 w-full max-w-2xl">
            <div className="mb-2 flex items-center justify-between gap-3 border-2 border-ink bg-[var(--bg-3)] px-4 py-2 shadow-hard">
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--akira-green)]">
                Avaliando · {reviewingItem.seriesTitle} Vol.{String(reviewingItem.volumeNumber).padStart(2, "0")}
              </p>
              <button
                type="button"
                onClick={() => setReviewingItem(null)}
                aria-label="Fechar modal"
                className="border-2 border-[var(--line)] bg-[var(--bg-3)] px-2 py-0.5 font-mono text-xs text-[var(--ink-soft)] hover:border-[var(--akira-red)] hover:text-[var(--akira-red)]"
              >
                X
              </button>
            </div>
            <ReviewForm
              mangaId={reviewingItem.volumeId.replace(/-vol-\d+$/i, "")}
              mangaTitle={reviewingItem.seriesTitle}
              mangaCover={reviewingItem.coverImage}
            />
          </div>
        </div>
      )}
    </main>
  );
}

function PostDeliveryReviewBanner({
  items,
  reviewedMangaIds,
  onReview,
}: {
  items: StoredOrder["items"];
  reviewedMangaIds: Set<string>;
  onReview: (it: StoredOrder["items"][number]) => void;
}) {
  // dedup por mangaId — varios volumes do mesmo manga so geram 1 prompt
  const seenManga = new Set<string>();
  const pending = items.filter((it) => {
    const mangaId = it.volumeId.replace(/-vol-\d+$/i, "");
    if (reviewedMangaIds.has(mangaId)) return false;
    if (seenManga.has(mangaId)) return false;
    seenManga.add(mangaId);
    return true;
  });

  if (pending.length === 0) return null;

  return (
    <div className="relative overflow-hidden border-[3px] border-[var(--akira-green)] bg-[var(--akira-green)]/10 p-4 md:p-5">
      <div className="absolute inset-0 halftone opacity-15 pointer-events-none" aria-hidden />
      <div className="relative">
        <div className="flex items-baseline gap-3 flex-wrap mb-3">
          <span className="onomatopeia text-base md:text-lg">YEAH!</span>
          <p className="display text-xl md:text-2xl text-[var(--akira-green)] glow-green">
            COMO FOI SUA LEITURA?
          </p>
          <span className="jp text-base text-[var(--ink-soft)]">読んだ?</span>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
            {">"} +20 XP por review
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {pending.map((it) => (
            <button
              key={it.volumeId}
              type="button"
              onClick={() => onReview(it)}
              className="inline-flex items-center gap-2 border-2 border-ink bg-[var(--bg-3)] px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-[var(--ink)] shadow-hard transition-all hover:bg-[var(--akira-yellow)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
            >
              <span className="jp text-sm">評</span>
              <span>Avaliar Vol.{String(it.volumeNumber).padStart(2, "0")} · {it.seriesTitle}</span>
            </button>
          ))}
        </div>
      </div>
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
