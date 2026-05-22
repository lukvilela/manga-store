"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/context/ToastContext";

type Props = {
  amount: number;
  submitting: boolean;
  onConfirm: () => void;
};

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

// Gera pattern de QR mock (visual apenas) usando hash deterministico do amount.
// Nao e um QR real — so PARECE um QR (alta densidade, com finder patterns).
function buildQrPattern(seed: number, size = 25): boolean[][] {
  // PRNG simples (mulberry32) pra reproducibilidade
  let s = seed >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const grid: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => rand() > 0.5)
  );
  // 3 finder patterns (cantos: top-left, top-right, bottom-left)
  const stamp = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const onEdge = r === 0 || r === 6 || c === 0 || c === 6;
        const inCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[r0 + r][c0 + c] = onEdge || inCore;
      }
    }
    // anel branco
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = r0 + r;
        const cc = c0 + c;
        if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
        if (r === -1 || r === 7 || c === -1 || c === 7) grid[rr][cc] = false;
      }
    }
    // reimprime borda+core depois do limpar anel
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const onEdge = r === 0 || r === 6 || c === 0 || c === 6;
        const inCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[r0 + r][c0 + c] = onEdge || inCore;
      }
    }
  };
  stamp(0, 0);
  stamp(0, size - 7);
  stamp(size - 7, 0);
  // timing patterns
  for (let i = 8; i < size - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }
  return grid;
}

// Codigo PIX copia-e-cola mock no padrao EMV BR Code
function buildPixCode(amount: number): string {
  const cents = Math.round(amount * 100).toString().padStart(10, "0");
  return `00020126580014BR.GOV.BCB.PIX0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540${amount.toFixed(
    2
  )}5802BR5913AKIRA MANGAS6009SAO PAULO62290525AKIRA${cents}NEOTOKYO20266304E5F1`;
}

export default function PixPaymentPanel({ amount, submitting, onConfirm }: Props) {
  const { show } = useToast();
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30 * 60); // 30 minutos

  // Pattern deterministico baseado no amount pra nao tremer entre re-renders
  const pattern = useMemo(() => {
    const seed = Math.floor(amount * 100) + 42;
    return buildQrPattern(seed, 27);
  }, [amount]);

  const pixCode = useMemo(() => buildPixCode(amount), [amount]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const mm = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const ss = (secondsLeft % 60).toString().padStart(2, "0");
  const expired = secondsLeft === 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      show("Codigo PIX copiado!", "success", 2500);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      show("Nao foi possivel copiar — selecione manualmente", "error", 3000);
    }
  };

  const size = pattern.length;
  const cell = 100 / size;

  return (
    <div className="panel-frame bg-[var(--bg-2)] p-6 md:p-10">
      <header className="mb-6 border-b-2 border-[var(--line)] pb-4">
        <div className="flex items-baseline gap-3">
          <span className="display text-3xl text-[var(--ink)] leading-none">PAGAR COM PIX</span>
          <span className="jp text-xl text-[var(--akira-green)] glow-green">瞬</span>
        </div>
        <p className="mt-2 font-mono text-xs text-[var(--ink-muted)] uppercase tracking-wider">
          {">"} escaneie o qr ou use o codigo copia-e-cola
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-[260px_1fr] md:items-start">
        {/* QR mock */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative border-[3px] border-[var(--ink)] bg-white p-3 shadow-hard">
            <svg
              viewBox="0 0 100 100"
              className="block h-56 w-56"
              xmlns="http://www.w3.org/2000/svg"
              shapeRendering="crispEdges"
              aria-label="QR code mock para pagamento PIX"
            >
              <rect width="100" height="100" fill="white" />
              {pattern.flatMap((row, r) =>
                row.map((on, c) =>
                  on ? (
                    <rect
                      key={`${r}-${c}`}
                      x={c * cell}
                      y={r * cell}
                      width={cell}
                      height={cell}
                      fill="black"
                    />
                  ) : null
                )
              )}
            </svg>
            {expired && (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg)]/85 backdrop-blur-sm">
                <span className="display text-2xl text-[var(--akira-yellow)] glow-yellow rotate-[-8deg]">
                  EXPIRADO
                </span>
              </div>
            )}
          </div>
          <p className="font-mono text-xs text-[var(--ink-muted)] uppercase tracking-widest">
            valor: <span className="text-[var(--akira-green)] numerals">{fmt.format(amount)}</span>
          </p>
          <div
            className={`flex items-center gap-2 border-[2px] px-3 py-1 font-mono text-xs uppercase tracking-widest ${
              expired
                ? "border-[var(--akira-yellow)] text-[var(--akira-yellow)]"
                : "border-[var(--akira-cyan)] text-[var(--akira-cyan)]"
            }`}
          >
            <span className="numerals">{mm}:{ss}</span>
            <span className="opacity-70">{expired ? "vencido" : "restantes"}</span>
          </div>
        </div>

        {/* Codigo + instrucoes */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="eyebrow !text-[var(--akira-cyan)] mb-2">Codigo copia e cola</p>
            <div className="border-[2px] border-[var(--line)] bg-[var(--bg-3)] p-3">
              <p className="break-all font-mono text-[10px] text-[var(--ink-soft)] leading-relaxed">
                {pixCode}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 border-[2px] border-[var(--ink)] bg-[var(--bg-3)] px-4 py-3 text-[var(--ink)] transition hover:bg-[var(--akira-cyan)] hover:text-[var(--bg)]"
            >
              <span className="display text-sm uppercase tracking-wider">
                {copied ? "copiado!" : "copiar codigo pix"}
              </span>
              <span className="jp text-xs">{copied ? "完" : "複"}</span>
            </button>
          </div>

          <ol className="space-y-2 border-l-4 border-[var(--akira-cyan)] bg-[var(--bg-2)] py-2 pl-4 text-xs text-[var(--ink-soft)]">
            <li>
              <span className="font-mono font-bold text-[var(--akira-cyan)]">01.</span> Abra o app
              do seu banco
            </li>
            <li>
              <span className="font-mono font-bold text-[var(--akira-cyan)]">02.</span> Escolha
              pagar via PIX / QR Code
            </li>
            <li>
              <span className="font-mono font-bold text-[var(--akira-cyan)]">03.</span> Escaneie ou
              cole o codigo
            </li>
            <li>
              <span className="font-mono font-bold text-[var(--akira-cyan)]">04.</span> Confirme o
              valor e finalize
            </li>
          </ol>

          <div className="flex items-center gap-3 border-[2px] border-dashed border-[var(--akira-yellow)] bg-[var(--bg-2)] p-3">
            <span className="jp text-xl text-[var(--akira-yellow)] glow-yellow">待</span>
            <p className="font-mono text-xs text-[var(--ink)]">
              Aguardando confirmacao · normalmente em segundos
            </p>
          </div>
        </div>
      </div>

      {/* Botao simular pagamento — destaque maximo */}
      <div className="mt-8 border-t-2 border-dashed border-[var(--line)] pt-6">
        <button
          type="button"
          onClick={onConfirm}
          disabled={submitting || expired}
          data-testid="pix-simulate"
          className="shimmer group relative flex w-full items-center justify-center gap-3 border-[3px] border-[var(--ink)] bg-[var(--akira-red)] px-8 py-5 text-[var(--ink)] shadow-hard transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-hard"
        >
          {submitting ? (
            <>
              <span className="h-3 w-3 animate-pulse rounded-full bg-[var(--ink)]" />
              <span className="display text-xl uppercase tracking-wider">Processando</span>
              <span className="jp text-base pulse-neon">処理中</span>
            </>
          ) : (
            <>
              <span className="display text-xl uppercase tracking-wider">Simular pagamento</span>
              <span className="jp text-base">確</span>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="square" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </>
          )}
        </button>
        <p className="mt-3 text-center font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest">
          {">"} botao de demo · em producao, confirmacao via webhook do banco
        </p>
      </div>
    </div>
  );
}
