"use client";

// CollectionGrid — grid denso estilo Letterboxd watchlist
// 4 cols mobile -> 12 cols xl. Hover revela titulo + status

import Image from "next/image";
import type { CollectionItem } from "@/app/conta/colecao/page";
import { getMangaColor } from "@/lib/manga-colors";

type Props = {
  items: CollectionItem[];
  onPick: (i: CollectionItem) => void;
};

const STATUS_COLOR: Record<string, string> = {
  reading: "var(--akira-yellow)",
  owned: "var(--akira-green)",
  wishlist: "var(--akira-pink)",
};

const STATUS_KANJI: Record<string, string> = {
  reading: "読",
  owned: "所",
  wishlist: "欲",
};

export default function CollectionGrid({ items, onPick }: Props) {
  return (
    <ul
      className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2"
      aria-label={`Colecao com ${items.length} mangas`}
    >
      {items.map((item) => {
        const color = getMangaColor(item.title);
        const sColor = STATUS_COLOR[item.status];
        return (
          <li key={item.id}>
            <button
              onClick={() => onPick(item)}
              className="group relative block w-full aspect-[2/3] overflow-hidden border-[2px] border-[var(--ink)] bg-[var(--bg-3)] shadow-[2px_2px_0_var(--ink)] hover:shadow-[4px_4px_0_var(--akira-red)] transition-all"
              style={{ background: color }}
              title={item.title}
            >
              {item.cover ? (
                <Image
                  src={item.cover}
                  alt={item.title}
                  fill
                  sizes="(max-width:640px) 24vw, (max-width:1024px) 12vw, 9vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center jp text-3xl text-white/30">
                  本
                </span>
              )}

              {/* Status dot */}
              <span
                className="absolute top-1 right-1 w-3 h-3 border border-[var(--ink)] shadow-[1px_1px_0_var(--ink)]"
                style={{ background: sColor }}
                aria-hidden
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-1.5">
                <p
                  className="display text-[10px] leading-tight text-white line-clamp-2"
                  style={{ textShadow: "1px 1px 0 #000" }}
                >
                  {item.title}
                </p>
                <p className="flex items-center justify-between mt-1">
                  <span className="jp text-xs" style={{ color: sColor }}>
                    {STATUS_KANJI[item.status]}
                  </span>
                  <span className="font-mono text-[9px] text-[var(--akira-cyan)] numerals">
                    {item.pseudoScore}
                  </span>
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
