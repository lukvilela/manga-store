"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/context/ToastContext";

type Props = {
  amount: number;
  submitting: boolean;
  onConfirm: () => void;
};

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

// Gera barras visuais com larguras semi-randomicas mas deterministicas
// (seed = amount), pra imitar codigo de barras Interleaved 2 of 5.
function buildBarsPattern(seed: number, count = 90): number[] {
  let s = seed >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: count }, () => {
    // 1-4px (barras finas/grossas)
    return 1 + Math.floor(rand() * 4);
  });
}

const BOLETO_CODE = "34191.79001 01043.510047 91020.150008 5 89260000010000";

export default function BoletoPaymentPanel({ amount, submitting, onConfirm }: Props) {
  const { show } = useToast();
  const [copied, setCopied] = useState(false);

  const bars = useMemo(() => buildBarsPattern(Math.floor(amount * 100) + 7, 95), [amount]);

  // Data de vencimento: hoje + 3 dias uteis (aprox)
  const dueDate = useMemo(() => {
    const d = new Date();
    let added = 0;
    while (added < 3) {
      d.setDate(d.getDate() + 1);
      const day = d.getDay();
      if (day !== 0 && day !== 6) added++;
    }
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(BOLETO_CODE.replace(/\s/g, ""));
      setCopied(true);
      show("Codigo do boleto copiado!", "success", 2500);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      show("Nao foi possivel copiar — selecione manualmente", "error", 3000);
    }
  };

  const handlePrint = () => {
    show("Abrindo dialogo de impressao...", "info", 2000);
    setTimeout(() => {
      try {
        window.print();
      } catch {
        // ignore
      }
    }, 400);
  };

  return (
    <div className="panel-frame bg-[var(--bg-2)] p-6 md:p-10">
      <header className="mb-6 border-b-2 border-[var(--line)] pb-4">
        <div className="flex items-baseline gap-3">
          <span className="display text-3xl text-[var(--ink)] leading-none">BOLETO BANCARIO</span>
          <span className="jp text-xl text-[var(--akira-yellow)] glow-yellow">票</span>
        </div>
        <p className="mt-2 font-mono text-xs text-[var(--ink-muted)] uppercase tracking-wider">
          {">"} pague em qualquer banco, lotericas ou app · 3% de desconto ja aplicado
        </p>
      </header>

      {/* Cabecalho info "ficha" boleto */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Field label="Beneficiario" value="AKIRA MANGAS LTDA" />
        <Field label="CNPJ" value="00.000.000/0001-00" mono />
        <Field label="Vencimento" value={dueDate} mono accent="var(--akira-yellow)" />
        <Field label="Valor" value={fmt.format(amount)} mono accent="var(--akira-red)" />
      </div>

      {/* Codigo de barras VISUAL */}
      <div className="border-[3px] border-[var(--ink)] bg-white p-4 shadow-hard">
        <div className="flex h-24 items-end gap-[1px]">
          {bars.map((w, i) => (
            <div
              key={i}
              className="bg-black"
              style={{ width: `${w}px`, height: "100%" }}
              aria-hidden
            />
          ))}
        </div>
        <p className="mt-3 text-center font-mono numerals text-base text-black tracking-wider">
          {BOLETO_CODE}
        </p>
      </div>

      {/* Acoes */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleCopy}
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 border-[2px] border-[var(--ink)] bg-[var(--bg-3)] px-4 py-3 text-[var(--ink)] transition hover:bg-[var(--akira-cyan)] hover:text-[var(--bg)] disabled:opacity-60"
        >
          <span className="display text-sm uppercase tracking-wider">
            {copied ? "copiado!" : "copiar codigo"}
          </span>
          <span className="jp text-xs">{copied ? "完" : "複"}</span>
        </button>
        <button
          type="button"
          onClick={handlePrint}
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 border-[2px] border-[var(--ink)] bg-[var(--bg-3)] px-4 py-3 text-[var(--ink)] transition hover:bg-[var(--akira-yellow)] hover:text-[var(--bg)] disabled:opacity-60"
        >
          <span className="display text-sm uppercase tracking-wider">Imprimir boleto</span>
          <span className="jp text-xs">印</span>
        </button>
      </div>

      {/* Aviso prazo */}
      <div className="mt-5 flex items-start gap-3 border-l-4 border-[var(--akira-yellow)] bg-[var(--bg-2)] p-3">
        <span className="jp text-2xl text-[var(--akira-yellow)] glow-yellow">期</span>
        <div>
          <p className="font-mono text-xs text-[var(--ink)]">
            Vence em 3 dias uteis · compensacao em ate 2 dias
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-wider">
            {">"} apos pagamento, separacao comeca quando o banco confirmar
          </p>
        </div>
      </div>

      {/* Simular compensacao */}
      <div className="mt-8 border-t-2 border-dashed border-[var(--line)] pt-6">
        <button
          type="button"
          onClick={onConfirm}
          disabled={submitting}
          className="shimmer group relative flex w-full items-center justify-center gap-3 border-[3px] border-[var(--ink)] bg-[var(--akira-red)] px-8 py-5 text-[var(--ink)] shadow-hard transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-hard"
        >
          {submitting ? (
            <>
              <span className="h-3 w-3 animate-pulse rounded-full bg-[var(--ink)]" />
              <span className="display text-xl uppercase tracking-wider">Compensando</span>
              <span className="jp text-base pulse-neon">処理中</span>
            </>
          ) : (
            <>
              <span className="display text-xl uppercase tracking-wider">Simular compensacao</span>
              <span className="jp text-base">確</span>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="square" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </>
          )}
        </button>
        <p className="mt-3 text-center font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest">
          {">"} botao de demo · em producao, baixa via arquivo CNAB do banco
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: string;
}) {
  return (
    <div className="border-[2px] border-[var(--line)] bg-[var(--bg-3)] px-3 py-2">
      <p className="eyebrow !text-[var(--ink-muted)] text-[9px]">{label}</p>
      <p
        className={`mt-0.5 text-sm ${mono ? "font-mono numerals" : ""}`}
        style={{ color: accent ?? "var(--ink)" }}
      >
        {value}
      </p>
    </div>
  );
}
