"use client";

/**
 * Input com autocomplete pra escolher 1 manga.
 * Reutiliza /api/manga/search e mantem state externo via onPick(id, title).
 *
 * Visual: estilo dueling card — borda grande com side color.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { MangaCardData } from "@/lib/manga-api";

type Props = {
  side: "a" | "b";
  initialTitle?: string;
  selectedId: number | null;
  onPick: (id: number | null, title: string) => void;
};

const SIDE_STYLES = {
  a: {
    accent: "border-akira-red focus-within:shadow-[8px_8px_0_var(--akira-red)]",
    label: "text-akira-red glow-red",
    chip: "bg-akira-red text-ink",
    jp: "選手A",
  },
  b: {
    accent: "border-akira-cyan focus-within:shadow-[8px_8px_0_var(--akira-cyan)]",
    label: "text-akira-cyan glow-cyan",
    chip: "bg-akira-cyan text-bg",
    jp: "選手B",
  },
} as const;

export default function MangaPickerInput({
  side,
  initialTitle = "",
  selectedId,
  onPick,
}: Props) {
  const cfg = SIDE_STYLES[side];
  const [query, setQuery] = useState(initialTitle);
  const [suggestions, setSuggestions] = useState<MangaCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (selectedId) return; // ja escolhido — nao buscar
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/manga/search?q=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();
        setSuggestions(data.results || []);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selectedId]);

  const pick = (m: MangaCardData) => {
    onPick(m.id, m.title);
    setQuery(m.title);
    setSuggestions([]);
    setFocused(false);
  };

  const clear = () => {
    onPick(null, "");
    setQuery("");
    setSuggestions([]);
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-3 mb-3">
        <span className="jp text-2xl font-black" aria-hidden>
          {cfg.jp}
        </span>
        <p className={`eyebrow ${cfg.label}`}>{side === "a" ? "Fighter A" : "Fighter B"}</p>
      </div>

      <div className="relative">
        <div
          className={`flex items-center gap-2 border-2 ${cfg.accent} bg-bg-2 transition-all`}
        >
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              // mudou texto -> invalida selecao
              if (selectedId) onPick(null, e.target.value);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Berserk, Vagabond, Akira..."
            className="flex-1 px-4 py-4 bg-transparent text-ink text-base font-mono placeholder:text-ink-muted focus:outline-none"
            autoComplete="off"
          />
          {selectedId && (
            <button
              type="button"
              onClick={clear}
              className="px-3 text-ink-muted hover:text-akira-red font-mono text-lg"
              aria-label="Limpar selecao"
            >
              ×
            </button>
          )}
        </div>

        {selectedId && (
          <p className="mt-2 flex items-center gap-2 text-xs font-mono">
            <span className={`px-2 py-0.5 ${cfg.chip} font-bold`}>SELECIONADO</span>
            <span className="text-ink-muted">ID #{selectedId}</span>
          </p>
        )}

        {focused && !selectedId && (suggestions.length > 0 || loading) && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-bg-2 border-2 border-ink shadow-hard-lg max-h-[420px] overflow-y-auto">
            {loading && (
              <div className="px-4 py-3 text-xs font-mono text-ink-muted flex items-center gap-2">
                <span className="pulse-neon w-2 h-2 bg-akira-cyan rounded-full" />
                <span>Buscando...</span>
              </div>
            )}
            {suggestions.map((s) => (
              <button
                type="button"
                key={s.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(s);
                }}
                className="w-full text-left px-3 py-2 border-b border-[var(--line)] hover:bg-bg-3 transition-colors flex items-center gap-3 group"
              >
                <div className="w-10 h-14 flex-shrink-0 overflow-hidden border border-ink bg-bg-3">
                  {s.cover && (
                    <Image
                      src={s.cover}
                      alt={s.title}
                      width={40}
                      height={56}
                      unoptimized
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm text-ink truncate group-hover:text-akira-yellow transition-colors">
                    {s.title}
                  </p>
                  <p className="text-[10px] text-ink-muted font-mono truncate">
                    {s.author || "—"} {s.score ? `· ★ ${s.score.toFixed(2)}` : ""}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
