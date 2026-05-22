"use client";

import { useRef, type ReactNode, type CSSProperties } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Forca do tilt — padrao 0.5 = ate 3deg. Aumente pra mais agressivo */
  strength?: number;
};

/**
 * Wrapper que captura posicao do mouse e atualiza --mx/--my no proprio
 * elemento. A classe .tilt-mouse (em globals.css) le essas vars pra
 * computar rotateX/rotateY com perspective.
 *
 * Tudo via CSS custom props — zero re-render no React.
 */
export default function TiltCard({ children, className = "", strength = 1 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // normaliza pra -1..1
    const mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2 * strength;
    const my = ((e.clientY - rect.top) / rect.height - 0.5) * 2 * strength;
    el.style.setProperty("--mx", mx.toFixed(3));
    el.style.setProperty("--my", my.toFixed(3));
  }

  function onMouseLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mx", "0");
    el.style.setProperty("--my", "0");
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`tilt-mouse ${className}`}
      style={{ "--mx": 0, "--my": 0 } as CSSProperties}
    >
      {children}
    </div>
  );
}
