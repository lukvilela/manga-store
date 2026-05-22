"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { MangaCardData } from "@/lib/manga-api";
import { getMangaColor } from "@/lib/manga-colors";

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MangaCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Autocomplete com debounce de 350ms — espelha SearchHero
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/manga/search?q=${encodeURIComponent(query)}&limit=6`,
        );
        const data = await res.json();
        setSuggestions(data.results || []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Click fora fecha sugestoes desktop
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFocused(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Autofocus do overlay mobile
  useEffect(() => {
    if (mobileOpen) {
      setTimeout(() => mobileInputRef.current?.focus(), 50);
    }
  }, [mobileOpen]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/busca?q=${encodeURIComponent(query.trim())}`);
    setFocused(false);
    setMobileOpen(false);
  };

  const renderSuggestions = (onClickItem?: () => void) => (
    <>
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
            onClick={() => {
              setFocused(false);
              setMobileOpen(false);
              onClickItem?.();
            }}
            className="block px-4 py-3 border-b border-[var(--line)] hover:bg-bg-3 transition-colors flex items-center gap-3 group"
          >
            <div
              className="w-10 h-14 flex-shrink-0 overflow-hidden border border-ink"
              style={{ background: color }}
            >
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
              <p className="font-display text-sm text-ink truncate group-hover:text-akira-red transition-colors">
                {s.title}
              </p>
              {s.titleJp && (
                <p className="jp text-[11px] text-ink-muted truncate">{s.titleJp}</p>
              )}
              <p className="text-[11px] text-ink-muted font-mono truncate">
                {s.author || "—"}
                {s.score ? ` · ★ ${s.score.toFixed(2)}` : ""}
              </p>
            </div>
            {s.rank && s.rank <= 100 && (
              <span className="text-[10px] font-mono font-bold text-akira-yellow">
                #{s.rank}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop: input inline */}
      <div ref={wrapperRef} className="hidden md:block relative flex-1 max-w-md">
        <form onSubmit={submit}>
          <div className="flex items-stretch border border-[var(--line)] bg-[var(--bg-2)] focus-within:border-akira-cyan transition-colors">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="Buscar mangas..."
              className="flex-1 px-3 py-2 bg-transparent text-ink text-sm font-mono placeholder:text-ink-muted focus:outline-none"
              type="search"
              autoComplete="off"
              aria-label="Buscar mangas"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="px-3 text-ink-muted hover:text-akira-red transition-colors flex items-center"
            >
              <span className="text-sm">🔍</span>
            </button>
          </div>

          {focused && (suggestions.length > 0 || loading) && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-bg-2 border-2 border-akira-red shadow-hard-lg max-h-[480px] overflow-y-auto">
              {renderSuggestions()}
            </div>
          )}
        </form>
      </div>

      {/* Mobile: trigger icon */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir busca"
        className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded border border-[var(--line)] bg-[var(--bg-2)] hover:border-akira-cyan hover:text-akira-cyan transition-all"
      >
        <span className="text-base">🔍</span>
      </button>

      {/* Mobile: overlay fullscreen */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[90] bg-bg/95 backdrop-blur-md flex flex-col mobile-overlay-in">
          <div className="flex items-center gap-2 p-4 border-b border-[var(--line)]">
            <form onSubmit={submit} className="flex-1 flex items-stretch border-2 border-akira-red shadow-hard bg-bg-2">
              <input
                ref={mobileInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar mangas..."
                className="flex-1 px-3 py-3 bg-transparent text-ink text-base font-mono placeholder:text-ink-muted focus:outline-none"
                type="search"
                autoComplete="off"
                aria-label="Buscar mangas"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="px-4 bg-akira-red text-ink font-bold"
              >
                →
              </button>
            </form>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Fechar busca"
              className="px-3 py-2 text-ink-muted hover:text-akira-red transition-colors font-mono text-sm uppercase tracking-widest"
            >
              Fechar
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {query.trim().length < 2 ? (
              <div className="px-6 py-12 text-center">
                <p className="jp text-akira-red text-6xl font-black glow-red mb-3">
                  検索
                </p>
                <p className="text-sm text-ink-soft">
                  Digite ao menos 2 caracteres para buscar
                </p>
              </div>
            ) : (
              renderSuggestions()
            )}
          </div>

          <style jsx>{`
            @keyframes mobile-overlay-in {
              from {
                opacity: 0;
                transform: translateY(-12px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .mobile-overlay-in {
              animation: mobile-overlay-in 200ms ease-out both;
            }
          `}</style>
        </div>
      )}
    </>
  );
}
