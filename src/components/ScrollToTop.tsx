"use client";

import { useEffect, useState } from "react";

const THRESHOLD = 500;

/**
 * Botao flutuante que aparece apos scroll > 500px.
 * Faz scroll smooth pro topo. Estilo Akira (border ink + shadow hard).
 */
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > THRESHOLD);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
      tabIndex={visible ? 0 : -1}
      className={[
        "fixed bottom-4 left-4 z-40 inline-flex items-center justify-center",
        "w-11 h-11 bg-akira-cyan text-bg border-2 border-ink shadow-hard",
        "font-mono font-bold text-lg",
        "transition-all duration-200",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none",
        "hover:bg-akira-yellow hover:shadow-[6px_6px_0_var(--ink)] hover:-translate-y-0.5",
      ].join(" ")}
    >
      <span aria-hidden>↑</span>
    </button>
  );
}
