"use client";

import { useCallback, useEffect, useState } from "react";

export type EstanteStatus = "reading" | "owned" | "wishlist";

export type EstanteItem = {
  id: string;
  title: string;
  titleJp?: string;
  cover: string;
  series?: string;
  status: EstanteStatus;
  addedAt: string;
};

const STORAGE_KEY = "manga-estante";

function readAll(): EstanteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as EstanteItem[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: EstanteItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("estante:change"));
  } catch {
    // ignore quota
  }
}

export function useEstante() {
  const [items, setItems] = useState<EstanteItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // hidrata client-side e escuta mudancas em outras abas/componentes
  useEffect(() => {
    setItems(readAll());
    setHydrated(true);

    const sync = () => setItems(readAll());
    window.addEventListener("storage", sync);
    window.addEventListener("estante:change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("estante:change", sync);
    };
  }, []);

  const persist = useCallback((next: EstanteItem[]) => {
    setItems(next);
    writeAll(next);
  }, []);

  const add = useCallback(
    (item: Omit<EstanteItem, "addedAt" | "status">, status: EstanteStatus = "wishlist") => {
      const current = readAll();
      const existing = current.find((i) => i.id === item.id);
      const next: EstanteItem[] = existing
        ? current.map((i) => (i.id === item.id ? { ...i, ...item, status } : i))
        : [...current, { ...item, status, addedAt: new Date().toISOString() }];
      persist(next);
    },
    [persist]
  );

  const move = useCallback(
    (id: string, newStatus: EstanteStatus) => {
      const next = readAll().map((i) => (i.id === id ? { ...i, status: newStatus } : i));
      persist(next);
    },
    [persist]
  );

  const remove = useCallback(
    (id: string) => {
      persist(readAll().filter((i) => i.id !== id));
    },
    [persist]
  );

  const getByStatus = useCallback(
    (status: EstanteStatus) => items.filter((i) => i.status === status),
    [items]
  );

  const count = useCallback(
    (status?: EstanteStatus) =>
      status ? items.filter((i) => i.status === status).length : items.length,
    [items]
  );

  const all = useCallback(() => items, [items]);

  return { items, hydrated, add, move, remove, getByStatus, count, all };
}
