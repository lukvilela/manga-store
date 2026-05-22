"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { SUGGESTED_COUPONS, formatCouponLabel } from "@/lib/coupons-store";
import { useToast } from "@/context/ToastContext";

type Props = {
  // Variante visual: full = carrinho (label + chips), compact = checkout sidebar
  variant?: "full" | "compact";
};

/**
 * Input de cupom com chips sugeridos e easter egg KANEDA.
 *
 * Persistencia do cupom fica no CartContext (manga-cart-coupon).
 * Re-valida automaticamente quando subtotal muda (no provider).
 */
export default function CouponInput({ variant = "full" }: Props) {
  const { coupon, applyCoupon, removeCoupon } = useCart();
  const { show } = useToast();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleApply = (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) {
      setError("Digite um codigo");
      return;
    }

    // Easter egg KANEDA
    if (code === "KANEDA") {
      show("Voce nao e o Kaneda!", "warning", 3500);
      setInput("");
      setError(null);
      return;
    }

    const result = applyCoupon(code);
    if (result.ok) {
      setError(null);
      setInput("");
      show(`Cupom ${code} aplicado`, "success");
    } else {
      setError(result.reason);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleApply(input);
  };

  const handleRemove = () => {
    removeCoupon();
    setError(null);
    show("Cupom removido", "info");
  };

  // ============ COUPON APLICADO ============
  if (coupon) {
    return (
      <div className={variant === "compact" ? "" : "space-y-2"}>
        {variant === "full" && (
          <label className="eyebrow text-ink-muted block mb-2">クーポン · CUPOM</label>
        )}
        <div className="flex items-center gap-3 border-2 border-akira-red bg-akira-red/10 px-3 py-2.5 shadow-[0_0_12px_rgba(193,18,31,0.25)]">
          <span className="jp text-akira-red glow-red text-base">券</span>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-xs font-bold text-akira-red uppercase tracking-widest truncate">
              {coupon.code}
            </p>
            <p className="font-mono text-[10px] text-ink-soft uppercase tracking-wider">
              {formatCouponLabel(coupon)}
              {coupon.source === "redemption" && (
                <span className="ml-1 text-akira-yellow">· resgate</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="flex items-center justify-center w-7 h-7 border border-akira-red text-akira-red font-bold text-sm hover:bg-akira-red hover:text-ink transition-all"
            aria-label="Remover cupom"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  // ============ FORM ============
  return (
    <div>
      {variant === "full" && (
        <label className="eyebrow text-ink-muted block mb-2">クーポン · CUPOM</label>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value.toUpperCase());
            if (error) setError(null);
          }}
          placeholder="AKIRA10"
          data-testid="coupon-input"
          className="flex-1 bg-bg border-2 border-ink px-3 py-2 text-sm font-mono uppercase tracking-wider text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-akira-cyan focus:shadow-[0_0_0_3px_rgba(0,212,228,0.2)] transition-all"
          aria-label="Codigo do cupom"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-akira-cyan text-bg font-bold text-xs uppercase tracking-widest border-2 border-akira-cyan shadow-hard hover:bg-bg hover:text-akira-cyan transition-all"
        >
          Aplicar
        </button>
      </form>

      {error && (
        <p className="mt-2 text-xs text-akira-red font-mono uppercase tracking-wider">
          × {error}
        </p>
      )}

      {!error && variant === "full" && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono text-ink-muted uppercase tracking-widest">
            Sugestoes:
          </span>
          {SUGGESTED_COUPONS.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => handleApply(code)}
              className="px-2 py-0.5 border border-akira-yellow text-akira-yellow font-mono text-[10px] uppercase tracking-wider hover:bg-akira-yellow hover:text-bg transition-colors"
            >
              {code}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
