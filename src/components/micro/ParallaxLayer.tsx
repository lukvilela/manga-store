"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Forca do parallax: 0.1 = sutil, 0.5 = bem agressivo. Padrao 0.25 */
  speed?: number;
  className?: string;
};

/**
 * Wrapper que aplica translateY proporcional ao scroll.
 * Otimizado: usa requestAnimationFrame e so escreve no DOM dentro do rAF.
 * Honra prefers-reduced-motion.
 */
export default function ParallaxLayer({ children, speed = 0.25, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const tickingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          // Apenas anima quando proximo do viewport (perf)
          if (rect.bottom > -200 && rect.top < window.innerHeight + 200) {
            // Centro do elemento relativo ao centro do viewport
            const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
            const translate = centerOffset * speed * -1;
            ref.current.style.transform = `translate3d(0, ${translate.toFixed(1)}px, 0)`;
          }
        }
        tickingRef.current = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
