"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { lookupCep } from "@/lib/viacep";
import { calcShippingQuotes, getZoneName, type ShippingQuote } from "@/lib/shipping";
import { useLastCep } from "@/lib/last-cep";

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const FREE_PAC_THRESHOLD = 250;

type CalcState = {
  quotes: ShippingQuote[];
  uf: string;
  city: string;
  district: string;
  street: string;
  zoneName: string;
};

/**
 * Calculadora de frete pre-checkout. Roda no /carrinho — usa ViaCEP +
 * calcShippingQuotes pra mostrar 3 opcoes (PAC / SEDEX / Retirada).
 * Persiste o CEP usado em localStorage pra hidratar o checkout depois.
 *
 * Auto-carrega o ultimo CEP salvo (se houver) e re-calcula.
 */
export default function ShippingCalculator() {
  const { total, count, couponFreeShipping } = useCart();
  const { cep: stored, hydrated, save } = useLastCep();

  const [cepInput, setCepInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calc, setCalc] = useState<CalcState | null>(null);

  // Auto-load do CEP salvo apos hydration
  useEffect(() => {
    if (!hydrated || !stored?.cep) return;
    if (cepInput || calc) return;
    setCepInput(stored.cep);
    // Re-calcula com dados ja salvos sem precisar bater no ViaCEP
    if (stored.uf) {
      const quotes = calcShippingQuotes({
        uf: stored.uf,
        cep: stored.cep,
        subtotal: total,
        weightKg: 0.3 + count * 0.2,
      });
      setCalc({
        quotes,
        uf: stored.uf,
        city: stored.city ?? "",
        district: stored.district ?? "",
        street: stored.street ?? "",
        zoneName: getZoneName(stored.uf, stored.cep),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Quando o carrinho mudar (item adicionado/removido), refaz o calculo
  // se ja tinha resultado — assim o frete gratis aparece em tempo real.
  useEffect(() => {
    if (!calc) return;
    const quotes = calcShippingQuotes({
      uf: calc.uf,
      cep: cepInput,
      subtotal: total,
      weightKg: 0.3 + count * 0.2,
    });
    setCalc((prev) => (prev ? { ...prev, quotes } : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, count]);

  const handleCepChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setCepInput(formatted);
    if (error) setError(null);
  };

  const handleCalculate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleaned = cepInput.replace(/\D/g, "");
    if (cleaned.length !== 8) {
      setError("CEP invalido (8 digitos)");
      return;
    }
    setLoading(true);
    setError(null);
    const lookup = await lookupCep(cleaned);
    if (!lookup) {
      setLoading(false);
      setError("CEP nao encontrado");
      return;
    }
    const quotes = calcShippingQuotes({
      uf: lookup.uf,
      cep: cepInput,
      subtotal: total,
      weightKg: 0.3 + count * 0.2,
    });
    const result: CalcState = {
      quotes,
      uf: lookup.uf,
      city: lookup.localidade,
      district: lookup.bairro,
      street: lookup.logradouro,
      zoneName: getZoneName(lookup.uf, cepInput),
    };
    setCalc(result);
    setLoading(false);
    save({
      cep: cepInput,
      uf: lookup.uf,
      city: lookup.localidade,
      district: lookup.bairro,
      street: lookup.logradouro,
      savedAt: new Date().toISOString(),
    });
  };

  // Quanto falta pra frete gratis no PAC
  const pacQuote = calc?.quotes.find((q) => q.method === "PAC");
  const showFreePacHint =
    calc && pacQuote && pacQuote.price > 0 && total < FREE_PAC_THRESHOLD;
  const missingForFree = Math.max(0, FREE_PAC_THRESHOLD - total);

  return (
    <section className="panel-frame bg-bg-2 p-5 md:p-6">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <p className="eyebrow text-akira-yellow glow-yellow">配送 · CALCULAR FRETE</p>
          <h3 className="display text-2xl text-ink mt-1">Quanto custa entregar?</h3>
        </div>
        <span className="jp text-akira-cyan text-2xl">便</span>
      </div>

      <p className="text-xs font-mono text-ink-soft uppercase tracking-wider mb-4">
        {">"} Simule frete e prazo antes do checkout
      </p>

      {/* Form */}
      <form onSubmit={handleCalculate} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={cepInput}
            onChange={(e) => handleCepChange(e.target.value)}
            placeholder="00000-000"
            aria-label="CEP de entrega"
            className="flex-1 bg-bg border-2 border-ink px-4 py-3 text-base font-mono uppercase tracking-wider text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-akira-yellow focus:shadow-[0_0_0_3px_rgba(255,209,0,0.2)] transition-all numerals"
            maxLength={9}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 bg-akira-yellow text-bg font-bold text-xs uppercase tracking-widest border-2 border-akira-yellow shadow-hard hover:bg-bg hover:text-akira-yellow disabled:opacity-50 disabled:cursor-wait transition-all"
          >
            {loading ? "..." : "Calcular"}
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-ink-muted uppercase tracking-wider">
          {error ? (
            <span className="text-akira-red">× {error}</span>
          ) : (
            <span>{">"} usado tambem no checkout</span>
          )}
          <a
            href="https://buscacepinter.correios.com.br/app/endereco/index.php"
            target="_blank"
            rel="noopener noreferrer"
            className="text-akira-cyan hover:text-akira-pink transition-colors"
          >
            nao sei meu CEP →
          </a>
        </div>
      </form>

      {/* Resultados */}
      {calc && (
        <div className="mt-5 pt-5 border-t-2 border-dashed border-line space-y-3">
          {/* Endereco resolvido */}
          <div className="flex items-center justify-between text-[10px] font-mono text-ink-muted uppercase tracking-widest">
            <span>
              Zona: <span className="text-akira-cyan">{calc.zoneName}</span>
            </span>
            {calc.city && (
              <span>
                {calc.city} / <span className="text-ink">{calc.uf}</span>
              </span>
            )}
          </div>

          {showFreePacHint && !couponFreeShipping && (
            <div className="p-3 bg-bg border border-akira-yellow/40">
              <p className="text-xs text-akira-yellow font-mono uppercase tracking-wider">
                {">"} Adicione{" "}
                <span className="font-bold numerals">{fmt.format(missingForFree)}</span>{" "}
                pra FRETE GRATIS no PAC
              </p>
            </div>
          )}

          {couponFreeShipping && (
            <div className="p-3 bg-akira-green/10 border border-akira-green/40">
              <p className="text-xs text-akira-green font-mono uppercase tracking-wider flex items-center gap-2">
                <span className="pulse-neon">●</span> CUPOM FRETE GRATIS APLICADO
              </p>
            </div>
          )}

          {/* Lista de quotes */}
          <ul className="space-y-2">
            {calc.quotes.map((q) => {
              const finalPrice = couponFreeShipping ? 0 : q.price;
              const isFreeByCoupon = couponFreeShipping && q.price > 0;
              return (
                <li
                  key={q.method}
                  className={`flex items-center gap-3 border-2 p-3 ${
                    q.available
                      ? "border-line bg-bg-3"
                      : "border-line bg-bg-2 opacity-40"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center border-2 jp text-base ${
                      q.available
                        ? "border-akira-cyan text-akira-cyan"
                        : "border-line text-ink-muted"
                    }`}
                  >
                    {q.kanji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-ink">{q.label}</p>
                    <p className="font-mono text-[10px] text-ink-muted uppercase tracking-wider">
                      {q.eta}
                      {q.reason && !q.available && ` · ${q.reason}`}
                    </p>
                  </div>
                  <div className="text-right">
                    {finalPrice === 0 ? (
                      <span className="display text-base text-akira-green glow-green">
                        GRATIS
                      </span>
                    ) : (
                      <span className="font-mono numerals text-sm text-ink">
                        {fmt.format(finalPrice)}
                      </span>
                    )}
                    {isFreeByCoupon && (
                      <p className="text-[9px] font-mono text-akira-green uppercase">
                        cupom
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="text-[10px] font-mono text-ink-muted uppercase tracking-widest text-center pt-1">
            {">"} valores e prazos sao reaproveitados no checkout
          </p>
        </div>
      )}
    </section>
  );
}
