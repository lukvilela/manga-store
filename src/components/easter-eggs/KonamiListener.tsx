"use client";

import { useEffect, useRef } from "react";
import "@/app/saiyan.css";
import {
  applySaiyanDom,
  createKonamiDetector,
  isSaiyanActive,
  setSaiyanActive,
  toggleSaiyan,
} from "@/lib/konami-store";
import { useToast } from "@/context/ToastContext";

/**
 * Listener global do Konami code.
 * Quando dispara: alterna Saiyan Mode + toast.
 * Tambem reaplica estado salvo no mount (persistente entre sessoes).
 */
export default function KonamiListener() {
  const { show } = useToast();
  const cursorRef = useRef<HTMLDivElement | null>(null);

  // Restaura estado + injeta cursor overlay
  useEffect(() => {
    applySaiyanDom(isSaiyanActive());

    // Cursor overlay — so segue mouse quando saiyan ativo
    const el = document.createElement("div");
    el.className = "saiyan-cursor";
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);
    cursorRef.current = el;

    const onMove = (e: MouseEvent) => {
      if (!cursorRef.current) return;
      cursorRef.current.style.left = `${e.clientX}px`;
      cursorRef.current.style.top = `${e.clientY}px`;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      el.remove();
      cursorRef.current = null;
    };
  }, []);

  // Detector de teclas globais
  useEffect(() => {
    const detector = createKonamiDetector();

    const onKey = (e: KeyboardEvent) => {
      // Ignora se tiver digitando em input/textarea/contenteditable
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) {
          return;
        }
      }
      if (detector.matchSequence(e.code)) {
        const nowActive = toggleSaiyan();
        if (nowActive) {
          show("ULTRA INSTINCT ACTIVATED", "success", 3500);
        } else {
          show("Modo normal restaurado", "info", 2000);
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show]);

  // Sincroniza body class quando outro listener mudar (multi-aba)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "saiyan-mode") {
        applySaiyanDom(e.newValue === "true");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // exposto pra debug — permite manual disable via console
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__saiyan = { toggle: toggleSaiyan, set: setSaiyanActive };
  }, []);

  return null;
}
