"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "akira-mangas-last-cep";
const EVENT = "last-cep:change";

export type StoredCep = {
  cep: string; // formatado 00000-000
  uf?: string;
  city?: string;
  district?: string;
  street?: string;
  savedAt: string; // ISO
};

export function getLastCep(): StoredCep | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.cep === "string") return parsed as StoredCep;
    return null;
  } catch {
    return null;
  }
}

export function setLastCep(value: StoredCep) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    // ignore
  }
}

export function clearLastCep() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    // ignore
  }
}

// Hook reativo — re-renderiza quando o CEP for atualizado (ex: usuario
// muda o CEP no carrinho e o checkout precisa refletir).
export function useLastCep() {
  const [cep, setCep] = useState<StoredCep | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setCep(getLastCep());
      setHydrated(true);
    });
    const sync = () => setCep(getLastCep());
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT, sync);
    };
  }, []);

  const save = useCallback((value: StoredCep) => setLastCep(value), []);
  const reset = useCallback(() => clearLastCep(), []);

  return { cep, hydrated, save, reset };
}
