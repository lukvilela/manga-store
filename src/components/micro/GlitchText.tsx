"use client";

import { useEffect, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Intervalo medio entre disparos de glitch (ms) — padrao 4500 */
  interval?: number;
  /** Duracao do glitch quando dispara (ms) — padrao 280 */
  glitchDuration?: number;
  className?: string;
  /** Mostra layer cyan/red duplicada pra efeito chromatic shift */
  chromatic?: boolean;
};

/**
 * Texto que glita ocasionalmente — sutil, nao agressivo.
 * Reusa a classe .glitch existente em globals.css; adiciona
 * uma camada de chromatic aberration opcional.
 *
 * Honra prefers-reduced-motion.
 */
export default function GlitchText({
  children,
  interval = 4500,
  glitchDuration = 280,
  className = "",
  chromatic = true,
}: Props) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let timeoutId: number;
    let glitchId: number;

    const schedule = () => {
      // jitter ±40% pra parecer organico
      const jitter = interval * (0.6 + Math.random() * 0.8);
      timeoutId = window.setTimeout(() => {
        setActive(true);
        glitchId = window.setTimeout(() => {
          setActive(false);
          schedule();
        }, glitchDuration);
      }, jitter);
    };
    schedule();

    return () => {
      window.clearTimeout(timeoutId);
      window.clearTimeout(glitchId);
    };
  }, [interval, glitchDuration]);

  return (
    <span
      className={`relative inline-block ${active ? "glitch-active" : ""} ${className}`}
      data-text={typeof children === "string" ? children : undefined}
    >
      <span className="relative z-10">{children}</span>
      {chromatic && active && (
        <>
          <span
            aria-hidden
            className="absolute inset-0 pointer-events-none mix-blend-screen z-0"
            style={{ color: "var(--akira-cyan)", transform: "translate(-2px, 0)" }}
          >
            {children}
          </span>
          <span
            aria-hidden
            className="absolute inset-0 pointer-events-none mix-blend-screen z-0"
            style={{ color: "var(--akira-red)", transform: "translate(2px, 0)" }}
          >
            {children}
          </span>
        </>
      )}
    </span>
  );
}
