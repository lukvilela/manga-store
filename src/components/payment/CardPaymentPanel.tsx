"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/context/ToastContext";

type Props = {
  amount: number;
  installments: number;
  submitting: boolean;
  setSubmitting: (v: boolean) => void;
  onConfirm: (msg: string) => void;
};

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

// Algoritmo Luhn pra validar numero de cartao (mod 10)
// Itera de tras pra frente, dobra cada segundo digito, soma todos, mod 10 === 0
function luhnCheck(num: string): boolean {
  const digits = num.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

// Detecta bandeira pelo prefixo (mock simplificado)
function detectBrand(num: string): string {
  const d = num.replace(/\D/g, "");
  if (/^4/.test(d)) return "VISA";
  if (/^5[1-5]/.test(d) || /^2[2-7]/.test(d)) return "MASTER";
  if (/^3[47]/.test(d)) return "AMEX";
  if (/^6/.test(d)) return "ELO";
  return "CARD";
}

function formatCardNumber(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 16);
  return d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function formatExpiry(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  if (d.length < 3) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

function validateExpiry(v: string): boolean {
  const m = v.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return false;
  const mm = parseInt(m[1], 10);
  const yy = parseInt(m[2], 10);
  if (mm < 1 || mm > 12) return false;
  // Aceita ate 2099 (mock)
  const now = new Date();
  const curYY = now.getFullYear() % 100;
  const curMM = now.getMonth() + 1;
  if (yy < curYY) return false;
  if (yy === curYY && mm < curMM) return false;
  return true;
}

export default function CardPaymentPanel({
  amount,
  installments,
  submitting,
  setSubmitting,
  onConfirm,
}: Props) {
  const { show } = useToast();
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [flipped, setFlipped] = useState(false);

  const cleanNumber = number.replace(/\s/g, "");
  const brand = detectBrand(cleanNumber);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (cleanNumber && cleanNumber.length >= 13 && !luhnCheck(cleanNumber))
      e.number = "Numero do cartao invalido";
    if (name && name.trim().length < 3) e.name = "Nome muito curto";
    if (expiry && !validateExpiry(expiry)) e.expiry = "Validade invalida";
    if (cvv && (cvv.length < 3 || cvv.length > 4)) e.cvv = "CVV deve ter 3 ou 4 digitos";
    return e;
  }, [cleanNumber, name, expiry, cvv]);

  const formValid =
    cleanNumber.length >= 13 &&
    luhnCheck(cleanNumber) &&
    name.trim().length >= 3 &&
    validateExpiry(expiry) &&
    cvv.length >= 3 &&
    cvv.length <= 4;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid || submitting) return;

    setSubmitting(true);

    // Easter egg: cartao recusado
    if (cleanNumber === "4000000000000002") {
      setTimeout(() => {
        setSubmitting(false);
        show("Cartao recusado · use outro", "error", 4000);
      }, 1500);
      return;
    }

    // Easter egg: test card aprova instantaneo
    if (cleanNumber === "4242424242424242") {
      show("Test card detectado!", "info", 2500);
      setTimeout(() => onConfirm("Pagamento aprovado · obrigado!"), 600);
      return;
    }

    // Fluxo normal: 2s de "processamento"
    setTimeout(() => onConfirm("Pagamento aprovado!"), 2000);
  };

  const installmentValue = amount / Math.max(1, installments);

  return (
    <div className="panel-frame bg-[var(--bg-2)] p-6 md:p-10">
      <header className="mb-6 border-b-2 border-[var(--line)] pb-4">
        <div className="flex items-baseline gap-3">
          <span className="display text-3xl text-[var(--ink)] leading-none">PAGAR COM CARTAO</span>
          <span className="jp text-xl text-[var(--akira-cyan)] glow-cyan">卡</span>
        </div>
        <p className="mt-2 font-mono text-xs text-[var(--ink-muted)] uppercase tracking-wider">
          {">"} {installments > 1 ? `${installments}x de ${fmt.format(installmentValue)} sem juros` : `pagamento unico ${fmt.format(amount)}`}
        </p>
      </header>

      {/* Card preview */}
      <div className="mx-auto mb-6 max-w-md">
        <div
          className={`relative aspect-[1.6/1] w-full transition-transform duration-500 ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Face frente */}
          <div
            className="absolute inset-0 overflow-hidden border-[3px] border-[var(--ink)] bg-[var(--akira-red)] p-5 shadow-hard-lg"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="absolute inset-0 halftone opacity-25" />
            <div className="absolute right-3 top-3 onomatopeia text-sm">{brand}</div>
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-12 border-[2px] border-[var(--ink)] bg-[var(--akira-yellow)] shadow-hard" />
                <span className="jp text-xl text-[var(--ink)] glow-red">金</span>
              </div>
              <div>
                <p className="display numerals text-2xl text-[var(--ink)] tracking-[0.15em] glow-red md:text-3xl">
                  {(formatCardNumber(cleanNumber) || "•••• •••• •••• ••••").padEnd(19, "•")}
                </p>
              </div>
              <div className="flex items-end justify-between text-[var(--ink)]">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest opacity-70">titular</p>
                  <p className="display text-sm uppercase tracking-wider truncate max-w-[200px]">
                    {name || "NOME COMPLETO"}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest opacity-70">validade</p>
                  <p className="display numerals text-base">{expiry || "MM/AA"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Face verso */}
          <div
            className="absolute inset-0 overflow-hidden border-[3px] border-[var(--ink)] bg-[var(--bg-3)] p-5 shadow-hard-lg"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="absolute inset-x-0 top-6 h-10 bg-[var(--ink)]" />
            <div className="absolute right-5 top-20 flex h-10 w-3/4 items-center justify-end border-[2px] border-[var(--ink)] bg-[var(--bg)] px-3">
              <span className="font-mono numerals text-lg text-[var(--ink)] tracking-widest">
                {cvv || "•••"}
              </span>
            </div>
            <div className="absolute bottom-3 left-5 jp text-[var(--akira-red)] glow-red text-2xl">
              神
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="eyebrow !text-[var(--akira-cyan)] block mb-1.5">
            Numero do cartao
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="0000 0000 0000 0000"
            value={number}
            onChange={(e) => setNumber(formatCardNumber(e.target.value))}
            onFocus={() => setFlipped(false)}
            disabled={submitting}
            className={`w-full border-[2px] bg-[var(--bg-3)] px-4 py-3 font-mono numerals text-lg text-[var(--ink)] outline-none transition focus:border-[var(--akira-cyan)] ${
              errors.number ? "border-[var(--akira-red)]" : "border-[var(--line)]"
            }`}
          />
          {errors.number && (
            <p className="mt-1 font-mono text-[10px] text-[var(--akira-red)]">{errors.number}</p>
          )}
        </div>

        <div>
          <label className="eyebrow !text-[var(--akira-cyan)] block mb-1.5">
            Nome impresso no cartao
          </label>
          <input
            type="text"
            autoComplete="cc-name"
            placeholder="NOME COMPLETO"
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            onFocus={() => setFlipped(false)}
            disabled={submitting}
            className={`w-full border-[2px] bg-[var(--bg-3)] px-4 py-3 font-mono text-sm text-[var(--ink)] outline-none transition focus:border-[var(--akira-cyan)] ${
              errors.name ? "border-[var(--akira-red)]" : "border-[var(--line)]"
            }`}
          />
          {errors.name && (
            <p className="mt-1 font-mono text-[10px] text-[var(--akira-red)]">{errors.name}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="eyebrow !text-[var(--akira-cyan)] block mb-1.5">Validade</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/AA"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              onFocus={() => setFlipped(false)}
              disabled={submitting}
              className={`w-full border-[2px] bg-[var(--bg-3)] px-4 py-3 font-mono numerals text-base text-[var(--ink)] outline-none transition focus:border-[var(--akira-cyan)] ${
                errors.expiry ? "border-[var(--akira-red)]" : "border-[var(--line)]"
              }`}
            />
            {errors.expiry && (
              <p className="mt-1 font-mono text-[10px] text-[var(--akira-red)]">{errors.expiry}</p>
            )}
          </div>
          <div>
            <label className="eyebrow !text-[var(--akira-cyan)] block mb-1.5">CVV</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
              onFocus={() => setFlipped(true)}
              onBlur={() => setFlipped(false)}
              disabled={submitting}
              className={`w-full border-[2px] bg-[var(--bg-3)] px-4 py-3 font-mono numerals text-base text-[var(--ink)] outline-none transition focus:border-[var(--akira-cyan)] ${
                errors.cvv ? "border-[var(--akira-red)]" : "border-[var(--line)]"
              }`}
            />
            {errors.cvv && (
              <p className="mt-1 font-mono text-[10px] text-[var(--akira-red)]">{errors.cvv}</p>
            )}
          </div>
        </div>

        {/* Disclaimer mock */}
        <div className="flex items-start gap-3 border-[2px] border-dashed border-[var(--akira-cyan)] bg-[var(--bg-2)] p-3">
          <span className="jp text-lg text-[var(--akira-cyan)]">安</span>
          <p className="font-mono text-[10px] text-[var(--ink-soft)] uppercase tracking-wider">
            {">"} ambiente de demo · use 4242 4242 4242 4242 pra aprovar instantaneo · 4000 0000 0000 0002 pra simular recusa
          </p>
        </div>

        {/* Submit */}
        <div className="border-t-2 border-dashed border-[var(--line)] pt-5">
          <button
            type="submit"
            disabled={!formValid || submitting}
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
                <span className="display text-xl uppercase tracking-wider">Processar pagamento</span>
                <span className="jp text-base">払</span>
                <span className="display text-sm opacity-70 numerals">{fmt.format(amount)}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
