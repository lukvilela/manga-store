"use client";

// ReaderControls — topbar + bottom nav reutilizavel
// Inclui keyboard nav ( ← → space ) + fullscreen toggle + orientation toggle

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type Orientation = "vertical" | "horizontal";

type Props = {
  mangaTitle: string;
  mangaId: number;
  volumeNumber: number;
  cover?: string | null;
  page: number;             // 1-based
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  orientation: Orientation;
  onOrientationChange: (o: Orientation) => void;
  onFinish?: () => void;    // chamado quando chega na ultima e clica next
};

export default function ReaderControls({
  mangaTitle,
  mangaId,
  volumeNumber,
  cover,
  page,
  totalPages,
  onPrev,
  onNext,
  orientation,
  onOrientationChange,
  onFinish,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const toggleFs = useCallback(() => {
    const el = containerRef.current || document.documentElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  // Keyboard nav: <- prev, -> next, space next, f fullscreen
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignora se foco em input
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      } else if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        if (page >= totalPages) {
          onFinish?.();
        } else {
          onNext();
        }
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFs();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onPrev, onNext, page, totalPages, onFinish, toggleFs]);

  // Fullscreen sync
  useEffect(() => {
    const onFsChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const volStr = String(volumeNumber).padStart(2, "0");
  const pageStr = String(page).padStart(3, "0");
  const totalStr = String(totalPages).padStart(3, "0");
  const pct = Math.min(100, Math.round((page / totalPages) * 100));

  return (
    <div ref={containerRef} className="contents">
      {/* ===== TOPBAR ===== */}
      <header className="sticky top-0 z-40 border-b-2 border-[var(--akira-red)] bg-[var(--bg-2)]/95 backdrop-blur shadow-[0_2px_0_var(--akira-red)]">
        <div className="max-w-5xl mx-auto px-3 py-2 flex items-center gap-3">
          {/* Thumb capa */}
          <Link
            href={`/manga/${mangaId}/volume/${volumeNumber}`}
            className="relative block w-10 h-14 flex-shrink-0 border-[2px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)] overflow-hidden"
            title="Voltar para volume"
          >
            {cover ? (
              <Image src={cover} alt="" fill className="object-cover" sizes="40px" unoptimized />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center jp text-base text-white/40 bg-[var(--bg-3)]">
                本
              </span>
            )}
          </Link>

          {/* Titulo + vol */}
          <div className="flex-1 min-w-0">
            <p className="display text-sm md:text-base text-[var(--ink)] leading-tight truncate">
              {mangaTitle}
            </p>
            <p className="font-mono text-[10px] text-[var(--akira-cyan)] uppercase tracking-widest mt-0.5">
              Vol {volStr} · Cap mock · 第{volumeNumber}巻
            </p>
          </div>

          {/* Toggles */}
          <button
            onClick={() => onOrientationChange(orientation === "vertical" ? "horizontal" : "vertical")}
            className="hidden md:inline-flex items-center gap-1 border-[2px] border-[var(--line)] bg-[var(--bg-3)] px-2 py-1 hover:border-[var(--akira-cyan)] transition-all"
            title={orientation === "vertical" ? "Trocar pra horizontal (swipe)" : "Trocar pra vertical (scroll)"}
          >
            <span className="font-mono text-[10px] uppercase text-[var(--ink-soft)]">
              {orientation === "vertical" ? "↕ vert" : "↔ horiz"}
            </span>
          </button>
          <button
            onClick={toggleFs}
            className="inline-flex items-center gap-1 border-[2px] border-[var(--line)] bg-[var(--bg-3)] px-2 py-1 hover:border-[var(--akira-yellow)] transition-all"
            title="Fullscreen (F)"
          >
            <span className="font-mono text-[10px] uppercase text-[var(--ink-soft)]">
              {fullscreen ? "⤢ exit" : "⤢ fs"}
            </span>
          </button>
          <Link
            href={`/manga/${mangaId}/volume/${volumeNumber}`}
            className="inline-flex items-center justify-center w-8 h-8 border-[2px] border-[var(--ink)] bg-[var(--akira-red)] text-[var(--ink)] font-mono text-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none shadow-[2px_2px_0_var(--ink)] transition-all"
            title="Fechar leitor"
            aria-label="Fechar leitor"
          >
            ✕
          </Link>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-[var(--bg-3)]">
          <div
            className="h-full bg-[var(--akira-red)] transition-all duration-300"
            style={{
              width: `${pct}%`,
              boxShadow: "0 0 8px var(--akira-red), 0 0 16px var(--akira-red-glow)",
            }}
          />
        </div>
      </header>

      {/* ===== BOTTOM NAV ===== */}
      <nav className="sticky bottom-0 z-40 border-t-2 border-[var(--akira-cyan)] bg-[var(--bg-2)]/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-3 py-2 flex items-center gap-3">
          <button
            onClick={onPrev}
            disabled={page <= 1}
            className="flex items-center gap-2 border-[2px] border-[var(--ink)] bg-[var(--bg-3)] text-[var(--ink)] px-3 py-2 shadow-[2px_2px_0_var(--ink)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="display text-xs uppercase">← Ant</span>
          </button>

          <div className="flex-1 text-center">
            <p className="display text-lg text-[var(--ink)] numerals leading-none">
              {pageStr} <span className="text-[var(--ink-muted)]">/</span>{" "}
              <span className="text-[var(--akira-yellow)] glow-yellow">{totalStr}</span>
            </p>
            <p className="font-mono text-[9px] text-[var(--ink-muted)] uppercase tracking-widest mt-0.5">
              {">"} use ← → ou espaco
            </p>
          </div>

          <button
            onClick={() => {
              if (page >= totalPages) onFinish?.();
              else onNext();
            }}
            className="flex items-center gap-2 border-[2px] border-[var(--ink)] bg-[var(--akira-yellow)] text-[var(--bg)] px-3 py-2 shadow-[2px_2px_0_var(--ink)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            <span className="display text-xs uppercase">
              {page >= totalPages ? "Concluir →" : "Prox →"}
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
