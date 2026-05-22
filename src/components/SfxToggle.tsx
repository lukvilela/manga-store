"use client";

import { useSyncExternalStore } from "react";
import { isSfxEnabled, playDing, setSfxEnabled } from "@/lib/sfx";

// Subscribe — escuta evento custom + storage (multi-aba)
function subscribe(callback: () => void) {
  window.addEventListener("sfx:toggle", callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === "sfxEnabled") callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("sfx:toggle", callback);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => isSfxEnabled();
const getServerSnapshot = () => false;

/**
 * Botao pequeno pra toggle SFX (Web Audio synth).
 * Persiste em localStorage e usa useSyncExternalStore pra hidratar
 * sem set-state-in-effect.
 */
export default function SfxToggle() {
  // No server snapshot retorna false (sfx desligado), hydrate atualiza pra valor real
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleClick = () => {
    const next = !enabled;
    setSfxEnabled(next);
    // Confirma audivelmente quando ligamos
    if (next) {
      window.setTimeout(() => playDing(), 0);
    }
  };

  const label = enabled ? "Som ligado" : "Som desligado";
  const icon = enabled ? "🔊" : "🔇";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={enabled}
      aria-label={label}
      title={label}
      className="inline-flex items-center justify-center w-8 h-8 rounded border border-[var(--line)] bg-[var(--bg-2)] hover:bg-akira-cyan hover:text-bg transition-colors text-sm"
    >
      <span aria-hidden>{icon}</span>
    </button>
  );
}
