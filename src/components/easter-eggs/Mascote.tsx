"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useToast } from "@/context/ToastContext";

const HIDE_KEY = "mascote-hidden";
const HIDE_EVENT = "mascote:hide";

const PHRASES = [
  "BAM! Ola!",
  "DOKI DOKI!",
  "Voce e otaku?",
  "Konami code tente!",
  "Neo-Tokyo ta esperando.",
  "Adiciona um mangazinho ai!",
  "OK, computer.",
  "BAKAAA!",
];

const HIDE_ON: RegExp[] = [
  /^\/checkout(\/|$)/,
  /^\/pedido\/[^/]+/,
];

function readHidden(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(HIDE_KEY) === "true";
  } catch {
    return false;
  }
}

function subscribeHidden(callback: () => void) {
  window.addEventListener(HIDE_EVENT, callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === HIDE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(HIDE_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

export default function Mascote() {
  const pathname = usePathname() ?? "/";
  const { show } = useToast();
  const hidden = useSyncExternalStore(
    subscribeHidden,
    readHidden,
    () => false, // SSR — sempre mostra
  );
  const [hover, setHover] = useState(false);
  const [phraseIdx, setPhraseIdx] = useState(0);

  const shouldHideRoute = useMemo(
    () => HIDE_ON.some((rx) => rx.test(pathname)),
    [pathname],
  );

  if (hidden || shouldHideRoute) return null;

  const handleClick = () => {
    const next = (phraseIdx + 1) % PHRASES.length;
    setPhraseIdx(next);
    show(PHRASES[phraseIdx], "info", 2200);
  };

  const handleHide = () => {
    try {
      window.localStorage.setItem(HIDE_KEY, "true");
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent(HIDE_EVENT));
    show("Mascote escondido (limpe localStorage pra trazer de volta)", "info", 2600);
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-40 select-none"
      style={{ pointerEvents: "auto" }}
    >
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label="Mascote MangaVerse — clique pra interagir"
        title="Mascote (clique)"
        className="relative block w-12 h-12 hover:scale-110 transition-transform"
      >
        <MascoteSvg blinkStar={hover} />
        <span className="mascote-idle absolute inset-0 rounded-full" aria-hidden />
      </button>

      <button
        type="button"
        onClick={handleHide}
        aria-label="Esconder mascote"
        title="Esconder mascote"
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-bg-2 border border-akira-red text-akira-red text-[10px] font-mono leading-none flex items-center justify-center hover:bg-akira-red hover:text-ink transition-colors"
      >
        ×
      </button>

      <style jsx>{`
        @keyframes mascote-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(193, 18, 31, 0.6); }
          50% { box-shadow: 0 0 0 10px rgba(193, 18, 31, 0); }
        }
        .mascote-idle {
          pointer-events: none;
          animation: mascote-pulse 2.4s ease-out infinite;
        }
      `}</style>
    </div>
  );
}

/**
 * SVG inline — chibi cyberpunk girl, geometria simples,
 * cabelo vermelho, oculos cyan.
 * blinkStar troca os olhos por estrelinhas no hover.
 */
function MascoteSvg({ blinkStar }: { blinkStar: boolean }) {
  return (
    <svg
      viewBox="0 0 40 40"
      width="48"
      height="48"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      role="img"
      aria-hidden
    >
      {/* Backdrop arredondado */}
      <rect x="2" y="2" width="36" height="36" rx="6" fill="#1a1212" stroke="#c1121f" strokeWidth="1.5" />

      {/* Cabelo (back) */}
      <path d="M6 18 Q6 8 20 7 Q34 8 34 18 L34 26 L30 26 L30 18 L10 18 L10 26 L6 26 Z" fill="#c1121f" />

      {/* Rosto */}
      <rect x="11" y="14" width="18" height="16" rx="3" fill="#f3e9d6" />

      {/* Mexa cabelo (front) */}
      <path d="M11 14 L11 18 L14 17 L18 19 L22 17 L26 19 L29 17 L29 14 Z" fill="#c1121f" />

      {/* Oculos cyan */}
      <rect x="12" y="20" width="7" height="4" fill="none" stroke="#00d4e4" strokeWidth="1" />
      <rect x="21" y="20" width="7" height="4" fill="none" stroke="#00d4e4" strokeWidth="1" />
      <line x1="19" y1="22" x2="21" y2="22" stroke="#00d4e4" strokeWidth="1" />

      {/* Olhos — bolinha ou estrelinha */}
      {blinkStar ? (
        <>
          <text x="15.5" y="23.2" fontSize="4" fill="#ffc949" textAnchor="middle" fontWeight="900">★</text>
          <text x="24.5" y="23.2" fontSize="4" fill="#ffc949" textAnchor="middle" fontWeight="900">★</text>
        </>
      ) : (
        <>
          <circle cx="15.5" cy="22" r="1" fill="#0e0a0a" />
          <circle cx="24.5" cy="22" r="1" fill="#0e0a0a" />
        </>
      )}

      {/* Bochechas */}
      <circle cx="13" cy="26" r="1.2" fill="#ff5a8d" opacity="0.7" />
      <circle cx="27" cy="26" r="1.2" fill="#ff5a8d" opacity="0.7" />

      {/* Boca */}
      <path d="M18 28 Q20 30 22 28" stroke="#c1121f" strokeWidth="1" fill="none" strokeLinecap="round" />

      {/* Detalhe cyberpunk — antena */}
      <line x1="20" y1="4" x2="20" y2="7" stroke="#ffc949" strokeWidth="1" />
      <circle cx="20" cy="3" r="1" fill="#ffc949" />
    </svg>
  );
}
