"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { MangaCardData } from "@/lib/manga-api";
import { getMangaColor } from "@/lib/manga-colors";

type Props = { initialQuery?: string; resultsCount?: number };

export default function SearchHero({ initialQuery = "", resultsCount }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<MangaCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Live autocomplete via /api/manga/search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
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
  }, [query]);

  // Shortcut "/" pra focar input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(sp.toString());
    if (query.trim()) params.set("q", query.trim());
    else params.delete("q");
    router.push(`/busca?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden border-b border-[var(--line)] bg-zone-red">
      {/* Bg: AKIRA gigante */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" aria-hidden>
        <span className="jp text-akira-red opacity-[0.05] font-black leading-none" style={{ fontSize: "clamp(15rem, 35vw, 40rem)" }}>
          検索
        </span>
      </div>
      <div className="absolute inset-0 halftone opacity-30 pointer-events-none" aria-hidden />
      <div className="bike-streak" style={{ top: "20%" }} />

      <div className="relative max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-6">
          <span className="block w-1.5 h-8 bg-akira-red shadow-[3px_3px_0_var(--ink)]" />
          <span className="eyebrow text-akira-cyan glow-cyan">SEARCH ENGINE / 検索</span>
        </div>

        <h1 className="display text-5xl md:text-8xl leading-[0.9] mb-6">
          <span className="block">BUSCAR</span>
          <span className="block text-akira-red glow-red">AKIRA MANGÁS.</span>
        </h1>

        <p className="text-lg md:text-xl text-ink-soft max-w-2xl mb-10">
          55.000+ series indexadas via MyAnimeList. Digite o titulo, autor, ou navegue pelos generos abaixo.
        </p>

        {/* Search box */}
        <form onSubmit={submit} className="relative max-w-3xl">
          <div className="flex items-stretch gap-0 border-2 border-ink shadow-hard-lg focus-within:shadow-[12px_12px_0_var(--akira-red)] transition-all">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="Berserk, Tokyo Ghoul, Akira, Vagabond..."
              className="flex-1 px-6 py-5 bg-bg-2 text-ink text-lg font-mono placeholder:text-ink-muted focus:outline-none focus:bg-bg-3"
              type="search"
              autoComplete="off"
            />
            <button
              type="submit"
              className="px-8 py-5 bg-akira-red text-ink font-bold uppercase tracking-widest text-sm hover:bg-akira-red-glow transition-colors flex items-center gap-2"
            >
              <span className="hidden md:inline">Buscar</span>
              <span>→</span>
            </button>
          </div>

          {/* Hint shortcut */}
          <p className="mt-3 text-xs font-mono text-ink-muted">
            <span className="px-2 py-1 border border-[var(--line)] text-akira-yellow">/</span>{" "}
            atalho pra focar · <span className="text-akira-cyan">ENTER</span> pra buscar
          </p>

          {/* Autocomplete dropdown */}
          {focused && (suggestions.length > 0 || loading) && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-bg-2 border-2 border-akira-red shadow-hard-lg max-h-[480px] overflow-y-auto">
              {loading && (
                <div className="px-4 py-3 text-xs font-mono text-ink-muted flex items-center gap-2">
                  <span className="pulse-neon w-2 h-2 bg-akira-cyan rounded-full" />
                  <span>Buscando no Neo-Tokyo Network...</span>
                </div>
              )}
              {suggestions.map((s) => {
                const color = getMangaColor(s.title);
                return (
                  <Link
                    key={s.id}
                    href={`/manga/${s.id}`}
                    className="block px-4 py-3 border-b border-[var(--line)] hover:bg-bg-3 transition-colors flex items-center gap-3 group"
                    onClick={() => setFocused(false)}
                  >
                    <div
                      className="w-12 h-16 flex-shrink-0 overflow-hidden border border-ink"
                      style={{ background: color }}
                    >
                      {s.cover && (
                        <Image
                          src={s.cover}
                          alt={s.title}
                          width={48}
                          height={64}
                          unoptimized
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-base text-ink truncate group-hover:text-akira-red transition-colors">
                        {s.title}
                      </p>
                      {s.titleJp && (
                        <p className="jp text-xs text-ink-muted truncate">{s.titleJp}</p>
                      )}
                      <p className="text-xs text-ink-muted font-mono truncate">
                        {s.author || "—"} · {s.score ? `★ ${s.score.toFixed(2)}` : ""}
                      </p>
                    </div>
                    {s.rank && s.rank <= 100 && (
                      <span className="text-xs font-mono font-bold text-akira-yellow">#{s.rank}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </form>

        {/* Result count */}
        {resultsCount !== undefined && initialQuery && (
          <div className="mt-8 flex items-center gap-3 text-sm">
            <span className="eyebrow text-akira-cyan">{resultsCount} resultados</span>
            <span className="text-ink-muted">·</span>
            <span className="eyebrow">para "<span className="text-akira-yellow">{initialQuery}</span>"</span>
          </div>
        )}
      </div>
    </section>
  );
}
