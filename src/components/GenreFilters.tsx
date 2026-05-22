"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";

// Jikan genre IDs
const GENRES = [
  { id: null,  name: "Todos",       jp: "全て",  accent: "ink" as const },
  { id: 1,     name: "Action",      jp: "アクション", accent: "red" as const },
  { id: 2,     name: "Adventure",   jp: "冒険",   accent: "yellow" as const },
  { id: 4,     name: "Comedy",      jp: "コメディ", accent: "pink" as const },
  { id: 8,     name: "Drama",       jp: "ドラマ", accent: "violet" as const },
  { id: 10,    name: "Fantasy",     jp: "幻想",   accent: "violet" as const },
  { id: 14,    name: "Horror",      jp: "恐怖",   accent: "red" as const },
  { id: 22,    name: "Romance",     jp: "恋愛",   accent: "pink" as const },
  { id: 24,    name: "Sci-Fi",      jp: "SF",     accent: "cyan" as const },
  { id: 7,     name: "Mystery",     jp: "謎",     accent: "cyan" as const },
  { id: 36,    name: "Slice",       jp: "日常",   accent: "green" as const },
];

const DEMOGRAPHICS = [
  { id: 27, name: "Shounen", jp: "少年", accent: "yellow" as const },
  { id: 42, name: "Seinen",  jp: "青年", accent: "cyan" as const },
  { id: 25, name: "Shoujo",  jp: "少女", accent: "pink" as const },
  { id: 43, name: "Josei",   jp: "女性", accent: "violet" as const },
  { id: 15, name: "Kids",    jp: "子供", accent: "green" as const },
];

const ACCENT_BG: Record<string, string> = {
  red: "bg-akira-red text-ink border-akira-red",
  cyan: "bg-akira-cyan text-bg border-akira-cyan",
  pink: "bg-akira-pink text-bg border-akira-pink",
  yellow: "bg-akira-yellow text-bg border-akira-yellow",
  violet: "bg-akira-violet text-ink border-akira-violet",
  green: "bg-akira-green text-bg border-akira-green",
  ink: "bg-ink text-bg border-ink",
};

const ACCENT_OUTLINE: Record<string, string> = {
  red: "border-akira-red text-akira-red hover:bg-akira-red hover:text-ink",
  cyan: "border-akira-cyan text-akira-cyan hover:bg-akira-cyan hover:text-bg",
  pink: "border-akira-pink text-akira-pink hover:bg-akira-pink hover:text-bg",
  yellow: "border-akira-yellow text-akira-yellow hover:bg-akira-yellow hover:text-bg",
  violet: "border-akira-violet text-akira-violet hover:bg-akira-violet hover:text-ink",
  green: "border-akira-green text-akira-green hover:bg-akira-green hover:text-bg",
  ink: "border-[var(--line)] text-ink-soft hover:bg-ink-soft hover:text-bg",
};

const STATUS_PILLS = [
  { value: "publishing", label: "Publicando", jp: "連載", accent: "cyan" as const },
  { value: "finished",   label: "Finalizado", jp: "完結", accent: "violet" as const },
  { value: "hiatus",     label: "Hiatus",     jp: "休止", accent: "yellow" as const },
];

const TYPE_PILLS = [
  { value: "manga",  label: "Manga",  jp: "漫画", accent: "red" as const },
  { value: "manhwa", label: "Manhwa", jp: "한국", accent: "cyan" as const },
  { value: "manhua", label: "Manhua", jp: "中文", accent: "yellow" as const },
  { value: "novel",  label: "Novel",  jp: "小説", accent: "violet" as const },
];

const ORDER_OPTIONS = [
  { value: "score",       label: "Score" },
  { value: "popularity",  label: "Popularidade" },
  { value: "favorites",   label: "Favoritos" },
  { value: "start_date",  label: "Data de inicio" },
  { value: "chapters",    label: "Numero de capitulos" },
];

export default function GenreFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const currentGenre = sp.get("genre");
  const currentQuery = sp.get("q") || "";

  // Estado local do form avancado
  const [status, setStatus] = useState<string>(sp.get("status") ?? "");
  const [yearFrom, setYearFrom] = useState<string>(sp.get("year_from") ?? "");
  const [yearTo, setYearTo] = useState<string>(sp.get("year_to") ?? "");
  const [scoreMin, setScoreMin] = useState<string>(sp.get("score_min") ?? "0");
  const [volumesMin, setVolumesMin] = useState<string>(sp.get("volumes_min") ?? "");
  const [volumesMax, setVolumesMax] = useState<string>(sp.get("volumes_max") ?? "");
  const [type, setType] = useState<string>(sp.get("type") ?? "");
  const [orderBy, setOrderBy] = useState<string>(sp.get("order_by") ?? "");
  const [expanded, setExpanded] = useState<boolean>(false);

  // Conta quantos filtros avancados estao ativos na URL atual
  const activeAdvancedCount = useMemo(() => {
    let n = 0;
    if (sp.get("status")) n++;
    if (sp.get("year_from") || sp.get("year_to")) n++;
    if (sp.get("score_min") && parseFloat(sp.get("score_min")!) > 0) n++;
    if (sp.get("volumes_min") || sp.get("volumes_max")) n++;
    if (sp.get("type")) n++;
    if (sp.get("order_by")) n++;
    return n;
  }, [sp]);

  const currentYear = new Date().getFullYear();

  const buildHref = (genreId: number | null) => {
    const p = new URLSearchParams(sp.toString());
    if (currentQuery) p.set("q", currentQuery);
    if (genreId !== null) p.set("genre", String(genreId));
    else p.delete("genre");
    return `/busca?${p.toString()}`;
  };

  const applyAdvanced = () => {
    const p = new URLSearchParams(sp.toString());
    // Mantem q e genre
    const setOrDel = (k: string, v: string) => {
      if (v && v.trim() !== "" && v !== "0") p.set(k, v.trim());
      else p.delete(k);
    };
    setOrDel("status", status);
    setOrDel("year_from", yearFrom);
    setOrDel("year_to", yearTo);
    // score_min so se > 0
    if (scoreMin && parseFloat(scoreMin) > 0) p.set("score_min", scoreMin);
    else p.delete("score_min");
    setOrDel("volumes_min", volumesMin);
    setOrDel("volumes_max", volumesMax);
    setOrDel("type", type);
    setOrDel("order_by", orderBy);
    if (orderBy) p.set("sort", "desc");
    else p.delete("sort");
    router.push(`/busca?${p.toString()}`);
  };

  const clearAdvanced = () => {
    setStatus("");
    setYearFrom("");
    setYearTo("");
    setScoreMin("0");
    setVolumesMin("");
    setVolumesMax("");
    setType("");
    setOrderBy("");
    const p = new URLSearchParams();
    if (currentQuery) p.set("q", currentQuery);
    if (currentGenre) p.set("genre", currentGenre);
    router.push(`/busca?${p.toString()}`);
  };

  return (
    <aside className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="block w-1 h-5 bg-akira-cyan shadow-[2px_2px_0_var(--ink)]" />
          <p className="eyebrow text-akira-cyan glow-cyan">Demographics / 読者層</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {DEMOGRAPHICS.map((d) => {
            const active = currentGenre === String(d.id);
            return (
              <Link
                key={d.id}
                href={buildHref(d.id)}
                className={`px-3 py-2 border-2 font-mono text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                  active ? ACCENT_BG[d.accent] : ACCENT_OUTLINE[d.accent]
                }`}
              >
                <span className="jp text-sm font-bold">{d.jp}</span>
                <span>{d.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="block w-1 h-5 bg-akira-yellow shadow-[2px_2px_0_var(--ink)]" />
          <p className="eyebrow text-akira-yellow glow-yellow">Generos / 種類</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => {
            const active = (g.id === null && !currentGenre) || currentGenre === String(g.id);
            return (
              <Link
                key={g.name}
                href={buildHref(g.id)}
                className={`px-3 py-2 border-2 font-mono text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                  active ? ACCENT_BG[g.accent] : ACCENT_OUTLINE[g.accent]
                }`}
              >
                <span className="jp text-sm font-bold">{g.jp}</span>
                <span>{g.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Filtros avancados (colapsavel) */}
      <div className="border-t border-[var(--line)] pt-6">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between gap-3 group"
          aria-expanded={expanded}
        >
          <span className="flex items-center gap-3">
            <span className="block w-1 h-5 bg-akira-red shadow-[2px_2px_0_var(--ink)]" />
            <span className="eyebrow text-akira-red glow-red">
              Filtros avancados / 詳細
            </span>
          </span>
          <span className="flex items-center gap-2">
            {activeAdvancedCount > 0 && (
              <span className="px-2 py-0.5 bg-akira-red text-ink text-[10px] font-mono font-bold border border-ink">
                {activeAdvancedCount}
              </span>
            )}
            <span className="text-akira-red font-mono text-sm">
              {expanded ? "—" : "+"}
            </span>
          </span>
        </button>

        {expanded && (
          <div className="mt-5 space-y-6">
            {/* Status */}
            <div>
              <p className="eyebrow text-ink-muted mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_PILLS.map((s) => {
                  const active = status === s.value;
                  return (
                    <button
                      type="button"
                      key={s.value}
                      onClick={() => setStatus(active ? "" : s.value)}
                      className={`px-3 py-1.5 border-2 font-mono text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                        active ? ACCENT_BG[s.accent] : ACCENT_OUTLINE[s.accent]
                      }`}
                    >
                      <span className="jp text-xs font-bold">{s.jp}</span>
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Type */}
            <div>
              <p className="eyebrow text-ink-muted mb-2">Tipo</p>
              <div className="flex flex-wrap gap-2">
                {TYPE_PILLS.map((t) => {
                  const active = type === t.value;
                  return (
                    <button
                      type="button"
                      key={t.value}
                      onClick={() => setType(active ? "" : t.value)}
                      className={`px-3 py-1.5 border-2 font-mono text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                        active ? ACCENT_BG[t.accent] : ACCENT_OUTLINE[t.accent]
                      }`}
                    >
                      <span className="jp text-xs font-bold">{t.jp}</span>
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ano range */}
            <div>
              <p className="eyebrow text-ink-muted mb-2">Ano de inicio</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                  placeholder="1990"
                  min={1900}
                  max={currentYear}
                  className="w-full px-3 py-2 bg-bg-2 border-2 border-[var(--line)] focus:border-akira-cyan focus:outline-none font-mono text-sm text-ink"
                />
                <span className="text-ink-muted font-mono text-xs">—</span>
                <input
                  type="number"
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                  placeholder={String(currentYear)}
                  min={1900}
                  max={currentYear}
                  className="w-full px-3 py-2 bg-bg-2 border-2 border-[var(--line)] focus:border-akira-cyan focus:outline-none font-mono text-sm text-ink"
                />
              </div>
            </div>

            {/* Score min slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="eyebrow text-ink-muted">Score minimo</p>
                <span className="font-mono text-sm text-akira-cyan numerals">
                  ★ {parseFloat(scoreMin || "0").toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={scoreMin}
                onChange={(e) => setScoreMin(e.target.value)}
                className="w-full accent-akira-red"
              />
              <div className="flex justify-between text-[10px] font-mono text-ink-muted mt-1">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            {/* Volumes range */}
            <div>
              <p className="eyebrow text-ink-muted mb-2">Volumes</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={volumesMin}
                  onChange={(e) => setVolumesMin(e.target.value)}
                  placeholder="min"
                  min={0}
                  className="w-full px-3 py-2 bg-bg-2 border-2 border-[var(--line)] focus:border-akira-green focus:outline-none font-mono text-sm text-ink"
                />
                <span className="text-ink-muted font-mono text-xs">—</span>
                <input
                  type="number"
                  value={volumesMax}
                  onChange={(e) => setVolumesMax(e.target.value)}
                  placeholder="max"
                  min={0}
                  className="w-full px-3 py-2 bg-bg-2 border-2 border-[var(--line)] focus:border-akira-green focus:outline-none font-mono text-sm text-ink"
                />
              </div>
            </div>

            {/* Ordenar por */}
            <div>
              <p className="eyebrow text-ink-muted mb-2">Ordenar por</p>
              <select
                value={orderBy}
                onChange={(e) => setOrderBy(e.target.value)}
                className="w-full px-3 py-2 bg-bg-2 border-2 border-[var(--line)] focus:border-akira-violet focus:outline-none font-mono text-sm text-ink"
              >
                <option value="">Padrao (relevancia)</option>
                {ORDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Acoes */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={applyAdvanced}
                className="w-full px-4 py-3 bg-akira-red text-ink border-2 border-ink shadow-hard hover:shadow-hard-lg font-bold uppercase tracking-widest text-xs transition-all"
              >
                Aplicar filtros
              </button>
              <button
                type="button"
                onClick={clearAdvanced}
                className="w-full px-4 py-2 border-2 border-[var(--line)] text-ink-muted hover:text-akira-red hover:border-akira-red font-mono text-xs uppercase tracking-widest transition-colors"
              >
                Limpar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-[var(--line)]">
        <p className="eyebrow text-ink-muted mb-3">Powered by</p>
        <p className="text-sm text-ink-soft font-mono">
          Jikan API v4 · <span className="text-akira-red">MyAnimeList</span>
        </p>
        <p className="text-xs text-ink-muted mt-1 font-mono">
          55.000+ series · cache 1h
        </p>
      </div>
    </aside>
  );
}
