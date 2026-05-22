/**
 * Comparador visual de uma metrica entre 2 mangas.
 *
 * Mostra valor de cada lado + indicador (▲ vencedor verde / ▼ perdedor) +
 * barra de progresso proporcional. Aceita "higher is better" (score, favorites)
 * e "lower is better" (rank — menor rank = melhor).
 */

type Props = {
  label: string;
  jp?: string;
  a: number | null;
  b: number | null;
  format?: (n: number) => string;
  lowerIsBetter?: boolean;
};

function fmt(n: number | null, formatter?: (x: number) => string): string {
  if (n == null) return "—";
  return formatter ? formatter(n) : String(n);
}

export default function StatCompare({
  label,
  jp,
  a,
  b,
  format,
  lowerIsBetter = false,
}: Props) {
  // Determina vencedor — null vira "pior" automaticamente
  let aWins = false;
  let bWins = false;
  if (a != null && b != null) {
    if (lowerIsBetter) {
      aWins = a < b;
      bWins = b < a;
    } else {
      aWins = a > b;
      bWins = b > a;
    }
  } else if (a != null && b == null) {
    aWins = true;
  } else if (b != null && a == null) {
    bWins = true;
  }

  // Barra proporcional — normaliza pelo maior dos 2 (so visual)
  const max = Math.max(a ?? 0, b ?? 0, 1);
  const aPct = a != null ? Math.min(100, (a / max) * 100) : 0;
  const bPct = b != null ? Math.min(100, (b / max) * 100) : 0;

  return (
    <div className="border-2 border-ink bg-bg-2/40 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="eyebrow text-ink-muted text-[10px]">{label}</span>
        {jp && <span className="jp text-akira-yellow text-xs">{jp}</span>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Lado A — vermelho */}
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            {aWins && (
              <span className="text-akira-green font-mono text-xs font-bold" title="Vencedor">
                ▲
              </span>
            )}
            {bWins && (
              <span className="text-akira-red/60 font-mono text-xs" title="Perdedor">
                ▼
              </span>
            )}
            <span
              className={`font-mono numerals text-base ${aWins ? "text-akira-green font-bold" : "text-ink"}`}
            >
              {fmt(a, format)}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 bg-bg-3 border border-ink overflow-hidden">
            <div
              className={`h-full ${aWins ? "bg-akira-green" : "bg-akira-red"} transition-all`}
              style={{ width: `${aPct}%` }}
            />
          </div>
        </div>

        {/* Lado B — cyan */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5">
            <span
              className={`font-mono numerals text-base ${bWins ? "text-akira-green font-bold" : "text-ink"}`}
            >
              {fmt(b, format)}
            </span>
            {bWins && (
              <span className="text-akira-green font-mono text-xs font-bold" title="Vencedor">
                ▲
              </span>
            )}
            {aWins && (
              <span className="text-akira-cyan/60 font-mono text-xs" title="Perdedor">
                ▼
              </span>
            )}
          </div>
          <div className="mt-1.5 h-1.5 bg-bg-3 border border-ink overflow-hidden flex justify-end">
            <div
              className={`h-full ${bWins ? "bg-akira-green" : "bg-akira-cyan"} transition-all`}
              style={{ width: `${bPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper exportado pra calcular quantas stats cada lado venceu.
 * Usado no page.tsx pra decidir o badge "Vencedor".
 */
export function countWins(
  comparisons: Array<{ a: number | null; b: number | null; lowerIsBetter?: boolean }>,
): { aWins: number; bWins: number; ties: number } {
  let aWins = 0;
  let bWins = 0;
  let ties = 0;
  for (const c of comparisons) {
    if (c.a == null && c.b == null) {
      ties++;
      continue;
    }
    if (c.a == null) {
      bWins++;
      continue;
    }
    if (c.b == null) {
      aWins++;
      continue;
    }
    if (c.a === c.b) {
      ties++;
    } else if (c.lowerIsBetter) {
      if (c.a < c.b) aWins++;
      else bWins++;
    } else {
      if (c.a > c.b) aWins++;
      else bWins++;
    }
  }
  return { aWins, bWins, ties };
}
