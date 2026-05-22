"use client";

import { useRef } from "react";
import MangaCard from "./MangaCard";
import type { MangaCardData } from "@/lib/manga-api";

type Accent = "red" | "cyan" | "pink" | "yellow" | "violet" | "green";

type Props = {
  title: string;
  subtitle?: string;
  jpTitle?: string;
  mangas: MangaCardData[];
  accent?: Accent;
  size?: "sm" | "md" | "lg";
  zone?: boolean; // se true, aplica bg colorido como section
};

const ACCENT_CLASSES: Record<Accent, { text: string; glow: string; bar: string; zone: string }> = {
  red:    { text: "text-akira-red",    glow: "glow-red",    bar: "bg-akira-red",    zone: "bg-zone-red" },
  cyan:   { text: "text-akira-cyan",   glow: "glow-cyan",   bar: "bg-akira-cyan",   zone: "bg-zone-cyan" },
  pink:   { text: "text-akira-pink",   glow: "glow-pink",   bar: "bg-akira-pink",   zone: "bg-zone-pink" },
  yellow: { text: "text-akira-yellow", glow: "glow-yellow", bar: "bg-akira-yellow", zone: "bg-zone-yellow" },
  violet: { text: "text-akira-violet", glow: "glow-violet", bar: "bg-akira-violet", zone: "bg-zone-violet" },
  green:  { text: "text-akira-green",  glow: "glow-green",  bar: "bg-akira-green",  zone: "bg-zone-green" },
};

export default function MangaCarousel({
  title,
  subtitle,
  jpTitle,
  mangas,
  accent = "red",
  size = "md",
  zone = true,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const c = ACCENT_CLASSES[accent];

  const scroll = (direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (mangas.length === 0) {
    return (
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="eyebrow text-ink-muted">{title}</p>
          <p className="mt-2 text-ink-muted text-sm">Nenhum manga encontrado.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative py-16 md:py-24 border-b border-[var(--line-2)] ${zone ? c.zone : ""}`}>
      {/* Halftone overlay */}
      <div className="absolute inset-0 halftone opacity-30 pointer-events-none" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 mb-10 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className={`block w-1.5 h-8 ${c.bar} shadow-hard`} style={{ boxShadow: `3px 3px 0 var(--ink)` }} />
            <p className="eyebrow">{title}</p>
            {jpTitle && <span className={`jp text-base ${c.text} ${c.glow}`}>{jpTitle}</span>}
          </div>
          {subtitle && (
            <h2 className={`display text-4xl md:text-6xl ${c.text} ${c.glow}`}>
              {subtitle}
            </h2>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className={`w-12 h-12 border-2 ${c.text} flex items-center justify-center hover:bg-current transition-colors group`}
            style={{ borderColor: "currentColor" }}
          >
            <span className="group-hover:text-bg text-lg">←</span>
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className={`w-12 h-12 border-2 ${c.text} flex items-center justify-center hover:bg-current transition-colors group`}
          >
            <span className="group-hover:text-bg text-lg">→</span>
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="relative no-scrollbar overflow-x-auto pb-4 pl-4 md:pl-8 scroll-smooth"
      >
        <div className="flex gap-5 md:gap-7 w-max pr-4 md:pr-8">
          {mangas.map((manga) => (
            <MangaCard key={manga.id} manga={manga} size={size} />
          ))}
        </div>
      </div>
    </section>
  );
}
