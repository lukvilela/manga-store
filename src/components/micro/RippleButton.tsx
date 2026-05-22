"use client";

import { useRef, type ButtonHTMLAttributes, type MouseEvent } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  rippleColor?: string;
};

/**
 * Botao com ripple effect on click — CSS-only, sem libs.
 * Spawna um <span> circular no ponto do clique e remove ao fim da animacao.
 * Combina com qualquer classe (ja vem com layout neutro pra herdar do parent).
 */
export default function RippleButton({
  children,
  rippleColor = "rgba(255, 31, 63, 0.45)",
  className = "",
  onClick,
  ...rest
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    const btn = ref.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement("span");
      ripple.className = "ripple-fx";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.background = rippleColor;
      btn.appendChild(ripple);
      // Cleanup pos-animacao (600ms)
      setTimeout(() => ripple.remove(), 650);
    }
    onClick?.(e);
  }

  return (
    <button
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </button>
  );
}
