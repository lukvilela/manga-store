"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";

const TRIGGER = "kamehameha";

/**
 * Listener global que escuta o que esta sendo digitado em qualquer
 * input/textarea/contenteditable. Quando detecta "kamehameha", dispara
 * uma animacao fullscreen de ~3s e mostra um toast decorativo.
 *
 * Buffer rolante de 12 chars; reseta a cada blur ou Escape.
 */
export default function KamehamehaEffect() {
  const [firing, setFiring] = useState(false);
  const { show } = useToast();

  const fire = useCallback(() => {
    setFiring(true);
    show("KA-ME-HA-ME-HAAA! +5% off no proximo carrinho", "success", 3200);
    window.setTimeout(() => setFiring(false), 3000);
  }, [show]);

  useEffect(() => {
    let buf = "";

    const reset = () => {
      buf = "";
    };

    const onInput = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName;
      const isEditable =
        tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
      if (!isEditable) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const val: string = ((target as any).value ?? target.textContent ?? "") as string;
      // Concat dos ultimos chars + valor atual, mantemos rolling window
      buf = (buf + val).toLowerCase().slice(-32);

      if (buf.includes(TRIGGER)) {
        reset();
        fire();
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") reset();
    };

    document.addEventListener("input", onInput, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [fire]);

  if (!firing) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center overflow-hidden"
    >
      {/* Onda de energia */}
      <div className="kame-wave" />
      {/* Esfera central */}
      <div className="kame-orb" />
      {/* Texto */}
      <span className="kame-text jp">かめはめ波</span>

      <style jsx>{`
        @keyframes kame-orb-grow {
          0% {
            transform: scale(0);
            opacity: 0;
            box-shadow: 0 0 0 rgba(0, 212, 228, 0);
          }
          25% {
            transform: scale(0.6);
            opacity: 1;
            box-shadow:
              0 0 60px rgba(0, 212, 228, 0.9),
              0 0 140px rgba(255, 255, 255, 0.7);
          }
          70% {
            transform: scale(2.4);
            opacity: 0.95;
            box-shadow:
              0 0 120px rgba(0, 212, 228, 1),
              0 0 320px rgba(255, 255, 255, 0.9);
          }
          100% {
            transform: scale(6);
            opacity: 0;
            box-shadow: 0 0 0 rgba(0, 212, 228, 0);
          }
        }
        @keyframes kame-wave-go {
          0% {
            transform: translateX(-100%) scaleY(0.3);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%) scaleY(1);
            opacity: 0;
          }
        }
        @keyframes kame-text-pop {
          0%, 20% { opacity: 0; transform: scale(0.6) rotate(-6deg); }
          40%, 80% { opacity: 1; transform: scale(1) rotate(-2deg); }
          100% { opacity: 0; transform: scale(1.4) rotate(2deg); }
        }
        .kame-orb {
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle, #ffffff 0%, #b9efff 35%, #00d4e4 70%, rgba(0, 212, 228, 0) 100%);
          animation: kame-orb-grow 3s cubic-bezier(0.2, 0.6, 0.4, 1) forwards;
          will-change: transform, opacity;
        }
        .kame-wave {
          position: absolute;
          inset: 30% 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(185, 239, 255, 0.55) 25%,
            #ffffff 50%,
            rgba(0, 212, 228, 0.55) 75%,
            transparent 100%
          );
          mix-blend-mode: screen;
          animation: kame-wave-go 2.6s ease-out forwards;
          animation-delay: 0.35s;
          will-change: transform, opacity;
        }
        .kame-text {
          position: absolute;
          color: #00d4e4;
          font-size: clamp(3rem, 10vw, 9rem);
          font-weight: 900;
          text-shadow:
            0 0 18px #00d4e4,
            0 0 40px #ffffff,
            0 0 90px #00d4e4;
          animation: kame-text-pop 3s ease-out forwards;
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  );
}
