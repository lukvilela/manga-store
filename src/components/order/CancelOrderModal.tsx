"use client";

import { useEffect, useState } from "react";
import { cancelOrder, type StoredOrder } from "@/lib/orders-store";
import { useToast } from "@/context/ToastContext";

type Props = {
  order: StoredOrder;
  open: boolean;
  onClose: () => void;
  onCancelled?: () => void;
};

const REASONS = [
  "Mudei de ideia",
  "Encontrei mais barato",
  "Erro no endereco",
  "Demora na entrega",
  "Outro",
] as const;

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function CancelOrderModal({ order, open, onClose, onCancelled }: Props) {
  const { show } = useToast();
  const [reason, setReason] = useState<(typeof REASONS)[number]>(REASONS[0]);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ESC + lock scroll + reset no cleanup (evita setState em effect body)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      setReason(REASONS[0]);
      setDetails("");
      setSubmitting(false);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleConfirm = () => {
    if (submitting) return;
    setSubmitting(true);
    const fullReason = details.trim() ? `${reason} — ${details.trim()}` : reason;
    const result = cancelOrder(order.orderId, fullReason);
    if (result) {
      show("Pedido cancelado · estorno em ate 5 dias", "success", 4200);
      onCancelled?.();
      onClose();
    } else {
      show("Nao foi possivel cancelar agora. Tente novamente.", "error");
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/75 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="panel-frame relative z-10 w-full max-w-lg bg-[var(--bg-2)] p-6 md:p-7">
        <div className="absolute inset-0 halftone-red opacity-10 pointer-events-none" aria-hidden />

        <div className="relative">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between gap-4 border-b-2 border-[var(--line)] pb-3">
            <div>
              <p className="eyebrow !text-[var(--akira-red)]">Cancelar pedido // 中止</p>
              <h2
                id="cancel-modal-title"
                className="display text-2xl text-[var(--ink)] glow-red mt-1"
              >
                CANCELAR #{order.orderId}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar modal"
              className="border-2 border-[var(--line)] bg-[var(--bg-3)] px-2 py-1 font-mono text-xs text-[var(--ink-soft)] hover:border-[var(--akira-red)] hover:text-[var(--akira-red)] transition-colors"
            >
              X
            </button>
          </div>

          {/* Preview do pedido */}
          <div className="mb-4 grid grid-cols-2 gap-3 border-2 border-dashed border-[var(--line)] bg-[var(--bg-3)] p-3">
            <div>
              <p className="eyebrow !text-[var(--ink-muted)] !text-[9px]">Numero</p>
              <p className="font-mono text-sm font-bold text-[var(--ink)]">#{order.orderId}</p>
            </div>
            <div className="text-right">
              <p className="eyebrow !text-[var(--ink-muted)] !text-[9px]">Total a estornar</p>
              <p className="font-mono text-base font-bold text-[var(--akira-red)] numerals">
                {fmt.format(order.totals.total)}
              </p>
            </div>
          </div>

          {/* Aviso */}
          <div className="mb-5 flex items-start gap-3 border-2 border-[var(--akira-yellow)] bg-[var(--akira-yellow)]/10 p-3">
            <span className="jp text-xl text-[var(--akira-yellow)] glow-yellow">注</span>
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-[var(--akira-yellow)]">
                Tem certeza?
              </p>
              <p className="mt-1 font-mono text-[11px] text-[var(--ink-soft)] leading-relaxed">
                Esta acao nao pode ser desfeita. O estorno cai em ate 5 dias uteis no mesmo metodo de pagamento.
              </p>
            </div>
          </div>

          {/* Motivo */}
          <div className="mb-4">
            <label htmlFor="cancel-reason" className="eyebrow !text-[var(--ink-muted)] block mb-2">
              Motivo do cancelamento
            </label>
            <select
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as (typeof REASONS)[number])}
              className="w-full border-2 border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--akira-red)] focus:shadow-[0_0_0_3px_rgba(193,18,31,0.25)]"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Detalhes */}
          <div className="mb-5">
            <label htmlFor="cancel-details" className="eyebrow !text-[var(--ink-muted)] block mb-2">
              Detalhes (opcional)
            </label>
            <textarea
              id="cancel-details"
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, 280))}
              rows={3}
              placeholder="Conte o que aconteceu (ajuda a gente a melhorar)"
              className="w-full resize-none border-2 border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 font-mono text-sm text-[var(--ink-soft)] outline-none focus:border-[var(--akira-red)] focus:shadow-[0_0_0_3px_rgba(193,18,31,0.25)]"
            />
            <p className="mt-1 text-right font-mono text-[10px] text-[var(--ink-muted)] numerals">
              {details.length}/280
            </p>
          </div>

          {/* Acoes */}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="border-2 border-[var(--ink)] bg-transparent px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[var(--ink)] transition-colors hover:bg-[var(--ink)] hover:text-[var(--bg)] disabled:opacity-50"
            >
              Manter pedido
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="shimmer border-2 border-[var(--ink)] bg-[var(--akira-red)] px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[var(--ink)] shadow-hard transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Cancelando..." : "Cancelar agora"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
