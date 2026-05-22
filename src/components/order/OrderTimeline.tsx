"use client";

import type { TimelineEntry } from "@/lib/orders-store";

const dateTimeFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

type Props = {
  timeline: TimelineEntry[];
};

export default function OrderTimeline({ timeline }: Props) {
  return (
    <div className="panel-frame bg-[var(--bg-2)] p-6 md:p-8">
      <div className="mb-6 flex items-baseline gap-3 border-b-2 border-[var(--line)] pb-4">
        <span className="display text-2xl text-[var(--ink)]">RASTREIO</span>
        <span className="jp text-base text-[var(--akira-cyan)]">追跡</span>
        <span className="ml-auto font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest">
          {">"} status em tempo real
        </span>
      </div>

      <ol className="relative space-y-5">
        {/* Linha conectora vertical */}
        <div
          aria-hidden
          className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-[var(--line)]"
        />

        {timeline.map((entry, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === timeline.length - 1;
          return (
            <li key={entry.status} className="relative flex items-start gap-4">
              {/* Bolinha de etapa */}
              <div
                className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center border-[2px] jp text-base transition-all ${
                  entry.current
                    ? "border-[var(--akira-red)] bg-[var(--akira-red)] text-[var(--ink)] shadow-[0_0_16px_rgba(193,18,31,0.5)] pulse-neon"
                    : entry.completed
                      ? "border-[var(--akira-green)] bg-[var(--akira-green)] text-[var(--bg)]"
                      : "border-[var(--line)] bg-[var(--bg-3)] text-[var(--ink-muted)]"
                }`}
              >
                {entry.completed && !entry.current ? "✓" : entry.kanji}
              </div>

              <div className="flex-1 min-w-0 pb-2">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <p
                    className={`display text-base ${
                      entry.current
                        ? "text-[var(--akira-red)] glow-red"
                        : entry.completed
                          ? "text-[var(--ink)]"
                          : "text-[var(--ink-muted)]"
                    }`}
                  >
                    {entry.label}
                    {entry.current && (
                      <span className="ml-2 inline-block px-1.5 py-0.5 align-middle text-[9px] font-mono font-bold bg-[var(--akira-red)] text-[var(--ink)]">
                        AGORA
                      </span>
                    )}
                  </p>
                  <span
                    className={`font-mono text-[10px] uppercase tracking-widest ${
                      entry.completed ? "text-[var(--ink-soft)]" : "text-[var(--ink-muted)]"
                    }`}
                  >
                    {entry.completed
                      ? dateTimeFmt.format(entry.timestamp)
                      : `em ~${formatRelative(entry.timestamp)}`}
                  </span>
                </div>
                <p
                  className={`mt-1 font-mono text-xs ${
                    entry.current
                      ? "text-[var(--ink)]"
                      : entry.completed
                        ? "text-[var(--ink-soft)]"
                        : "text-[var(--ink-muted)]"
                  }`}
                >
                  {entry.description}
                </p>
                {(isFirst || isLast || entry.current) && (
                  <p className="mt-0.5 font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest">
                    {entry.current
                      ? "> em andamento"
                      : isFirst
                        ? "> inicio"
                        : "> conclusao prevista"}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function formatRelative(future: Date): string {
  const diffMs = future.getTime() - Date.now();
  if (diffMs <= 0) return "minutos";
  const min = Math.round(diffMs / 60_000);
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  return `${d} dia${d > 1 ? "s" : ""}`;
}
