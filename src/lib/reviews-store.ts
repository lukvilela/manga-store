"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Store de reviews de mangas (estilo MAL + Letterboxd).
 *
 * 100% localStorage, sem backend. Sincroniza entre componentes via
 * custom event `reviews:change` + nativo `storage` (cross-tab).
 *
 * Dedup de like: NAO (modo simples) — clicar varias vezes incrementa.
 * Permissao de remover: somente match exato de userName (mesmo "dono").
 */

export type Review = {
  id: string;
  mangaId: string;
  mangaTitle: string;
  mangaCover: string;
  userName: string;
  rating: number; // 1-10
  text: string;
  hasSpoiler: boolean;
  createdAt: string; // ISO
  likes: number;
};

export type RatingStats = {
  average: number;
  count: number;
  distribution: number[]; // index 0 = rating 1, index 9 = rating 10
};

const STORAGE_KEY = "manga-reviews";
const CHANGE_EVENT = "reviews:change";

function readAll(): Review[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Review[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: Review[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // ignore quota
  }
}

function genId(): string {
  return `rev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useReviews() {
  const [items, setItems] = useState<Review[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readAll());
    setHydrated(true);

    const sync = () => setItems(readAll());
    window.addEventListener("storage", sync);
    window.addEventListener(CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(CHANGE_EVENT, sync);
    };
  }, []);

  const persist = useCallback((next: Review[]) => {
    setItems(next);
    writeAll(next);
  }, []);

  /** Adiciona uma review nova. Gera ID + timestamp automaticamente. */
  const add = useCallback(
    (input: Omit<Review, "id" | "createdAt" | "likes">) => {
      const review: Review = {
        ...input,
        id: genId(),
        createdAt: new Date().toISOString(),
        likes: 0,
      };
      const next = [review, ...readAll()];
      persist(next);
      return review;
    },
    [persist]
  );

  /** Remove uma review — somente se userName bater (dono). */
  const remove = useCallback(
    (id: string, userName: string) => {
      const current = readAll();
      const target = current.find((r) => r.id === id);
      if (!target) return false;
      if (target.userName !== userName) return false;
      persist(current.filter((r) => r.id !== id));
      return true;
    },
    [persist]
  );

  /** Atualiza campos parciais de uma review. */
  const update = useCallback(
    (id: string, partial: Partial<Omit<Review, "id" | "createdAt">>) => {
      const next = readAll().map((r) => (r.id === id ? { ...r, ...partial } : r));
      persist(next);
    },
    [persist]
  );

  /** Reviews de um manga especifico, ordenadas por data desc (mais recente primeiro). */
  const getByMangaId = useCallback(
    (mangaId: string): Review[] => {
      return items
        .filter((r) => r.mangaId === mangaId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    [items]
  );

  /** Reviews escritas por um usuario especifico. */
  const getByUser = useCallback(
    (userName: string): Review[] => {
      return items
        .filter((r) => r.userName === userName)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    [items]
  );

  /**
   * Calcula media + count + distribuicao (array de 10 posicoes) pra um manga.
   * Distribution[0] = quantos deram nota 1, Distribution[9] = quantos deram 10.
   */
  const getAverageRating = useCallback(
    (mangaId: string): RatingStats => {
      const reviews = items.filter((r) => r.mangaId === mangaId);
      const count = reviews.length;
      const distribution = Array(10).fill(0) as number[];
      if (count === 0) {
        return { average: 0, count: 0, distribution };
      }
      let sum = 0;
      for (const r of reviews) {
        sum += r.rating;
        const idx = Math.max(0, Math.min(9, Math.round(r.rating) - 1));
        distribution[idx]++;
      }
      return {
        average: sum / count,
        count,
        distribution,
      };
    },
    [items]
  );

  /** Incrementa likes (sem dedup, modo simples). */
  const like = useCallback(
    (reviewId: string) => {
      const next = readAll().map((r) =>
        r.id === reviewId ? { ...r, likes: r.likes + 1 } : r
      );
      persist(next);
    },
    [persist]
  );

  /** Todas as reviews do sistema, ordenadas desc por data. */
  const all = useCallback((): Review[] => {
    return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [items]);

  return {
    items,
    hydrated,
    add,
    remove,
    update,
    getByMangaId,
    getByUser,
    getAverageRating,
    like,
    all,
  };
}
