"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { playSwoosh } from "@/lib/sfx";

const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function MiniCart() {
  const { items, total, count, remove } = useCart();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Click fora / Esc fecha
  useEffect(() => {
    if (!open) return;

    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Pega ate 4 ultimos itens (mais recentes primeiro)
  const previewItems = [...items].slice(-4).reverse();

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => {
            if (!v) playSwoosh();
            return !v;
          });
        }}
        aria-expanded={open}
        aria-label={`Carrinho (${count} itens)`}
        className="relative inline-flex items-center justify-center w-10 h-10 rounded border border-akira-red bg-[var(--bg-2)] hover:bg-akira-red hover:text-ink transition-all"
        title="Carrinho"
      >
        <span className="text-lg">🛒</span>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-akira-pink text-ink text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center font-mono">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="mini-cart-pop absolute right-0 top-full mt-3 w-[min(380px,calc(100vw-2rem))] bg-bg-2 border-2 border-akira-red shadow-[8px_8px_0_var(--ink)] z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)]">
            <div className="flex items-center gap-2">
              <span className="jp text-akira-red text-sm font-black">カート</span>
              <span className="eyebrow text-akira-cyan text-[10px]">MINI CART</span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-ink-muted">
              {count} {count === 1 ? "item" : "itens"}
            </span>
          </div>

          {items.length === 0 ? (
            // Empty state mini
            <div className="px-4 py-8 text-center">
              <p className="jp text-akira-red text-4xl font-black glow-red mb-2">空</p>
              <p className="text-sm text-ink-soft mb-4">Carrinho vazio</p>
              <Link
                href="/busca"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-akira-cyan text-akira-cyan font-bold uppercase tracking-widest text-[11px] hover:bg-akira-cyan hover:text-bg transition-all"
              >
                <span>Explorar catalogo</span>
                <span>→</span>
              </Link>
            </div>
          ) : (
            <>
              {/* Lista dos ultimos 4 itens */}
              <ul className="max-h-[320px] overflow-y-auto divide-y divide-[var(--line)]">
                {previewItems.map((item) => (
                  <li key={item.volumeId} className="flex gap-3 px-4 py-3 hover:bg-bg-3 transition-colors">
                    <Link
                      href={`/volume/${item.volumeId}`}
                      onClick={() => setOpen(false)}
                      className="flex-shrink-0 w-12 h-16 border border-ink overflow-hidden bg-bg"
                    >
                      {item.coverImage && (
                        <Image
                          src={item.coverImage}
                          alt={item.seriesTitle}
                          width={48}
                          height={64}
                          unoptimized
                          className="object-cover w-full h-full"
                        />
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/volume/${item.volumeId}`}
                        onClick={() => setOpen(false)}
                        className="block font-display text-sm text-ink truncate hover:text-akira-red transition-colors"
                      >
                        {item.seriesTitle}
                      </Link>
                      <p className="text-[11px] font-mono text-ink-muted">
                        Vol. {item.volumeNumber} · qtd {item.quantity}
                      </p>
                      <p className="text-xs text-akira-cyan font-mono numerals font-bold mt-1">
                        {fmt(item.price * item.quantity)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.volumeId)}
                      aria-label={`Remover ${item.seriesTitle}`}
                      className="flex-shrink-0 self-start w-6 h-6 flex items-center justify-center text-ink-muted hover:text-akira-red transition-colors font-mono text-sm"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>

              {items.length > 4 && (
                <p className="px-4 py-2 text-[10px] font-mono text-ink-muted text-center border-t border-[var(--line)]">
                  + {items.length - 4} {items.length - 4 === 1 ? "outro item" : "outros itens"}
                </p>
              )}

              {/* Total */}
              <div className="px-4 py-3 border-t border-[var(--line)] flex items-center justify-between">
                <span className="eyebrow text-ink-muted text-[10px]">Total</span>
                <span className="numerals font-mono font-bold text-akira-yellow text-lg">
                  {fmt(total)}
                </span>
              </div>

              {/* CTAs */}
              <div className="px-4 pb-4 flex flex-col gap-2">
                <Link
                  href="/carrinho"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 border-2 border-akira-cyan text-akira-cyan font-bold uppercase tracking-widest text-[11px] hover:bg-akira-cyan hover:text-bg transition-all"
                >
                  Ver carrinho
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-akira-red text-ink font-bold uppercase tracking-widest text-[11px] border-2 border-ink shadow-hard hover:shadow-[6px_6px_0_var(--akira-yellow)] transition-all"
                >
                  <span>Checkout</span>
                  <span>→</span>
                </Link>
              </div>
            </>
          )}

          <style jsx>{`
            @keyframes mini-cart-pop {
              from {
                opacity: 0;
                transform: translateY(-8px) scale(0.98);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
            .mini-cart-pop {
              animation: mini-cart-pop 200ms cubic-bezier(0.2, 0.9, 0.3, 1.1) both;
              transform-origin: top right;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
