"use client";

// CollectionCards — modo medio (similar a estante atual, mas com info extra)

import Image from "next/image";
import type { CollectionItem } from "@/app/conta/colecao/page";

const STATUS_LABEL: Record<string, string> = {
  reading: "LENDO",
  owned: "TENHO",
  wishlist: "WISHLIST",
};
const STATUS_COLOR: Record<string, string> = {
  reading: "var(--akira-yellow)",
  owned: "var(--akira-green)",
  wishlist: "var(--akira-pink)",
};

type Props = {
  items: CollectionItem[];
  onPick: (i: CollectionItem) => void;
};

export default function CollectionCards({ items, onPick }: Props) {
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map((item) => {
        const c = STATUS_COLOR[item.status];
        return (
          <li key={item.id} className="card-lift">
            <button
              onClick={() => onPick(item)}
              className="block w-full text-left border-[2px] border-[var(--ink)] bg-[var(--bg-2)] shadow-hard hover:shadow-[6px_6px_0_var(--akira-red)] transition-all group"
            >
              <div className="relative aspect-[2/3] overflow-hidden">
                {item.cover ? (
                  <Image
                    src={item.cover}
                    alt={item.title}
                    fill
                    sizes="(max-width:768px) 50vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-3)]">
                    <span className="jp text-5xl text-[var(--akira-red)]/40">本</span>
                  </div>
                )}
                <span
                  className="absolute top-2 left-2 px-2 py-1 border border-[var(--ink)] shadow-[2px_2px_0_var(--ink)] font-mono text-[9px] uppercase tracking-widest text-[var(--bg)]"
                  style={{ background: c }}
                >
                  {STATUS_LABEL[item.status]}
                </span>
              </div>

              <div className="p-3 border-t-2 border-[var(--line)] space-y-1">
                <p className="display text-sm text-[var(--ink)] line-clamp-2 leading-tight">
                  {item.title}
                </p>
                <div className="flex items-center justify-between font-mono text-[10px] text-[var(--ink-muted)] uppercase">
                  <span>{item.genre}</span>
                  <span className="text-[var(--akira-cyan)] numerals">★ {item.pseudoScore}</span>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
