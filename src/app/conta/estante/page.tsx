"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  useEstante,
  type EstanteItem,
  type EstanteStatus,
} from "@/lib/estante-store";
import { searchManga } from "@/lib/manga-api";
import ShareListModal from "@/components/share/ShareListModal";

type TabDef = {
  status: EstanteStatus;
  icon: string;
  label: string;
  jp: string;
  color: string;
  emptyTitle: string;
  emptyKanji: string;
};

const TABS: TabDef[] = [
  {
    status: "reading",
    icon: "Lendo",
    label: "Lendo",
    jp: "読書中",
    color: "var(--akira-yellow)",
    emptyTitle: "SEM LENDO AGORA",
    emptyKanji: "本",
  },
  {
    status: "owned",
    icon: "Tenho",
    label: "Tenho",
    jp: "所有",
    color: "var(--akira-green)",
    emptyTitle: "ESTANTE FISICA VAZIA",
    emptyKanji: "棚",
  },
  {
    status: "wishlist",
    icon: "Wishlist",
    label: "Wishlist",
    jp: "欲しい",
    color: "var(--akira-pink)",
    emptyTitle: "LISTA DE DESEJOS VAZIA",
    emptyKanji: "夢",
  },
];

export default function EstantePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const estante = useEstante();
  const [activeTab, setActiveTab] = useState<EstanteStatus>("reading");
  const [showAdd, setShowAdd] = useState(false);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redirect=/conta/estante");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="panel-frame bg-[var(--bg-2)] p-10 text-center">
        <p className="display text-2xl text-[var(--akira-red)] glow-red pulse-neon">CARREGANDO</p>
      </div>
    );
  }

  const total = estante.count();
  const list = estante.getByStatus(activeTab);
  const tabMeta = TABS.find((t) => t.status === activeTab)!;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="border-b-2 border-[var(--line)] pb-5">
        <p className="eyebrow">Section 03 // 棚</p>
        <div className="mt-2 flex items-baseline gap-4 flex-wrap">
          <span className="display text-6xl text-[var(--akira-red)] glow-red leading-none">03</span>
          <div>
            <h2 className="display text-4xl text-[var(--ink)] leading-none">ESTANTE VIRTUAL</h2>
            <p className="jp mt-1 text-lg text-[var(--ink-soft)]">本棚</p>
          </div>
          <div className="ml-auto text-right">
            <p className="eyebrow !text-[var(--ink-muted)]">Total colecao</p>
            <p className="display text-3xl text-[var(--akira-cyan)] glow-cyan numerals leading-none">
              {total} <span className="text-lg text-[var(--ink-soft)]">manga(s)</span>
            </p>
          </div>
        </div>
      </header>

      {/* Tabs + add btn */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {TABS.map((t) => {
            const active = activeTab === t.status;
            const c = estante.count(t.status);
            return (
              <button
                key={t.status}
                onClick={() => setActiveTab(t.status)}
                className={`group flex items-center gap-3 border-[2px] px-4 py-3 transition-all ${
                  active
                    ? "border-[var(--ink)] shadow-hard"
                    : "border-[var(--line)] bg-[var(--bg-2)] hover:border-[var(--ink-soft)]"
                }`}
                style={active ? { background: t.color, color: "var(--bg)" } : undefined}
              >
                <span
                  className="jp text-xl"
                  style={{ color: active ? "var(--bg)" : t.color }}
                >
                  {t.emptyKanji}
                </span>
                <span className="display text-sm uppercase tracking-wider">{t.label}</span>
                <span
                  className={`font-mono text-[11px] numerals px-1.5 py-0.5 border ${
                    active ? "border-[var(--bg)]" : "border-[var(--line)] text-[var(--ink-muted)]"
                  }`}
                >
                  {c}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowShare(true)}
            disabled={list.length === 0}
            title={list.length === 0 ? "Adicione mangas pra compartilhar" : `Compartilhar ${list.length} item(s)`}
            className="inline-flex items-center gap-2 border-[3px] border-[var(--ink)] bg-[var(--bg-3)] text-[var(--ink)] px-4 py-3 shadow-hard hover:bg-[var(--akira-cyan)] hover:text-[var(--bg)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--bg-3)] disabled:hover:text-[var(--ink)]"
          >
            <span aria-hidden>{"🔗"}</span>
            <span className="display text-sm uppercase tracking-wider">Compartilhar</span>
            <span className="jp text-sm">共有</span>
          </button>

          <button
            onClick={() => setShowAdd(true)}
            className="shimmer inline-flex items-center gap-3 border-[3px] border-[var(--ink)] bg-[var(--akira-red)] text-[var(--ink)] px-5 py-3 shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            <span className="display text-sm uppercase tracking-wider">+ Adicionar</span>
            <span className="jp text-sm">追加</span>
          </button>
        </div>
      </div>

      {/* Grid de items */}
      {list.length === 0 ? (
        <div className="panel-frame bg-[var(--bg-2)] p-14 text-center">
          <p className="jp text-[120px] leading-none" style={{ color: `${tabMeta.color}40` }}>
            {tabMeta.emptyKanji}
          </p>
          <p className="display mt-2 text-3xl text-[var(--ink)]">{tabMeta.emptyTitle}</p>
          <p className="jp mt-2 text-base text-[var(--ink-muted)]">{tabMeta.jp}</p>
          <p className="mt-3 font-mono text-xs text-[var(--ink-muted)] uppercase">
            {">"} adicione um manga pra comecar
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-6 inline-flex items-center gap-2 border-[3px] border-[var(--ink)] bg-[var(--bg-3)] text-[var(--ink)] px-6 py-3 shadow-hard hover:bg-[var(--akira-red)] transition-all"
          >
            <span className="display text-base uppercase">+ Adicionar manga</span>
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {list.map((item) => (
            <EstanteCard
              key={item.id}
              item={item}
              onMove={(s) => estante.move(item.id, s)}
              onRemove={() => estante.remove(item.id)}
            />
          ))}
        </ul>
      )}

      {showAdd && (
        <AddMangaModal
          onClose={() => setShowAdd(false)}
          onAdd={(item, status) => {
            estante.add(item, status);
            setShowAdd(false);
            setActiveTab(status);
          }}
        />
      )}

      {showShare && (
        <ShareListModal
          items={list}
          status={activeTab}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}

function EstanteCard({
  item,
  onMove,
  onRemove,
}: {
  item: EstanteItem;
  onMove: (s: EstanteStatus) => void;
  onRemove: () => void;
}) {
  const otherTabs = TABS.filter((t) => t.status !== item.status);
  return (
    <li className="card-lift group">
      <div className="border-[2px] border-[var(--ink)] bg-[var(--bg-2)] shadow-hard">
        {/* Capa */}
        <Link href={`/manga/${item.id}`} className="block relative aspect-[2/3] overflow-hidden">
          {item.cover ? (
            <Image
              src={item.cover}
              alt={item.title}
              fill
              sizes="(max-width:768px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-3)]">
              <span className="jp text-5xl text-[var(--akira-red)]/40">本</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/95 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-2">
            <p className="display text-sm text-white line-clamp-2 leading-tight drop-shadow">
              {item.title}
            </p>
            {item.titleJp && (
              <p className="jp text-[10px] text-white/70 mt-0.5 line-clamp-1">{item.titleJp}</p>
            )}
          </div>
        </Link>

        {/* Acoes */}
        <div className="border-t-2 border-[var(--line)] p-2 space-y-1">
          <div className="flex gap-1">
            {otherTabs.map((t) => (
              <button
                key={t.status}
                onClick={() => onMove(t.status)}
                title={`Mover para ${t.label}`}
                className="flex-1 border border-[var(--line)] py-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-soft)] hover:text-[var(--bg)] transition-all"
                style={{ borderColor: t.color }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = t.color;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "";
                }}
              >
                → {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={onRemove}
            className="w-full border border-[var(--line)] py-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)] hover:border-[var(--akira-red)] hover:text-[var(--akira-red)] transition-all"
          >
            remover
          </button>
        </div>
      </div>
    </li>
  );
}

// =====================================================
// Modal de adicionar (busca Jikan)
// =====================================================
type SearchResult = {
  id: string;
  title: string;
  titleJp?: string;
  cover: string;
};

function AddMangaModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (item: SearchResult, status: EstanteStatus) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [pickedStatus, setPickedStatus] = useState<EstanteStatus>("reading");

  const runSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const data = await searchManga(query.trim(), 10);
      setResults(
        data.map((m) => ({
          id: String(m.mal_id),
          title: m.title,
          titleJp: m.title_japanese ?? undefined,
          cover: m.images?.jpg?.image_url || m.images?.webp?.image_url || "",
        }))
      );
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="panel-frame bg-[var(--bg-2)] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header modal */}
        <div className="border-b-2 border-[var(--line)] p-5 flex items-baseline justify-between gap-3">
          <div>
            <p className="eyebrow !text-[var(--akira-cyan)]">Adicionar // 追加</p>
            <p className="display text-2xl text-[var(--ink)] mt-1">BUSCAR MANGA</p>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-xs text-[var(--ink-muted)] hover:text-[var(--akira-red)] uppercase"
          >
            [ X ] fechar
          </button>
        </div>

        {/* Search bar */}
        <div className="p-5 border-b-2 border-[var(--line)] space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="Akira, Berserk, One Piece..."
              className="flex-1 border-[2px] border-[var(--line)] bg-[var(--bg-3)] px-4 py-3 font-mono text-sm text-[var(--ink)] focus:border-[var(--akira-red)] outline-none"
            />
            <button
              onClick={runSearch}
              disabled={searching}
              className="border-[2px] border-[var(--ink)] bg-[var(--akira-cyan)] text-[var(--bg)] px-5 py-3 shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-60"
            >
              <span className="display text-sm uppercase">{searching ? "..." : "Buscar"}</span>
            </button>
          </div>

          {/* Status picker */}
          <div className="flex gap-2 flex-wrap items-center">
            <span className="font-mono text-[10px] text-[var(--ink-muted)] uppercase">
              {">"} adicionar em:
            </span>
            {TABS.map((t) => {
              const active = pickedStatus === t.status;
              return (
                <button
                  key={t.status}
                  onClick={() => setPickedStatus(t.status)}
                  className={`border px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition-all ${
                    active ? "text-[var(--bg)]" : "text-[var(--ink-soft)] border-[var(--line)]"
                  }`}
                  style={
                    active
                      ? { background: t.color, borderColor: t.color }
                      : undefined
                  }
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Resultados */}
        <div className="flex-1 overflow-y-auto p-5">
          {searching && (
            <p className="font-mono text-xs text-[var(--ink-muted)] uppercase text-center pulse-neon">
              {">"} buscando...
            </p>
          )}
          {!searching && results.length === 0 && query && (
            <p className="font-mono text-xs text-[var(--ink-muted)] uppercase text-center">
              {">"} nada encontrado
            </p>
          )}
          {!searching && results.length === 0 && !query && (
            <div className="text-center">
              <p className="jp text-5xl text-[var(--akira-red)]/30">捜</p>
              <p className="font-mono text-xs text-[var(--ink-muted)] uppercase mt-2">
                {">"} digite o nome do manga e busque
              </p>
            </div>
          )}
          {!searching && results.length > 0 && (
            <ul className="space-y-2">
              {results.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 border border-[var(--line)] bg-[var(--bg-3)] p-2 hover:border-[var(--akira-red)] transition-all"
                >
                  <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden border-2 border-[var(--ink)]">
                    {r.cover && (
                      <Image src={r.cover} alt={r.title} fill className="object-cover" unoptimized />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="display text-sm text-[var(--ink)] truncate">{r.title}</p>
                    {r.titleJp && (
                      <p className="jp text-xs text-[var(--ink-muted)] truncate">{r.titleJp}</p>
                    )}
                  </div>
                  <button
                    onClick={() => onAdd(r, pickedStatus)}
                    className="border-[2px] border-[var(--ink)] bg-[var(--akira-red)] text-[var(--ink)] px-3 py-2 font-mono text-[10px] uppercase tracking-widest shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                  >
                    + add
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
