"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";
import type { Preorder } from "@/lib/preorders-mock";

type Props = {
  preorder: Preorder;
};

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
};

function diff(target: Date): Countdown {
  const ms = target.getTime() - Date.now();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { days, hours, minutes, seconds, done: false };
}

/**
 * Banner amarelo/cyan estilo "alert manga" pra pre-venda.
 * - Countdown atualiza a cada 1s no client (SSR-safe: render inicial usa days/hours fixos)
 * - Progress bar mostra "% reservado" (mock determinístico)
 * - CTA dispara toast amarelo de aviso (sem persistencia)
 */
export default function PreorderBanner({ preorder }: Props) {
  const releaseDateMs = preorder.releaseDate.getTime();
  // Render SSR: usa daysUntil pra evitar mismatch.
  const [cd, setCd] = useState<Countdown>(() => ({
    days: preorder.daysUntil,
    hours: 0,
    minutes: 0,
    seconds: 0,
    done: false,
  }));

  const toast = useToast();

  useEffect(() => {
    const target = new Date(releaseDateMs);
    // Sincroniza com timer externo (setInterval). 1o tick chama setCd via callback,
    // sem setState sincrono no body do effect.
    const tick = () => setCd(diff(target));
    const t = setInterval(tick, 1000);
    // tick inicial pra atualizar imediatamente apos hidratacao
    const raf = requestAnimationFrame(tick);
    return () => {
      clearInterval(t);
      cancelAnimationFrame(raf);
    };
  }, [releaseDateMs]);

  const handleReserve = () => {
    toast.show(
      `Reserva do Volume ${String(preorder.nextVolumeNumber).padStart(2, "0")} confirmada. Sem cobranca ate o envio.`,
      "warning",
      4000,
    );
  };

  return (
    <section className="relative px-4 md:px-8 py-8 border-b border-[var(--line)] bg-zone-yellow overflow-hidden">
      <div className="absolute inset-0 halftone opacity-25 pointer-events-none" aria-hidden />
      <div className="bike-streak" style={{ top: "65%" }} />

      <div className="relative max-w-7xl mx-auto border-2 border-akira-yellow shadow-[6px_6px_0_var(--akira-yellow)] bg-bg-2 p-5 md:p-7 flex flex-col lg:flex-row items-stretch lg:items-center gap-5 lg:gap-8">
        {/* Selo lateral */}
        <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-1">
          <span className="pulse-neon inline-block w-2.5 h-2.5 rounded-full bg-akira-yellow shadow-[0_0_10px_var(--akira-yellow)]" />
          <p className="eyebrow text-akira-yellow glow-yellow whitespace-nowrap">Pre-venda aberta</p>
          <span className="jp text-akira-yellow glow-yellow text-lg hidden lg:inline">予約受付中</span>
        </div>

        {/* Texto principal */}
        <div className="flex-1 min-w-0">
          <p className="display text-2xl md:text-3xl text-ink leading-tight">
            🚀 Volume{" "}
            <span className="text-akira-red glow-red numerals">
              {String(preorder.nextVolumeNumber).padStart(2, "0")}
            </span>{" "}
            sai em{" "}
            <span className="text-akira-cyan glow-cyan numerals">
              {cd.done ? "0" : cd.days}
            </span>{" "}
            dias
          </p>

          {/* Countdown digital */}
          <div className="mt-3 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink-soft">
            <Slot label="dias" value={cd.days} />
            <span className="text-akira-yellow">:</span>
            <Slot label="hrs" value={cd.hours} />
            <span className="text-akira-yellow">:</span>
            <Slot label="min" value={cd.minutes} />
            <span className="text-akira-yellow">:</span>
            <Slot label="seg" value={cd.seconds} />
          </div>

          {/* Progress reservado */}
          <div className="mt-4">
            <div className="flex items-baseline justify-between text-[11px] font-mono uppercase tracking-widest text-ink-muted mb-1.5">
              <span>Estoque reservado</span>
              <span className="text-akira-cyan numerals">{preorder.percentReserved}%</span>
            </div>
            <div className="relative h-2 border border-ink bg-bg overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-akira-cyan shadow-[0_0_8px_var(--akira-cyan)]"
                style={{ width: `${preorder.percentReserved}%` }}
                aria-hidden
              />
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={handleReserve}
          className="shimmer flex-shrink-0 px-6 py-4 bg-akira-yellow text-ink font-bold uppercase tracking-widest text-sm border-2 border-ink shadow-hard hover:shadow-hard-lg hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all whitespace-nowrap"
        >
          Reservar agora →
        </button>
      </div>
    </section>
  );
}

function Slot({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex items-baseline gap-1">
      <span className="display text-2xl text-akira-cyan numerals leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] text-ink-muted">{label}</span>
    </span>
  );
}
