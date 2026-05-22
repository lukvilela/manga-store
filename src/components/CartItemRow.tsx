"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart, type CartItem } from "@/context/CartContext";
import { getMangaColor, getMangaColorAlpha } from "@/lib/manga-colors";

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type Props = {
  item: CartItem;
};

/**
 * Linha de item do carrinho — visual cartao vintage com border ink + shadow-hard.
 *
 * Reutiliza useCart pra update/remove (sem state local de quantity, source of truth
 * fica no context). Botoes "Salvar pra depois" sao mock visual (sem persistencia).
 */
export default function CartItemRow({ item }: Props) {
  const { update, remove } = useCart();
  const [saved, setSaved] = useState(false);

  // Cor dominante por serie pra dar identidade visual
  const color = useMemo(() => getMangaColor(item.seriesSlug || item.seriesTitle), [item.seriesSlug, item.seriesTitle]);
  const colorSoft = useMemo(
    () => getMangaColorAlpha(item.seriesSlug || item.seriesTitle, 0.55),
    [item.seriesSlug, item.seriesTitle]
  );

  // Timestamp mock "ha X min" — index do item ja deterministic via volumeId hash
  const minutosAtras = useMemo(() => {
    let h = 0;
    for (let i = 0; i < item.volumeId.length; i++) h = (h * 31 + item.volumeId.charCodeAt(i)) | 0;
    return (Math.abs(h) % 28) + 2;
  }, [item.volumeId]);

  const subtotal = item.price * item.quantity;
  const numero = String(item.volumeNumber).padStart(2, "0");

  return (
    <article
      className="relative bg-bg-2 border-2 border-ink shadow-hard hover:shadow-hard-lg transition-all duration-300 group"
    >
      {/* Faixa lateral colorida — identidade da serie */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ background: `linear-gradient(180deg, ${color}, ${colorSoft})` }}
        aria-hidden
      />

      <div className="flex flex-col md:flex-row gap-4 md:gap-5 p-4 md:p-5 pl-5 md:pl-6">
        {/* Capa */}
        <Link href={`/volume/${item.volumeId}`} className="shrink-0 self-start mx-auto md:mx-0 block">
          <div
            className="relative h-44 w-32 md:h-40 md:w-28 border-2 border-ink overflow-hidden shadow-hard group-hover:shadow-hard-lg transition-all"
            style={{ background: color }}
          >
            <Image
              src={item.coverImage}
              alt={`${item.seriesTitle} Vol. ${numero}`}
              fill
              sizes="128px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/90 to-transparent" />
            <div className="absolute bottom-1 left-1 right-1 flex items-end justify-between">
              <span className="jp text-[10px] text-white/80 font-bold">巻</span>
              <span className="display text-xl text-white leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]">
                {numero}
              </span>
            </div>
          </div>
        </Link>

        {/* Conteudo */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Topo: titulo + remover */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="eyebrow text-akira-yellow mb-1">
                巻 · VOLUME {numero}
              </p>
              <Link
                href={`/serie/${item.seriesSlug}`}
                className="display text-2xl md:text-3xl text-ink leading-[0.95] hover:text-akira-red transition-colors block truncate"
              >
                {item.seriesTitle}
              </Link>
              <p className="mt-1 text-xs font-mono text-ink-muted truncate">
                {item.seriesTitle} · Vol. {numero}
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove(item.volumeId)}
              aria-label="Remover do carrinho"
              title="Remover"
              className="shrink-0 w-9 h-9 flex items-center justify-center border-2 border-ink bg-bg text-ink-soft hover:bg-akira-red hover:text-ink hover:border-akira-red transition-all shadow-hard"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>

          {/* Selos de "loja de verdade" */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-widest">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-akira-red/15 border border-akira-red/40 text-akira-red">
              <span className="w-1.5 h-1.5 rounded-full bg-akira-red pulse-neon" />
              Reservado · 30 min
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-bg border border-line text-ink-muted">
              <span className="text-akira-cyan">+</span>
              Adicionado ha {minutosAtras} min
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-bg border border-line text-akira-green">
              ● Em estoque
            </span>
          </div>

          {/* Bottom row: quantity + preco */}
          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-2 border-t border-line">
            {/* Quantity selector */}
            <div className="flex items-center gap-3">
              <span className="eyebrow text-ink-muted">QTD</span>
              <div className="inline-flex items-stretch border-2 border-ink shadow-hard bg-bg">
                <button
                  type="button"
                  onClick={() => update(item.volumeId, item.quantity - 1)}
                  aria-label="Diminuir quantidade"
                  className="w-9 h-9 flex items-center justify-center text-ink hover:bg-akira-red hover:text-ink transition-colors font-bold"
                  disabled={item.quantity <= 1}
                >
                  −
                </button>
                <span className="w-12 h-9 flex items-center justify-center font-mono numerals text-base text-ink border-x-2 border-ink bg-bg-2">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => update(item.volumeId, item.quantity + 1)}
                  aria-label="Aumentar quantidade"
                  className="w-9 h-9 flex items-center justify-center text-ink hover:bg-akira-red hover:text-ink transition-colors font-bold"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSaved((s) => !s)}
                className={`text-[10px] font-mono uppercase tracking-widest border border-line px-2.5 py-1.5 transition-all ${
                  saved
                    ? "bg-akira-pink/20 border-akira-pink text-akira-pink"
                    : "bg-bg text-ink-muted hover:text-akira-pink hover:border-akira-pink"
                }`}
              >
                {saved ? "♥ Salvo" : "♡ Salvar pra depois"}
              </button>
            </div>

            {/* Preco */}
            <div className="text-right">
              <p className="eyebrow text-ink-muted">
                {fmt.format(item.price)} <span className="text-akira-cyan">×</span> {item.quantity}
              </p>
              <p className="display text-2xl md:text-3xl text-akira-red glow-red numerals leading-none mt-1">
                {fmt.format(subtotal)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
