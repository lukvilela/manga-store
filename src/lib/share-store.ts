"use client";

import { useCallback, useEffect, useState } from "react";
import type { EstanteItem, EstanteStatus } from "./estante-store";

// =====================================================
// Shared lists store (client-side, localStorage only)
// =====================================================
// IMPORTANTE: tudo persiste no localStorage do CRIADOR. Por isso a pagina
// /lista/[id] so consegue ler de quem gerou. Mensagem amigavel cobre o caso
// "outro device". Quando tivermos backend real, troca readLocal por fetch.

export type SharedList = {
  id: string;
  userName: string;
  items: EstanteItem[];
  status: EstanteStatus;
  createdAt: string;
};

const STORAGE_KEY = "manga-shared-lists";

function readAll(): SharedList[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SharedList[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: SharedList[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("shared-lists:change"));
  } catch {
    // ignore quota
  }
}

// ID curto base36 (8 chars) — colisao quase impossivel pro use-case mock
function generateShortId(): string {
  const a = Math.random().toString(36).slice(2, 6);
  const b = Math.random().toString(36).slice(2, 6);
  return `${a}${b}`.slice(0, 8);
}

// Helper publico — usado pela pagina /lista/[id] (so leitura)
export function getSharedListById(id: string): SharedList | null {
  if (typeof window === "undefined") return null;
  return readAll().find((l) => l.id === id) ?? null;
}

export function useSharedLists() {
  const [lists, setLists] = useState<SharedList[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setLists(readAll());
      setHydrated(true);
    });

    const sync = () => setLists(readAll());
    window.addEventListener("storage", sync);
    window.addEventListener("shared-lists:change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("shared-lists:change", sync);
    };
  }, []);

  // Cria um share. Retorna { id, url } pra UI mostrar/copiar.
  const createShare = useCallback(
    (
      items: EstanteItem[],
      userName: string,
      status: EstanteStatus,
    ): { id: string; url: string } => {
      const id = generateShortId();
      const entry: SharedList = {
        id,
        userName: userName.trim() || "Otaku Anonimo",
        items,
        status,
        createdAt: new Date().toISOString(),
      };
      const next = [...readAll(), entry];
      writeAll(next);
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      return { id, url: `${origin}/lista/${id}` };
    },
    [],
  );

  const getShare = useCallback((id: string): SharedList | null => {
    return readAll().find((l) => l.id === id) ?? null;
  }, []);

  const revokeShare = useCallback((id: string) => {
    const next = readAll().filter((l) => l.id !== id);
    writeAll(next);
  }, []);

  const myShares = useCallback((): SharedList[] => {
    // Tudo no localStorage local pertence ao "user atual" desse device.
    // Quando tiver backend, filtra por userId.
    return readAll().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, []);

  return { lists, hydrated, createShare, getShare, revokeShare, myShares };
}
