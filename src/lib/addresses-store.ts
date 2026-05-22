"use client";

import { useCallback, useEffect, useState } from "react";

export type Address = {
  id: string;
  label: string;
  recipient: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  isDefault: boolean;
};

const STORAGE_KEY = "manga-addresses";
const MAX_ADDRESSES = 5;

function readAll(): Address[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Address[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: Address[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("addresses:change"));
  } catch {
    // ignore
  }
}

function newId() {
  return `ADDR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export const ADDRESS_LIMIT = MAX_ADDRESSES;

export function useAddresses() {
  const [items, setItems] = useState<Address[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readAll());
    setHydrated(true);

    const sync = () => setItems(readAll());
    window.addEventListener("storage", sync);
    window.addEventListener("addresses:change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("addresses:change", sync);
    };
  }, []);

  const persist = useCallback((next: Address[]) => {
    setItems(next);
    writeAll(next);
  }, []);

  const add = useCallback(
    (data: Omit<Address, "id" | "isDefault"> & { isDefault?: boolean }) => {
      const current = readAll();
      if (current.length >= MAX_ADDRESSES) {
        return { ok: false as const, error: `Limite de ${MAX_ADDRESSES} enderecos` };
      }
      const isDefault = current.length === 0 || data.isDefault === true;
      const next = isDefault
        ? current.map((a) => ({ ...a, isDefault: false }))
        : [...current];
      next.push({ ...data, id: newId(), isDefault });
      persist(next);
      return { ok: true as const };
    },
    [persist]
  );

  const update = useCallback(
    (id: string, patch: Partial<Omit<Address, "id">>) => {
      const next = readAll().map((a) => (a.id === id ? { ...a, ...patch } : a));
      persist(next);
    },
    [persist]
  );

  const remove = useCallback(
    (id: string) => {
      const current = readAll();
      const target = current.find((a) => a.id === id);
      let next = current.filter((a) => a.id !== id);
      // se removeu o default, eleger o primeiro como novo default
      if (target?.isDefault && next.length > 0) {
        next = next.map((a, idx) => ({ ...a, isDefault: idx === 0 }));
      }
      persist(next);
    },
    [persist]
  );

  const setDefault = useCallback(
    (id: string) => {
      const next = readAll().map((a) => ({ ...a, isDefault: a.id === id }));
      persist(next);
    },
    [persist]
  );

  return {
    items,
    hydrated,
    add,
    update,
    remove,
    setDefault,
    count: items.length,
    canAdd: items.length < MAX_ADDRESSES,
  };
}
