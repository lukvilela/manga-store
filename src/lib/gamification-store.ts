"use client";

import { useCallback, useEffect, useState } from "react";

// Schema persistido em localStorage
export type GamificationState = {
  xp: number;
  points: number;
  level: number;
  streak: { current: number; longest: number; lastVisit: string };
  badges: string[];
  achievements: string[];
  lootBox: { lastSpinISOWeek: string | null };
};

const STORAGE_KEY = "manga-gamification";

const DEFAULT_STATE: GamificationState = {
  xp: 0,
  points: 0,
  level: 1,
  streak: { current: 0, longest: 0, lastVisit: "" },
  badges: [],
  achievements: [],
  lootBox: { lastSpinISOWeek: null },
};

// formula: floor(sqrt(xp/100))+1 garante level 1 inicial
export function computeLevel(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 100)) + 1);
}

// XP necessario para chegar no inicio do nivel N
export function xpForLevel(level: number): number {
  const base = level - 1;
  return base * base * 100;
}

export function xpToNextLevel(xp: number): { current: number; nextAt: number; pct: number } {
  const lvl = computeLevel(xp);
  const currentBase = xpForLevel(lvl);
  const nextAt = xpForLevel(lvl + 1);
  const span = nextAt - currentBase;
  const into = xp - currentBase;
  return { current: into, nextAt: span, pct: Math.min(100, Math.max(0, (into / span) * 100)) };
}

// chave ISO week ano-semana ex "2026-W21"
export function getISOWeekKey(d: Date = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((+date - +yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function readState(): GamificationState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<GamificationState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      streak: { ...DEFAULT_STATE.streak, ...(parsed.streak || {}) },
      lootBox: { ...DEFAULT_STATE.lootBox, ...(parsed.lootBox || {}) },
      badges: parsed.badges || [],
      achievements: parsed.achievements || [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeState(state: GamificationState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event("gamification:change"));
  } catch {
    // ignore quota
  }
}

// retorna YYYY-MM-DD no fuso local
function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysBetween(a: string, b: string): number {
  if (!a || !b) return Infinity;
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((+db - +da) / 86400000);
}

export type LootReward = {
  type: "sticker" | "discount" | "points" | "badge";
  label: string;
  value?: number;
  badgeId?: string;
};

const LOOT_TABLE: LootReward[] = [
  { type: "sticker", label: "Sticker Akira Vermelho" },
  { type: "sticker", label: "Sticker Capsule Kid" },
  { type: "discount", label: "Cupom 5% OFF", value: 5 },
  { type: "discount", label: "Cupom 10% OFF", value: 10 },
  { type: "discount", label: "Cupom 20% OFF", value: 20 },
  { type: "points", label: "+50 Pontos", value: 50 },
  { type: "points", label: "+100 Pontos", value: 100 },
  { type: "badge", label: "Badge Raro: Sortudo", badgeId: "sortudo" },
];

export function useGamification() {
  const [state, setState] = useState<GamificationState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readState());
    setHydrated(true);

    const sync = () => setState(readState());
    window.addEventListener("storage", sync);
    window.addEventListener("gamification:change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("gamification:change", sync);
    };
  }, []);

  const persist = useCallback((next: GamificationState) => {
    setState(next);
    writeState(next);
  }, []);

  const addXp = useCallback(
    (amount: number, reason?: string) => {
      if (amount <= 0) return;
      const current = readState();
      const prevLevel = computeLevel(current.xp);
      const newXp = current.xp + amount;
      const newLevel = computeLevel(newXp);
      const next = { ...current, xp: newXp, level: newLevel };
      persist(next);
      // dispara evento pra toast escutar (cross-component)
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("gamification:xp-gained", {
            detail: { amount, reason: reason || "" },
          })
        );
        if (newLevel > prevLevel) {
          window.dispatchEvent(
            new CustomEvent("gamification:level-up", {
              detail: { level: newLevel },
            })
          );
        }
      }
    },
    [persist]
  );

  const addPoints = useCallback(
    (amount: number, reason?: string) => {
      if (amount <= 0) return;
      const current = readState();
      persist({ ...current, points: current.points + amount });
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("gamification:points-gained", {
            detail: { amount, reason: reason || "" },
          })
        );
      }
    },
    [persist]
  );

  const usePoints = useCallback(
    (amount: number): boolean => {
      const current = readState();
      if (current.points < amount) return false;
      persist({ ...current, points: current.points - amount });
      return true;
    },
    [persist]
  );

  const updateStreak = useCallback(() => {
    const current = readState();
    const today = dayKey();
    if (current.streak.lastVisit === today) return; // mesmo dia, nao faz nada
    const diff = daysBetween(current.streak.lastVisit, today);
    let newCurrent: number;
    if (!current.streak.lastVisit) newCurrent = 1;
    else if (diff === 1) newCurrent = current.streak.current + 1;
    else newCurrent = 1; // gap maior que 1 dia reseta
    const newLongest = Math.max(current.streak.longest, newCurrent);
    persist({
      ...current,
      streak: { current: newCurrent, longest: newLongest, lastVisit: today },
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("gamification:streak-updated", {
          detail: { current: newCurrent, longest: newLongest },
        })
      );
    }
  }, [persist]);

  const unlockBadge = useCallback(
    (badgeId: string): boolean => {
      const current = readState();
      if (current.badges.includes(badgeId)) return false;
      persist({ ...current, badges: [...current.badges, badgeId] });
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("gamification:badge-unlocked", {
            detail: { badgeId },
          })
        );
      }
      return true;
    },
    [persist]
  );

  const unlockAchievement = useCallback(
    (id: string): boolean => {
      const current = readState();
      if (current.achievements.includes(id)) return false;
      persist({ ...current, achievements: [...current.achievements, id] });
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("gamification:achievement-unlocked", {
            detail: { id },
          })
        );
      }
      return true;
    },
    [persist]
  );

  const canSpinLootBox = useCallback(() => {
    const current = readState();
    return current.lootBox.lastSpinISOWeek !== getISOWeekKey();
  }, []);

  const spinLootBox = useCallback((): LootReward | null => {
    const current = readState();
    const week = getISOWeekKey();
    if (current.lootBox.lastSpinISOWeek === week) return null;
    const reward = LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];
    const next: GamificationState = {
      ...current,
      lootBox: { lastSpinISOWeek: week },
    };
    // aplica reward
    if (reward.type === "points" && reward.value) {
      next.points = next.points + reward.value;
    }
    if (reward.type === "badge" && reward.badgeId && !next.badges.includes(reward.badgeId)) {
      next.badges = [...next.badges, reward.badgeId];
    }
    persist(next);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("gamification:lootbox-spun", { detail: { reward } })
      );
    }
    return reward;
  }, [persist]);

  const reset = useCallback(() => {
    persist(DEFAULT_STATE);
  }, [persist]);

  return {
    state,
    hydrated,
    addXp,
    addPoints,
    usePoints,
    updateStreak,
    unlockBadge,
    unlockAchievement,
    canSpinLootBox,
    spinLootBox,
    reset,
  };
}
