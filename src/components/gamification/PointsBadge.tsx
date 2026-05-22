"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGamification } from "@/lib/gamification-store";

/**
 * PointsBadge — chip omnipresente do saldo de pontos.
 *
 * Aparece no Header pra todo usuario logado com points > 0.
 * Click leva pra /conta/recompensas (pagina de resgate).
 * Pulse animation ao receber pontos (event "gamification:points-gained").
 */
export default function PointsBadge() {
  const { user } = useAuth();
  const { state, hydrated } = useGamification();
  const [pulse, setPulse] = useState(false);

  // Escuta evento de ganho de pontos pra animar
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onGain = () => {
      setPulse(true);
      // dura 1s e desliga (o efeito visual segura attention)
      window.setTimeout(() => setPulse(false), 1000);
    };
    window.addEventListener("gamification:points-gained", onGain);
    return () => window.removeEventListener("gamification:points-gained", onGain);
  }, []);

  // Esconde se nao logado, nao hidratado ou points zero
  if (!user || !hydrated || state.points <= 0) return null;

  return (
    <Link
      href="/conta/recompensas"
      title={`${state.points} pontos disponiveis · resgatar recompensas`}
      className={`group inline-flex items-center gap-1.5 px-2.5 py-1 bg-akira-yellow text-bg shadow-hard border-[2px] border-ink hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_var(--ink)] transition-all ${
        pulse ? "pulse-neon" : ""
      }`}
    >
      <span aria-hidden className="text-sm leading-none">
        💰
      </span>
      <span className="font-mono text-[11px] font-bold numerals uppercase tracking-widest">
        {state.points.toLocaleString("pt-BR")} pts
      </span>
    </Link>
  );
}
