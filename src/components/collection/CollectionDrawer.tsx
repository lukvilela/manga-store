"use client";

// CollectionDrawer — overlay/drawer com detalhes + acoes (move/remover/ver/ler)

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import type { CollectionItem } from "@/app/conta/colecao/page";
import type { EstanteStatus } from "@/lib/estante-store";
import { getMangaColor, getMangaColorAlpha } from "@/lib/manga-colors";

type Props = {
  item: CollectionItem;
  onClose: () => void;
  onMove: (s: EstanteStatus) => void;
  onRemove: () => void;
};

const STATUS_TABS: Array<{ id: EstanteStatus; label: string; color: string; kanji: string }> = [
  { id: "reading", label: "Lendo", color: "var(--akira-yellow)", kanji: "読" },
  { id: "owned", label: "Tenho", color: "var(--akira-green)", kanji: "所" },
  { id: "wishlist", label: "Wishlist", color: "var(--akira-pink)", kanji: "欲" },
];

export default function CollectionDrawer({ item, onClose, onMove, onRemove }: Props) {
  const color = getMangaColor(item.title);
  const colorSoft = getMangaColorAlpha(item.title, 0.5);

  // Esc fecha
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md h-full overflow-y-auto border-l-[3px] border-[var(--ink)] bg-[var(--bg-2)] shadow-[-8px_0_0_var(--akira-red)]"
        style={{
          background: `radial-gradient(ellipse 100% 50% at 50% 0%, ${colorSoft} 0%, var(--bg-2) 70%)`,
        }}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-[var(--line)] bg-[var(--bg-2)]/95 backdrop-blur p-4">
          <p className="eyebrow !text-[var(--akira-cyan)]">Detalhes // 詳細</p>
          <button
            onClick={onClose}
            className="font-mono text-xs text-[var(--ink-muted)] hover:text-[var(--akira-red)] uppercase"
          >
            [ ESC ] fechar
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Capa + meta */}
          <div className="flex gap-4">
            <div
              className="relative w-32 h-48 flex-shrink-0 border-[3px] border-[var(--ink)] shadow-hard overflow-hidden"
              style={{ background: color }}
            >
              {item.cover ? (
                <Image src={item.cover} alt={item.title} fill className="object-cover" unoptimized />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center jp text-4xl text-white/40">
                  本
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="eyebrow !text-[var(--ink-muted)]">Manga · {item.id}</p>
              <h3 className="display text-xl text-[var(--ink)] leading-tight mt-1">{item.title}</h3>
              {item.titleJp && (
                <p className="jp text-sm text-[var(--akira-cyan)] mt-1 line-clamp-2">
                  {item.titleJp}
                </p>
              )}

              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                <Meta label="Genero" value={item.genre} />
                <Meta label="Score" value={`★ ${item.pseudoScore}`} accent="var(--akira-cyan)" />
                <Meta
                  label="Adicionado"
                  value={new Date(item.addedAt).toLocaleDateString("pt-BR")}
                />
                <Meta label="Status" value={item.status.toUpperCase()} />
              </div>
            </div>
          </div>

          {/* Mudar status */}
          <div>
            <p className="eyebrow !text-[var(--akira-yellow)] mb-2">Mover para</p>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_TABS.map((t) => {
                const active = item.status === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onMove(t.id)}
                    disabled={active}
                    className={`flex flex-col items-center gap-1 border-[2px] py-3 transition-all ${
                      active
                        ? "border-[var(--ink)] cursor-default"
                        : "border-[var(--line)] hover:border-[var(--ink)] hover:shadow-hard"
                    }`}
                    style={active ? { background: t.color, color: "var(--bg)" } : undefined}
                  >
                    <span
                      className="jp text-2xl"
                      style={{ color: active ? "var(--bg)" : t.color }}
                    >
                      {t.kanji}
                    </span>
                    <span className="display text-[10px] uppercase tracking-widest">
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Acoes */}
          <div className="space-y-2">
            <Link
              href={`/manga/${item.id}`}
              className="shimmer flex items-center justify-between border-[3px] border-[var(--ink)] bg-[var(--akira-cyan)] text-[var(--bg)] px-4 py-3 shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <span className="display text-sm uppercase tracking-wider">Ver pagina</span>
              <span className="jp text-base">→ 詳細</span>
            </Link>
            <Link
              href={`/manga/${item.id}/volume/1/ler`}
              className="flex items-center justify-between border-[3px] border-[var(--ink)] bg-[var(--akira-yellow)] text-[var(--bg)] px-4 py-3 shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <span className="display text-sm uppercase tracking-wider">Ler preview vol 01</span>
              <span className="jp text-base">→ 読</span>
            </Link>
            <button
              onClick={onRemove}
              className="w-full border-[2px] border-[var(--line)] bg-transparent text-[var(--ink-muted)] px-4 py-3 hover:border-[var(--akira-red)] hover:text-[var(--akira-red)] transition-all"
            >
              <span className="display text-sm uppercase tracking-wider">Remover da colecao</span>
            </button>
          </div>
        </div>

      </aside>
    </div>
  );
}

function Meta({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="border border-[var(--line)] bg-[var(--bg-3)] px-2 py-1">
      <p className="font-mono text-[9px] text-[var(--ink-muted)] uppercase tracking-widest">
        {label}
      </p>
      <p
        className="font-mono text-xs uppercase numerals truncate"
        style={{ color: accent || "var(--ink)" }}
      >
        {value}
      </p>
    </div>
  );
}
