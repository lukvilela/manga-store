"use client";

// CollectionTimeline — agrupa por mes/ano de adicao

import Image from "next/image";
import type { CollectionItem } from "@/app/conta/colecao/page";

const MONTHS_PT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

type Group = {
  key: string;
  year: number;
  month: number;
  items: CollectionItem[];
};

type Props = {
  items: CollectionItem[];
  onPick: (i: CollectionItem) => void;
};

export default function CollectionTimeline({ items, onPick }: Props) {
  const groups = groupByMonth(items);

  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <section key={g.key} className="relative">
          {/* Header do mes */}
          <header className="sticky top-20 z-10 flex items-baseline gap-3 pb-3 border-b-2 border-[var(--akira-red)] bg-[var(--bg)]/95 backdrop-blur">
            <span className="display text-4xl text-[var(--akira-red)] glow-red leading-none numerals">
              {g.year}
            </span>
            <div>
              <p className="display text-xl text-[var(--ink)] leading-none">
                {MONTHS_PT[g.month]}
                <span className="text-[var(--ink-muted)]"> · {g.items.length} item(s)</span>
              </p>
              <p className="jp text-xs text-[var(--akira-cyan)] mt-1">{g.year}年</p>
            </div>
          </header>

          {/* Items do mes */}
          <ul className="mt-5 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2 stagger">
            {g.items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onPick(item)}
                  className="group relative block w-full aspect-[2/3] overflow-hidden border-[2px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)] hover:shadow-[4px_4px_0_var(--akira-cyan)] transition-all"
                  title={`${item.title} - ${new Date(item.addedAt).toLocaleDateString("pt-BR")}`}
                >
                  {item.cover ? (
                    <Image
                      src={item.cover}
                      alt={item.title}
                      fill
                      sizes="12vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-3)]">
                      <span className="jp text-2xl text-white/30">本</span>
                    </div>
                  )}
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] font-mono text-white text-center py-0.5 numerals">
                    {new Date(item.addedAt).getDate().toString().padStart(2, "0")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function groupByMonth(items: CollectionItem[]): Group[] {
  const map = new Map<string, Group>();
  items.forEach((item) => {
    const d = new Date(item.addedAt);
    const y = d.getFullYear();
    const m = d.getMonth();
    const key = `${y}-${String(m).padStart(2, "0")}`;
    if (!map.has(key)) {
      map.set(key, { key, year: y, month: m, items: [] });
    }
    map.get(key)!.items.push(item);
  });
  return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
}
