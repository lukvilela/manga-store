"use client";

// CollectionList — tabela compacta com sort por titulo, score, data

import { useState } from "react";
import Image from "next/image";
import type { CollectionItem } from "@/app/conta/colecao/page";

type SortKey = "title" | "score" | "date";

const STATUS_LABEL: Record<string, string> = {
  reading: "Lendo",
  owned: "Tenho",
  wishlist: "Wishlist",
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

export default function CollectionList({ items, onPick }: Props) {
  const [sort, setSort] = useState<SortKey>("date");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  const sorted = items.slice().sort((a, b) => {
    let cmp = 0;
    if (sort === "title") cmp = a.title.localeCompare(b.title);
    else if (sort === "score") cmp = a.pseudoScore - b.pseudoScore;
    else cmp = a.addedAt.localeCompare(b.addedAt);
    return dir === "asc" ? cmp : -cmp;
  });

  const toggle = (k: SortKey) => {
    if (sort === k) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setSort(k);
      setDir(k === "title" ? "asc" : "desc");
    }
  };

  return (
    <div className="border-[2px] border-[var(--ink)] bg-[var(--bg-2)] shadow-hard overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-[var(--line)] bg-[var(--bg-3)]">
            <th className="p-3 text-left w-16">
              <span className="font-mono text-[10px] text-[var(--ink-muted)] uppercase">Capa</span>
            </th>
            <th className="p-3 text-left">
              <SortHeader k="title" label="Titulo" current={sort} dir={dir} onToggle={toggle} />
            </th>
            <th className="p-3 text-left hidden md:table-cell">
              <span className="font-mono text-[10px] text-[var(--ink-muted)] uppercase">Status</span>
            </th>
            <th className="p-3 text-left hidden md:table-cell">
              <span className="font-mono text-[10px] text-[var(--ink-muted)] uppercase">Genero</span>
            </th>
            <th className="p-3 text-right">
              <SortHeader k="score" label="Score" current={sort} dir={dir} onToggle={toggle} />
            </th>
            <th className="p-3 text-right hidden sm:table-cell">
              <SortHeader k="date" label="Adicionado" current={sort} dir={dir} onToggle={toggle} />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">
          {sorted.map((item) => (
            <tr
              key={item.id}
              onClick={() => onPick(item)}
              className="cursor-pointer hover:bg-[var(--bg-3)] transition-colors"
            >
              <td className="p-2">
                <div className="relative w-10 h-14 border border-[var(--ink)] overflow-hidden">
                  {item.cover ? (
                    <Image
                      src={item.cover}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="40px"
                      unoptimized
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center jp text-base text-white/30 bg-[var(--bg-3)]">
                      本
                    </span>
                  )}
                </div>
              </td>
              <td className="p-3">
                <p className="display text-[var(--ink)] leading-tight line-clamp-1">{item.title}</p>
                {item.titleJp && (
                  <p className="jp text-[10px] text-[var(--ink-muted)] line-clamp-1">
                    {item.titleJp}
                  </p>
                )}
              </td>
              <td className="p-3 hidden md:table-cell">
                <span
                  className="inline-block px-2 py-0.5 border font-mono text-[9px] uppercase tracking-widest text-[var(--bg)]"
                  style={{
                    background: STATUS_COLOR[item.status],
                    borderColor: STATUS_COLOR[item.status],
                  }}
                >
                  {STATUS_LABEL[item.status]}
                </span>
              </td>
              <td className="p-3 hidden md:table-cell font-mono text-[11px] text-[var(--ink-soft)] uppercase">
                {item.genre}
              </td>
              <td className="p-3 text-right font-mono text-xs text-[var(--akira-cyan)] numerals">
                ★ {item.pseudoScore}
              </td>
              <td className="p-3 text-right hidden sm:table-cell font-mono text-[10px] text-[var(--ink-muted)] numerals">
                {new Date(item.addedAt).toLocaleDateString("pt-BR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortHeader({
  k,
  label,
  current,
  dir,
  onToggle,
}: {
  k: SortKey;
  label: string;
  current: SortKey;
  dir: "asc" | "desc";
  onToggle: (k: SortKey) => void;
}) {
  const active = current === k;
  return (
    <button
      onClick={() => onToggle(k)}
      className={`flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest transition-colors ${
        active ? "text-[var(--akira-cyan)]" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
      }`}
    >
      {label}
      <span className="text-[8px]">{active ? (dir === "asc" ? "▲" : "▼") : "⇅"}</span>
    </button>
  );
}
