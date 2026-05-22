"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

type Props = {
  volumeId: string;
  seriesSlug: string;
  seriesTitle: string;
  volumeNumber: number;
  price: number;
  coverImage: string;
};

export default function AddToCartForm({
  volumeId,
  seriesSlug,
  seriesTitle,
  volumeNumber,
  price,
  coverImage,
}: Props) {
  const { add, items } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [shared, setShared] = useState(false);

  const inCart = items.find((i) => i.volumeId === volumeId);
  const subtotal = price * qty;
  const fmt = (n: number) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      add({
        volumeId,
        seriesSlug,
        seriesTitle,
        volumeNumber,
        price,
        coverImage,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    handleAdd();
    router.push("/carrinho");
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share({
          title: `${seriesTitle} — Volume ${volumeNumber}`,
          url,
        });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      setShared(true);
      setTimeout(() => setShared(false), 1600);
    } catch {
      // user canceled / no permission — silencioso
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Quantity selector */}
      <div className="flex items-center gap-4">
        <span className="eyebrow text-ink-muted">Qtd</span>
        <div className="flex items-center border-2 border-ink shadow-hard bg-bg">
          <button
            type="button"
            aria-label="Diminuir"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            className="w-10 h-10 flex items-center justify-center font-mono text-lg hover:bg-akira-red hover:text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            −
          </button>
          <span className="w-12 text-center font-mono numerals text-lg font-bold text-akira-yellow">
            {qty}
          </span>
          <button
            type="button"
            aria-label="Aumentar"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            className="w-10 h-10 flex items-center justify-center font-mono text-lg hover:bg-akira-cyan hover:text-bg transition-colors"
          >
            +
          </button>
        </div>
        <span className="ml-auto text-right font-mono text-sm text-ink-soft">
          <span className="text-ink-muted text-[10px] uppercase tracking-widest block">
            Subtotal
          </span>
          <span className="text-akira-cyan numerals font-bold">
            {fmt(subtotal)}
          </span>
        </span>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleAdd}
          className="shimmer hover-lift relative group flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 bg-akira-red text-ink font-bold uppercase tracking-widest text-sm border-2 border-ink shadow-hard-lg transition-all"
        >
          <span>{added ? "Adicionado!" : inCart ? `No carrinho (${inCart.quantity})` : "Adicionar ao carrinho"}</span>
          <span className="text-lg">+</span>
          <span className="onomatopeia absolute -top-4 -right-3 text-base opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            BAM!
          </span>
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          className="hover-lift flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-akira-yellow text-bg font-bold uppercase tracking-widest text-sm border-2 border-ink shadow-hard transition-all"
        >
          <span>Comprar agora</span>
          <span className="text-lg">→</span>
        </button>
      </div>

      {/* Share row */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--line)]">
        <p className="text-[11px] font-mono text-ink-muted uppercase tracking-widest">
          Codigo: {volumeId.toUpperCase()}
        </p>
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-3 py-2 border-2 border-akira-pink text-akira-pink text-[11px] font-mono font-bold uppercase tracking-widest hover:bg-akira-pink hover:text-bg transition-colors"
        >
          <span>{shared ? "Link copiado!" : "Compartilhar"}</span>
          <span>↗</span>
        </button>
      </div>
    </div>
  );
}
