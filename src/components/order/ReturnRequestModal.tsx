"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { requestReturn, type StoredOrder } from "@/lib/orders-store";
import { useToast } from "@/context/ToastContext";

type Props = {
  order: StoredOrder;
  open: boolean;
  onClose: () => void;
  onRequested?: () => void;
};

const REASONS = [
  "Produto com defeito",
  "Item errado enviado",
  "Nao atendeu expectativas",
  "Capa danificada",
  "Outro",
] as const;

export default function ReturnRequestModal({ order, open, onClose, onRequested }: Props) {
  const { show } = useToast();
  const [reason, setReason] = useState<(typeof REASONS)[number]>(REASONS[0]);
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(order.items.map((i) => i.volumeId))
  );
  const [photoNames, setPhotoNames] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // ESC + lock scroll quando aberto. Reset de form e feito no cleanup,
  // assim a setState so dispara quando o modal fecha (sync com sistema externo).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const defaultItems = order.items.map((i) => i.volumeId);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      // Reset form ao fechar — proximo open arranca limpo
      setReason(REASONS[0]);
      setDescription("");
      setSelected(new Set(defaultItems));
      setPhotoNames([]);
      setSubmitting(false);
    };
  }, [open, onClose, order.items]);

  const toggleItem = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setPhotoNames(Array.from(files).map((f) => f.name).slice(0, 3));
  };

  const canSubmit = useMemo(
    () => selected.size > 0 && description.trim().length >= 10,
    [selected.size, description]
  );

  if (!open) return null;

  const handleConfirm = () => {
    if (submitting) return;
    if (selected.size === 0) {
      show("Selecione ao menos 1 item pra devolver", "warning");
      return;
    }
    if (description.trim().length < 10) {
      show("Descreva o problema (ao menos 10 caracteres)", "warning");
      return;
    }
    setSubmitting(true);
    const fullReason = `${reason} — ${description.trim()}`;
    const result = requestReturn(order.orderId, fullReason, Array.from(selected));
    if (result) {
      show("Solicitacao enviada · resposta em ate 24h", "success", 4200);
      onRequested?.();
      onClose();
    } else {
      show("Nao foi possivel abrir a devolucao agora.", "error");
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="return-modal-title"
    >
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/75 backdrop-blur-sm"
      />

      <div className="panel-frame relative z-10 my-8 w-full max-w-2xl bg-[var(--bg-2)] p-6 md:p-7">
        <div className="absolute inset-0 halftone opacity-10 pointer-events-none" aria-hidden />

        <div className="relative">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between gap-4 border-b-2 border-[var(--line)] pb-3">
            <div>
              <p className="eyebrow !text-[var(--akira-cyan)]">Solicitar devolucao // 返品</p>
              <h2
                id="return-modal-title"
                className="display text-2xl text-[var(--ink)] mt-1"
              >
                DEVOLVER #{order.orderId}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar modal"
              className="border-2 border-[var(--line)] bg-[var(--bg-3)] px-2 py-1 font-mono text-xs text-[var(--ink-soft)] hover:border-[var(--akira-cyan)] hover:text-[var(--akira-cyan)] transition-colors"
            >
              X
            </button>
          </div>

          {/* Items checklist */}
          <div className="mb-5">
            <p className="eyebrow !text-[var(--ink-muted)] mb-2">
              Quais itens devolver? ({selected.size}/{order.items.length})
            </p>
            <ul className="space-y-2 max-h-56 overflow-y-auto border-2 border-dashed border-[var(--line)] bg-[var(--bg-3)] p-3">
              {order.items.map((it) => {
                const checked = selected.has(it.volumeId);
                return (
                  <li key={it.volumeId}>
                    <label className="flex cursor-pointer items-center gap-3 border border-transparent p-1.5 hover:border-[var(--akira-cyan)]/60">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleItem(it.volumeId)}
                        className="sr-only peer"
                      />
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center border-2 border-[var(--line)] bg-[var(--bg)] font-bold text-bg text-xs peer-checked:border-ink peer-checked:bg-akira-cyan shadow-[2px_2px_0_var(--ink)]">
                        {checked && "X"}
                      </span>
                      <div className="relative h-14 w-10 flex-shrink-0 overflow-hidden border-2 border-[var(--ink)]">
                        <Image src={it.coverImage} alt={it.seriesTitle} fill className="object-cover" unoptimized />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="display text-sm text-[var(--ink)] truncate">{it.seriesTitle}</p>
                        <p className="font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest">
                          Vol.{String(it.volumeNumber).padStart(2, "0")} · qtd {it.quantity}
                        </p>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Motivo */}
          <div className="mb-4">
            <label htmlFor="return-reason" className="eyebrow !text-[var(--ink-muted)] block mb-2">
              Motivo
            </label>
            <select
              id="return-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as (typeof REASONS)[number])}
              className="w-full border-2 border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--akira-cyan)] focus:shadow-[0_0_0_3px_rgba(64,224,208,0.25)]"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Descricao */}
          <div className="mb-4">
            <label htmlFor="return-desc" className="eyebrow !text-[var(--ink-muted)] block mb-2">
              Descreva o problema
            </label>
            <textarea
              id="return-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              rows={4}
              placeholder="Conte o que aconteceu — quanto mais detalhes, mais rapido a gente resolve"
              className="w-full resize-none border-2 border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 font-mono text-sm text-[var(--ink-soft)] outline-none focus:border-[var(--akira-cyan)] focus:shadow-[0_0_0_3px_rgba(64,224,208,0.25)]"
            />
            <p className="mt-1 text-right font-mono text-[10px] text-[var(--ink-muted)] numerals">
              {description.length}/500
            </p>
          </div>

          {/* Upload mock fotos */}
          <div className="mb-5">
            <p className="eyebrow !text-[var(--ink-muted)] mb-2">Fotos do problema (opcional, ate 3)</p>
            <label className="flex cursor-pointer items-center justify-center gap-2 border-2 border-dashed border-[var(--akira-pink)]/70 bg-[var(--bg-3)] px-3 py-4 font-mono text-xs uppercase tracking-widest text-[var(--akira-pink)] transition-colors hover:bg-[var(--akira-pink)]/10">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="sr-only"
              />
              <span className="text-lg">+</span>
              <span>{photoNames.length > 0 ? `${photoNames.length} foto(s) anexada(s)` : "Adicionar fotos"}</span>
            </label>
            {photoNames.length > 0 && (
              <ul className="mt-2 space-y-1">
                {photoNames.map((name) => (
                  <li
                    key={name}
                    className="truncate border border-[var(--line)] bg-[var(--bg-3)] px-2 py-1 font-mono text-[10px] text-[var(--ink-soft)]"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">
              {">"} mock visual · arquivos nao sao enviados
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
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting || !canSubmit}
              className="shimmer border-2 border-[var(--ink)] bg-[var(--akira-cyan)] px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-bg shadow-hard transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Enviando..." : "Enviar solicitacao"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
