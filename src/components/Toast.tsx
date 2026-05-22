"use client";

import type { ToastItem, ToastType } from "@/context/ToastContext";

type Props = {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
};

const TYPE_STYLES: Record<
  ToastType,
  { border: string; accent: string; glow: string; icon: string; label: string }
> = {
  success: {
    border: "border-akira-green",
    accent: "text-akira-green",
    glow: "shadow-[6px_6px_0_var(--akira-green)]",
    icon: "✓",
    label: "OK",
  },
  info: {
    border: "border-akira-cyan",
    accent: "text-akira-cyan",
    glow: "shadow-[6px_6px_0_var(--akira-cyan)]",
    icon: "ℹ",
    label: "INFO",
  },
  error: {
    border: "border-akira-red",
    accent: "text-akira-red",
    glow: "shadow-[6px_6px_0_var(--akira-red)]",
    icon: "✕",
    label: "ERRO",
  },
  warning: {
    border: "border-akira-yellow",
    accent: "text-akira-yellow",
    glow: "shadow-[6px_6px_0_var(--akira-yellow)]",
    icon: "!",
    label: "AVISO",
  },
};

export default function Toast({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 max-w-[360px] w-[calc(100vw-2rem)] pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((t) => {
        const style = TYPE_STYLES[t.type];
        return (
          <div
            key={t.id}
            role="status"
            className={`toast-slide-in pointer-events-auto relative bg-bg-2 border-2 ${style.border} ${style.glow} p-4 flex items-start gap-3`}
          >
            {/* Halftone bg decorativo */}
            <div className="absolute inset-0 halftone opacity-10 pointer-events-none" aria-hidden />

            <span
              className={`relative flex-shrink-0 w-8 h-8 flex items-center justify-center border-2 border-ink ${style.accent} font-mono font-bold text-base`}
              aria-hidden
            >
              {style.icon}
            </span>

            <div className="relative flex-1 min-w-0">
              <p className={`text-[10px] font-mono uppercase tracking-widest font-bold ${style.accent}`}>
                {style.label}
              </p>
              <p className="text-sm text-ink font-medium leading-snug mt-0.5 break-words">
                {t.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              aria-label="Fechar"
              className="relative flex-shrink-0 w-6 h-6 flex items-center justify-center text-ink-muted hover:text-akira-red transition-colors font-mono text-sm"
            >
              ×
            </button>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes toast-slide-in {
          from {
            opacity: 0;
            transform: translateX(40px) translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }
        .toast-slide-in {
          animation: toast-slide-in 240ms cubic-bezier(0.2, 0.9, 0.3, 1.2) both;
        }
      `}</style>
    </div>
  );
}
