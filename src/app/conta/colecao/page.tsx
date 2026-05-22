"use client";

// Pagina /conta/colecao
// Versao MUITO visual da estante (estilo Letterboxd watchlist).
// 4 view modes: GRID denso, CARDS medio, LISTA tabela, TIMELINE por mes.
// Filtros: status, genero pseudo-derivado, ordem.
// Click numa capa abre drawer com detalhes e acoes.

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEstante, type EstanteItem, type EstanteStatus } from "@/lib/estante-store";
import CollectionGrid from "@/components/collection/CollectionGrid";
import CollectionCards from "@/components/collection/CollectionCards";
import CollectionList from "@/components/collection/CollectionList";
import CollectionTimeline from "@/components/collection/CollectionTimeline";
import CollectionDrawer from "@/components/collection/CollectionDrawer";

type ViewMode = "grid" | "cards" | "list" | "timeline";
type StatusFilter = "all" | EstanteStatus;
type OrderBy = "recent" | "title" | "score";

const STATUS_TABS: Array<{ id: StatusFilter; label: string; jp: string; color: string }> = [
  { id: "all", label: "Tudo", jp: "全部", color: "var(--akira-cyan)" },
  { id: "reading", label: "Lendo", jp: "読書中", color: "var(--akira-yellow)" },
  { id: "owned", label: "Tenho", jp: "所有", color: "var(--akira-green)" },
  { id: "wishlist", label: "Wishlist", jp: "欲しい", color: "var(--akira-pink)" },
];

const VIEW_MODES: Array<{ id: ViewMode; label: string; kanji: string }> = [
  { id: "grid", label: "Grid", kanji: "格" },
  { id: "cards", label: "Cards", kanji: "札" },
  { id: "list", label: "Lista", kanji: "表" },
  { id: "timeline", label: "Timeline", kanji: "時" },
];

// Genero "fake" derivado deterministicamente do title.
// Como o useEstante so guarda id/title/cover, geramos uma label de genero
// previsivel pra cada title (sem hit em API).
const GENRE_POOL = [
  "Acao", "Aventura", "Drama", "Fantasia", "Horror", "Mecha",
  "Romance", "Sci-fi", "Seinen", "Shounen", "Slice", "Sobrenatural",
];
function pseudoGenre(title: string): string {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) | 0;
  return GENRE_POOL[Math.abs(h) % GENRE_POOL.length];
}
// Score pseudo entre 70 e 99 (determinstico)
function pseudoScore(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 17 + id.charCodeAt(i)) | 0;
  return 70 + (Math.abs(h) % 30);
}

export type CollectionItem = EstanteItem & {
  genre: string;
  pseudoScore: number;
};

function decorate(items: EstanteItem[]): CollectionItem[] {
  return items.map((i) => ({
    ...i,
    genre: pseudoGenre(i.title),
    pseudoScore: pseudoScore(i.id),
  }));
}

export default function ColecaoPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const estante = useEstante();

  const [view, setView] = useState<ViewMode>("grid");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [order, setOrder] = useState<OrderBy>("recent");
  const [drawerItem, setDrawerItem] = useState<CollectionItem | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redirect=/conta/colecao");
  }, [loading, user, router]);

  const decorated = useMemo(() => decorate(estante.all()), [estante]);

  const genres = useMemo(() => {
    const set = new Set<string>();
    decorated.forEach((i) => set.add(i.genre));
    return Array.from(set).sort();
  }, [decorated]);

  const filtered = useMemo(() => {
    let arr = decorated.slice();
    if (statusFilter !== "all") arr = arr.filter((i) => i.status === statusFilter);
    if (genreFilter !== "all") arr = arr.filter((i) => i.genre === genreFilter);
    if (order === "title") arr.sort((a, b) => a.title.localeCompare(b.title));
    else if (order === "score") arr.sort((a, b) => b.pseudoScore - a.pseudoScore);
    else arr.sort((a, b) => (a.addedAt < b.addedAt ? 1 : -1));
    return arr;
  }, [decorated, statusFilter, genreFilter, order]);

  // Stats
  const total = decorated.length;
  const reading = decorated.filter((i) => i.status === "reading").length;
  const owned = decorated.filter((i) => i.status === "owned").length;
  const wishlist = decorated.filter((i) => i.status === "wishlist").length;
  const completionPct = total > 0 ? Math.round((owned / total) * 100) : 0;

  // Top genero
  const topGenre = useMemo(() => {
    const tally: Record<string, number> = {};
    decorated.forEach((i) => (tally[i.genre] = (tally[i.genre] || 0) + 1));
    let best = "—";
    let max = 0;
    Object.entries(tally).forEach(([g, c]) => {
      if (c > max) {
        max = c;
        best = g;
      }
    });
    return { name: best, count: max };
  }, [decorated]);

  // Heatmap mock — 7 dias. Captura "agora" UMA VEZ no mount (lazy init de state)
  // pra manter pureza no render e nao trigar cascading renders em effect.
  const [nowMs] = useState<number>(() => Date.now());
  const heatmap = useMemo(() => {
    const counts = new Array(7).fill(0);
    decorated.forEach((i) => {
      const ts = new Date(i.addedAt).getTime();
      const diff = Math.floor((nowMs - ts) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff < 7) counts[6 - diff] += 1;
    });
    for (let d = 0; d < 7; d++) {
      counts[d] += (d * 3 + total) % 4;
    }
    const max = Math.max(...counts, 1);
    return counts.map((c) => ({ count: c, pct: c / max }));
  }, [decorated, total, nowMs]);

  if (loading || !user) {
    return (
      <div className="panel-frame bg-[var(--bg-2)] p-10 text-center">
        <p className="display text-2xl text-[var(--akira-red)] glow-red pulse-neon">CARREGANDO</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ===== HERO ===== */}
      <header className="relative panel-frame bg-[var(--bg-2)] p-6 md:p-8 overflow-hidden">
        <div className="absolute inset-0 halftone opacity-20 pointer-events-none" aria-hidden />
        <div className="bike-streak" style={{ top: "50%" }} />
        <div className="relative">
          <p className="eyebrow !text-[var(--akira-cyan)]">Section 03 // 私の作品集</p>
          <div className="mt-3 flex items-baseline gap-4 flex-wrap">
            <span className="display text-7xl md:text-8xl text-[var(--akira-red)] glow-red leading-none">
              {String(total).padStart(2, "0")}
            </span>
            <div>
              <h1 className="display text-3xl md:text-5xl text-[var(--ink)] leading-none">
                MINHA COLECAO
              </h1>
              <p className="jp mt-2 text-base md:text-xl text-[var(--ink-soft)]">私の作品集</p>
            </div>
          </div>

          {/* Stats topo */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatBox label="Total" value={total} kanji="冊" color="var(--akira-cyan)" />
            <StatBox label="Lendo" value={reading} kanji="読" color="var(--akira-yellow)" />
            <StatBox label="Tenho" value={owned} kanji="所" color="var(--akira-green)" />
            <StatBox label="Wishlist" value={wishlist} kanji="欲" color="var(--akira-pink)" />
            <CompletionBox pct={completionPct} />
          </div>

          {/* Top genero + heatmap */}
          {total > 0 && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border-[2px] border-[var(--line)] bg-[var(--bg-3)] p-3 flex items-center gap-3">
                <span className="jp text-3xl text-[var(--akira-violet)] glow-violet">流</span>
                <div className="flex-1">
                  <p className="eyebrow !text-[var(--ink-muted)]">Genero dominante</p>
                  <p className="display text-lg text-[var(--ink)]">
                    {topGenre.name}{" "}
                    <span className="font-mono text-xs text-[var(--ink-muted)] numerals">
                      ({topGenre.count})
                    </span>
                  </p>
                </div>
              </div>
              <div className="border-[2px] border-[var(--line)] bg-[var(--bg-3)] p-3">
                <p className="eyebrow !text-[var(--ink-muted)] mb-2">Atividade · 7 dias</p>
                <div className="flex items-end gap-1 h-10">
                  {heatmap.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 border border-[var(--line)] transition-all"
                      style={{
                        height: `${Math.max(8, h.pct * 100)}%`,
                        background: `rgba(0, 212, 228, ${0.2 + h.pct * 0.8})`,
                      }}
                      title={`Dia ${i + 1}: ${h.count} add(s)`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ===== Toolbar: view + filtros + ordem ===== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* View modes */}
          <div className="inline-flex border-[2px] border-[var(--ink)] shadow-hard">
            {VIEW_MODES.map((m) => {
              const active = view === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setView(m.id)}
                  className={`group flex items-center gap-2 px-3 py-2 border-r last:border-r-0 border-[var(--ink)] transition-all ${
                    active
                      ? "bg-[var(--akira-red)] text-[var(--ink)]"
                      : "bg-[var(--bg-2)] text-[var(--ink-soft)] hover:bg-[var(--bg-3)]"
                  }`}
                >
                  <span className="jp text-lg">{m.kanji}</span>
                  <span className="display text-xs uppercase tracking-wider">{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Ordem */}
          <div className="inline-flex items-center gap-2 border-[2px] border-[var(--line)] bg-[var(--bg-2)] px-3 py-2">
            <span className="font-mono text-[10px] text-[var(--ink-muted)] uppercase">
              {">"} ordem
            </span>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value as OrderBy)}
              className="bg-transparent text-[var(--ink)] font-mono text-xs uppercase outline-none"
            >
              <option value="recent">Recente</option>
              <option value="title">Titulo</option>
              <option value="score">Score</option>
            </select>
          </div>
        </div>

        {/* Status tabs + genre filter */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {STATUS_TABS.map((t) => {
              const active = statusFilter === t.id;
              const c =
                t.id === "all"
                  ? total
                  : t.id === "reading"
                    ? reading
                    : t.id === "owned"
                      ? owned
                      : wishlist;
              return (
                <button
                  key={t.id}
                  onClick={() => setStatusFilter(t.id)}
                  className={`flex items-center gap-2 border-[2px] px-3 py-2 transition-all ${
                    active
                      ? "border-[var(--ink)] shadow-hard"
                      : "border-[var(--line)] bg-[var(--bg-2)] hover:border-[var(--ink-soft)]"
                  }`}
                  style={active ? { background: t.color, color: "var(--bg)" } : undefined}
                >
                  <span className="jp text-base" style={{ color: active ? "var(--bg)" : t.color }}>
                    {t.jp.slice(0, 1)}
                  </span>
                  <span className="display text-xs uppercase tracking-wider">{t.label}</span>
                  <span
                    className={`font-mono text-[10px] numerals px-1 border ${
                      active
                        ? "border-[var(--bg)]"
                        : "border-[var(--line)] text-[var(--ink-muted)]"
                    }`}
                  >
                    {c}
                  </span>
                </button>
              );
            })}
          </div>

          {genres.length > 0 && (
            <div className="inline-flex items-center gap-2 border-[2px] border-[var(--line)] bg-[var(--bg-2)] px-3 py-2">
              <span className="font-mono text-[10px] text-[var(--ink-muted)] uppercase">
                {">"} genero
              </span>
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="bg-transparent text-[var(--ink)] font-mono text-xs uppercase outline-none"
              >
                <option value="all">Todos</option>
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ===== Conteudo ===== */}
      {filtered.length === 0 ? (
        <div className="panel-frame bg-[var(--bg-2)] p-14 text-center">
          <p className="jp text-[120px] leading-none text-[var(--akira-red)]/40">空</p>
          <p className="display mt-2 text-3xl text-[var(--ink)]">COLECAO VAZIA</p>
          <p className="font-mono text-xs text-[var(--ink-muted)] uppercase mt-3">
            {">"} ajuste o filtro ou adicione mangas pela /conta/estante
          </p>
        </div>
      ) : (
        <>
          {view === "grid" && (
            <CollectionGrid items={filtered} onPick={(i) => setDrawerItem(i)} />
          )}
          {view === "cards" && (
            <CollectionCards items={filtered} onPick={(i) => setDrawerItem(i)} />
          )}
          {view === "list" && (
            <CollectionList items={filtered} onPick={(i) => setDrawerItem(i)} />
          )}
          {view === "timeline" && (
            <CollectionTimeline items={filtered} onPick={(i) => setDrawerItem(i)} />
          )}
        </>
      )}

      {drawerItem && (
        <CollectionDrawer
          item={drawerItem}
          onClose={() => setDrawerItem(null)}
          onMove={(s) => {
            estante.move(drawerItem.id, s);
            setDrawerItem({ ...drawerItem, status: s });
          }}
          onRemove={() => {
            estante.remove(drawerItem.id);
            setDrawerItem(null);
          }}
        />
      )}
    </div>
  );
}

// ===== sub bits ===== //
function StatBox({
  label,
  value,
  kanji,
  color,
}: {
  label: string;
  value: number;
  kanji: string;
  color: string;
}) {
  return (
    <div className="border-[2px] border-[var(--line)] bg-[var(--bg-3)] p-3 flex items-center gap-3">
      <span className="jp text-3xl" style={{ color }}>
        {kanji}
      </span>
      <div className="flex-1 min-w-0">
        <p className="eyebrow !text-[var(--ink-muted)]">{label}</p>
        <p className="display text-2xl text-[var(--ink)] numerals leading-none">{value}</p>
      </div>
    </div>
  );
}

function CompletionBox({ pct }: { pct: number }) {
  // SVG circular progress estilizado
  const r = 18;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="border-[2px] border-[var(--line)] bg-[var(--bg-3)] p-3 flex items-center gap-3">
      <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
        <circle cx="24" cy="24" r={r} stroke="var(--line)" strokeWidth="4" fill="none" />
        <circle
          cx="24"
          cy="24"
          r={r}
          stroke="var(--akira-cyan)"
          strokeWidth="4"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="square"
          style={{ filter: "drop-shadow(0 0 4px var(--akira-cyan))" }}
        />
      </svg>
      <div className="flex-1">
        <p className="eyebrow !text-[var(--ink-muted)]">Completion</p>
        <p className="display text-2xl text-[var(--akira-cyan)] glow-cyan numerals leading-none">
          {pct}%
        </p>
      </div>
    </div>
  );
}
