"use client";

type Step = {
  num: number;
  kanji: string;
  label: string;
};

const STEPS: Step[] = [
  { num: 1, kanji: "認", label: "Identificacao" },
  { num: 2, kanji: "宅", label: "Endereco" },
  { num: 3, kanji: "払", label: "Frete & Pagamento" },
  { num: 4, kanji: "確", label: "Confirmacao" },
];

export default function CheckoutStepper({ current }: { current: number }) {
  return (
    <div className="relative w-full">
      {/* Linha de fundo conectora */}
      <div className="absolute left-0 right-0 top-7 hidden h-[3px] bg-[var(--line)] sm:block" />
      <div
        className="absolute left-0 top-7 hidden h-[3px] bg-[var(--akira-red)] transition-all duration-700 sm:block"
        style={{ width: `${((current - 1) / (STEPS.length - 1)) * 100}%` }}
      />

      <ol className="relative grid grid-cols-4 gap-2 sm:gap-6">
        {STEPS.map((s) => {
          const isDone = s.num < current;
          const isActive = s.num === current;
          const isFuture = s.num > current;

          return (
            <li key={s.num} className="flex flex-col items-center text-center">
              <div
                className={`relative flex h-14 w-14 items-center justify-center border-[3px] font-mono text-lg font-bold transition-all duration-300 sm:h-16 sm:w-16 sm:text-xl ${
                  isActive
                    ? "border-[var(--akira-red)] bg-[var(--akira-red)] text-[var(--ink)] shadow-[0_0_24px_rgba(193,18,31,0.6)] scale-110"
                    : isDone
                      ? "border-[var(--akira-cyan)] bg-[var(--akira-cyan)] text-[var(--bg)]"
                      : "border-[var(--line)] bg-[var(--bg-2)] text-[var(--ink-muted)]"
                }`}
                style={{ borderRadius: "0" }}
              >
                {isDone ? (
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M4 12l5 5L20 6" />
                  </svg>
                ) : (
                  <span className="display">{s.num}</span>
                )}
                {isActive && (
                  <span className="pointer-events-none absolute -inset-1 border-[2px] border-[var(--akira-red)] opacity-50 animate-pulse" />
                )}
              </div>

              <div className="mt-3 flex flex-col items-center gap-0.5">
                <span
                  className={`jp text-xs ${
                    isActive
                      ? "text-[var(--akira-red)]"
                      : isDone
                        ? "text-[var(--akira-cyan)]"
                        : "text-[var(--ink-muted)]"
                  }`}
                >
                  {s.kanji}
                </span>
                <span
                  className={`eyebrow !text-[10px] ${
                    isActive
                      ? "!text-[var(--ink)]"
                      : isDone
                        ? "!text-[var(--ink-soft)]"
                        : "!text-[var(--ink-muted)]"
                  } ${isFuture ? "opacity-60" : ""}`}
                >
                  {s.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
