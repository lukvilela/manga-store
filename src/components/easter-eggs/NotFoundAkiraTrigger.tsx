"use client";

import { useEffect, useState } from "react";

const TRIGGER = "akira";

/**
 * Easter egg da pagina 404. Quando o usuario digita "akira" (em qualquer
 * lugar fora de inputs), substitui o titulo "ERROR 404" por "OK."
 * (referencia Saitama).
 *
 * Lê o elemento alvo via data-akira-target="title" pra evitar acoplar
 * markup; tambem injeta uma <style> que sobrescreve o data-text dos
 * pseudo-elementos do glitch.
 */
export default function NotFoundAkiraTrigger() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    let buf = "";
    const onKey = (e: KeyboardEvent) => {
      // Ignora se estiver digitando em input
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) {
          return;
        }
      }
      // Sequencia de keys: usamos e.key pra pegar a letra real (case-insensitive)
      if (e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-TRIGGER.length);
      if (buf === TRIGGER) {
        setUnlocked(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    const el = document.querySelector<HTMLElement>('[data-akira-target="title"]');
    if (el) {
      el.textContent = "OK.";
      el.setAttribute("data-text", "OK.");
    }
  }, [unlocked]);

  return null;
}
