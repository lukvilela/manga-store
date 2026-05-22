"use client";

// Bridge entre eventos do CartContext/Estante e o useGamification.
// Tambem dispara toast em XP/badge/achievement e checa badges
// quando a estante muda. Montado uma vez por pagina.

import { useEffect, useRef } from "react";
import { useGamification } from "@/lib/gamification-store";
import { useEstante } from "@/lib/estante-store";
import { useToast } from "@/context/ToastContext";
import { getBadgeById } from "@/lib/badges";
import { getAchievementById } from "@/lib/achievements";

export default function GamificationListener() {
  const {
    addXp,
    addPoints,
    updateStreak,
    unlockBadge,
    unlockAchievement,
    state,
    hydrated,
  } = useGamification();
  const { items: estanteItems } = useEstante();
  const { show } = useToast();
  const streakRanRef = useRef(false);

  // Streak: roda 1x por mount do dia
  useEffect(() => {
    if (!hydrated || streakRanRef.current) return;
    streakRanRef.current = true;
    updateStreak();
  }, [hydrated, updateStreak]);

  // Listener: compra adiciona XP/pontos
  useEffect(() => {
    const onCart = (e: Event) => {
      const detail = (e as CustomEvent<{ kind?: string; amount?: number; points?: number }>).detail || {};
      const kind = detail.kind || "compra";
      const amount = typeof detail.amount === "number" ? detail.amount : 50;
      addXp(amount, kind);
      if (typeof detail.points === "number" && detail.points > 0) {
        addPoints(detail.points, kind);
      }
    };
    const onEstante = () => {
      addXp(10, "estante");
    };
    window.addEventListener("gamification:cart-add", onCart);
    window.addEventListener("gamification:estante-add", onEstante);
    return () => {
      window.removeEventListener("gamification:cart-add", onCart);
      window.removeEventListener("gamification:estante-add", onEstante);
    };
  }, [addXp, addPoints]);

  // Toast hooks: XP, badge, achievement, level up
  useEffect(() => {
    const onXp = (e: Event) => {
      const detail = (e as CustomEvent<{ amount: number; reason: string }>).detail;
      const reasonTxt = detail.reason ? ` (${detail.reason})` : "";
      show(`+${detail.amount} XP${reasonTxt}`, "info", 2200);
    };
    const onLvl = (e: Event) => {
      const detail = (e as CustomEvent<{ level: number }>).detail;
      show(`LEVEL UP! Voce e nivel ${detail.level}`, "success", 3500);
    };
    const onBadge = (e: Event) => {
      const detail = (e as CustomEvent<{ badgeId: string }>).detail;
      const b = getBadgeById(detail.badgeId);
      if (b) show(`Badge desbloqueado: ${b.name}`, "success", 3500);
    };
    const onAch = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string }>).detail;
      const a = getAchievementById(detail.id);
      if (a) show(`Conquista: ${a.name} (+${a.xp} XP)`, "success", 3500);
    };
    const onPts = (e: Event) => {
      const detail = (e as CustomEvent<{ amount: number }>).detail;
      show(`+${detail.amount} pontos`, "info", 2200);
    };
    window.addEventListener("gamification:xp-gained", onXp);
    window.addEventListener("gamification:level-up", onLvl);
    window.addEventListener("gamification:badge-unlocked", onBadge);
    window.addEventListener("gamification:achievement-unlocked", onAch);
    window.addEventListener("gamification:points-gained", onPts);
    return () => {
      window.removeEventListener("gamification:xp-gained", onXp);
      window.removeEventListener("gamification:level-up", onLvl);
      window.removeEventListener("gamification:badge-unlocked", onBadge);
      window.removeEventListener("gamification:achievement-unlocked", onAch);
      window.removeEventListener("gamification:points-gained", onPts);
    };
  }, [show]);

  // Check badges/achievements quando estante muda ou state muda
  useEffect(() => {
    if (!hydrated) return;
    const handler = () => {
      // colecionador: 50 itens na estante
      if (estanteItems.length >= 50) unlockBadge("colecionador");
      // wishlist-grande: 20 itens wishlist
      const wishCount = estanteItems.filter((i) => i.status === "wishlist").length;
      if (wishCount >= 20) unlockBadge("wishlist-grande");
      // primeira-estante (achievement)
      if (estanteItems.length >= 1) unlockAchievement("primeira-estante");
      // biblioteca-pessoal achievement (50 itens)
      if (estanteItems.length >= 50) unlockAchievement("biblioteca-pessoal");
      // wishlist-cheia achievement
      if (wishCount >= 20) unlockAchievement("wishlist-cheia");

      // level-based badges
      if (state.level >= 50) {
        unlockBadge("tier-s");
        unlockAchievement("tier-s-unlocked");
      }
      if (state.level >= 25) unlockBadge("veterano");

      // pontos achievement
      if (state.points >= 500) unlockAchievement("carteira-cheia");

      // streak achievements
      if (state.streak.current >= 7) {
        unlockAchievement("streak-7");
        unlockBadge("habitual");
      }
      if (state.streak.current >= 30) {
        unlockAchievement("streak-30");
        unlockBadge("fanatico");
      }

      // noctambulo: hora local entre 0-3
      const hour = new Date().getHours();
      if (hour >= 0 && hour < 3) unlockBadge("noctambulo");

      // neo-tokyo: 10 badges desbloqueados
      if (state.badges.length >= 10) {
        unlockBadge("neo-tokyo");
        unlockAchievement("sobrevivente-neo-tokyo");
      }
    };
    handler();
    window.addEventListener("gamification:badge-check", handler);
    return () => window.removeEventListener("gamification:badge-check", handler);
  }, [
    hydrated,
    estanteItems,
    state.level,
    state.points,
    state.streak.current,
    state.badges.length,
    unlockBadge,
    unlockAchievement,
  ]);

  // Auto-unlock "primeira-impressao" achievement quando hidrata (proxy de conta criada)
  useEffect(() => {
    if (hydrated) {
      unlockAchievement("primeira-impressao");
    }
  }, [hydrated, unlockAchievement]);

  return null;
}
