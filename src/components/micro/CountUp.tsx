"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  to: number;
  /** Duracao em ms — padrao 1400ms */
  duration?: number;
  /** Casas decimais */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Inicia somente quando entrar no viewport */
  whenVisible?: boolean;
  className?: string;
};

/**
 * Animacao de contagem progressiva com easing easeOutCubic.
 * Usa IntersectionObserver pra disparar so quando o numero aparece.
 * Honra prefers-reduced-motion (vai direto pro valor final).
 */
export default function CountUp({
  to,
  duration = 1400,
  decimals = 0,
  prefix = "",
  suffix = "",
  whenVisible = true,
  className = "",
}: Props) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // defer pra evitar setState sincrono dentro do effect (React 19 lint)
      queueMicrotask(() => setVal(to));
      return;
    }

    const animate = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        setVal(to * eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (!whenVisible || !ref.current) {
      animate();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            animate();
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.3 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [to, duration, whenVisible]);

  const display = decimals > 0
    ? val.toFixed(decimals)
    : Math.round(val).toLocaleString("pt-BR");

  return (
    <span ref={ref} className={`numerals tabular-nums ${className}`}>
      {prefix}{display}{suffix}
    </span>
  );
}
