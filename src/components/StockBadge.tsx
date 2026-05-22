"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { getStockLevel } from "@/lib/stock-mock";

type Props = {
  volumeId: string;
  /** Variante visual — "default" = badge completo, "chip" = mini chip canto card */
  variant?: "default" | "chip";
  /** Esconde o CTA "avise-me quando chegar" (usado dentro do AddToCartForm) */
  hideNotifyCta?: boolean;
};

/**
 * Badge visual com cor + mensagem baseado no estoque mock.
 * - in_stock     : verde discreto
 * - low          : amarelo
 * - last_units   : vermelho com pulse + onomatopeia DANGER!
 * - out_of_stock : cinza + botao "avise-me"
 */
export default function StockBadge({ volumeId, variant = "default", hideNotifyCta }: Props) {
  const { show } = useToast();
  const stock = getStockLevel(volumeId);
  const [subscribed, setSubscribed] = useState(false);

  const handleNotify = () => {
    setSubscribed(true);
    show("OK, te avisaremos quando chegar!", "info", 2800);
  };

  // Variante mini chip — usado em MangaCard pra dar realismo de escassez
  if (variant === "chip") {
    if (stock.level !== "last_units") return null;
    return (
      <span className="pulse-neon inline-flex items-center gap-1 border-2 border-ink bg-akira-red px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-ink shadow-hard">
        Ultimas
      </span>
    );
  }

  if (stock.level === "in_stock") {
    return (
      <div className="inline-flex items-center gap-2 border-2 border-emerald-500/70 bg-emerald-500/15 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-400">
        <span aria-hidden className="block h-2 w-2 rounded-full bg-emerald-400" />
        <span>{stock.message}</span>
      </div>
    );
  }

  if (stock.level === "low") {
    return (
      <div className="inline-flex items-center gap-2 border-2 border-amber-400 bg-amber-400/15 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-amber-300">
        <span aria-hidden className="block h-2 w-2 rounded-full bg-amber-400" />
        <span>{stock.message}</span>
      </div>
    );
  }

  if (stock.level === "last_units") {
    return (
      <div className="relative inline-flex items-center gap-2">
        <div className="pulse-neon inline-flex items-center gap-2 border-2 border-ink bg-akira-red px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-ink shadow-hard">
          <span aria-hidden className="block h-2 w-2 rounded-full bg-akira-yellow" />
          <span>{stock.message}</span>
        </div>
        <span className="onomatopeia text-sm">DANGER!</span>
      </div>
    );
  }

  // out_of_stock
  return (
    <div className="inline-flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center gap-2 border-2 border-[var(--line)] bg-[var(--bg-3)] px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--ink-muted)]">
        <span aria-hidden className="block h-2 w-2 rounded-full bg-[var(--ink-muted)]" />
        <span>Esgotado</span>
      </div>
      {!hideNotifyCta && (
        <button
          type="button"
          onClick={handleNotify}
          disabled={subscribed}
          className="inline-flex items-center gap-1.5 border-2 border-akira-cyan px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-akira-cyan transition-colors hover:bg-akira-cyan hover:text-bg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {subscribed ? "Avisaremos!" : "Avise-me quando chegar"}
        </button>
      )}
    </div>
  );
}
