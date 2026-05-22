"use client";

import { useState } from "react";
import { lookupCep } from "@/lib/viacep";

export type AddressData = {
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
};

type Props = {
  value: AddressData;
  onChange: (data: AddressData) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function StepAddress({ value, onChange, onNext, onBack }: Props) {
  const [cepLoading, setCepLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof AddressData, string>>>({});

  const handleCepBlur = async () => {
    const cleaned = value.cep.replace(/\D/g, "");
    if (cleaned.length !== 8) return;
    setCepLoading(true);
    setErrors((e) => ({ ...e, cep: undefined }));

    const result = await lookupCep(cleaned);
    setCepLoading(false);

    if (!result) {
      setErrors((e) => ({ ...e, cep: "CEP nao encontrado" }));
      return;
    }

    onChange({
      ...value,
      street: result.logradouro || value.street,
      district: result.bairro || value.district,
      city: result.localidade || value.city,
      state: result.uf || value.state,
    });
  };

  const handleNext = () => {
    const errs: Partial<Record<keyof AddressData, string>> = {};
    const cleanedCep = value.cep.replace(/\D/g, "");
    if (cleanedCep.length !== 8) errs.cep = "CEP invalido (8 digitos)";
    if (!value.street.trim()) errs.street = "Obrigatorio";
    if (!value.number.trim()) errs.number = "Obrigatorio";
    if (!value.district.trim()) errs.district = "Obrigatorio";
    if (!value.city.trim()) errs.city = "Obrigatorio";
    if (!value.state.trim()) errs.state = "UF";

    setErrors(errs);
    if (Object.keys(errs).length === 0) onNext();
  };

  const set = <K extends keyof AddressData>(k: K, v: AddressData[K]) => {
    onChange({ ...value, [k]: v });
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  return (
    <div className="space-y-8">
      <header className="border-b-2 border-[var(--line)] pb-6">
        <p className="eyebrow">Step 02 // 第二段</p>
        <div className="mt-2 flex items-baseline gap-4">
          <span className="display text-7xl text-[var(--akira-red)] glow-red leading-none">02</span>
          <div>
            <h2 className="display text-4xl text-[var(--ink)] leading-none">ENDERECO</h2>
            <p className="jp mt-1 text-lg text-[var(--ink-soft)]">配送先</p>
          </div>
        </div>
        <p className="mt-3 text-[var(--ink-muted)] text-sm">
          Onde devemos entregar seus volumes?
        </p>
      </header>

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[200px_1fr]">
          <Field label="CEP" kanji="郵便" error={errors.cep}>
            <input
              type="text"
              inputMode="numeric"
              value={value.cep}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 8);
                const formatted = v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v;
                set("cep", formatted);
              }}
              onBlur={handleCepBlur}
              placeholder="00000-000"
              className={inputCls(!!errors.cep)}
            />
            {cepLoading && (
              <p className="mt-1 font-mono text-[10px] text-[var(--akira-cyan)] uppercase">{">"} buscando...</p>
            )}
          </Field>

          <Field label="Rua / Logradouro" kanji="街" error={errors.street}>
            <input
              type="text"
              value={value.street}
              onChange={(e) => set("street", e.target.value)}
              placeholder="Av. Paulista"
              className={inputCls(!!errors.street)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[140px_1fr]">
          <Field label="Numero" kanji="号" error={errors.number}>
            <input
              type="text"
              value={value.number}
              onChange={(e) => set("number", e.target.value)}
              placeholder="1234"
              className={inputCls(!!errors.number)}
            />
          </Field>
          <Field label="Complemento" kanji="補" optional>
            <input
              type="text"
              value={value.complement}
              onChange={(e) => set("complement", e.target.value)}
              placeholder="Apto 42, bloco B..."
              className={inputCls(false)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_1fr_100px]">
          <Field label="Bairro" kanji="区" error={errors.district}>
            <input
              type="text"
              value={value.district}
              onChange={(e) => set("district", e.target.value)}
              className={inputCls(!!errors.district)}
            />
          </Field>
          <Field label="Cidade" kanji="市" error={errors.city}>
            <input
              type="text"
              value={value.city}
              onChange={(e) => set("city", e.target.value)}
              className={inputCls(!!errors.city)}
            />
          </Field>
          <Field label="UF" kanji="州" error={errors.state}>
            <input
              type="text"
              value={value.state}
              onChange={(e) => set("state", e.target.value.toUpperCase().slice(0, 2))}
              placeholder="SP"
              className={inputCls(!!errors.state)}
            />
          </Field>
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={handleNext} />
    </div>
  );
}

function Field({
  label,
  kanji,
  error,
  optional,
  children,
}: {
  label: string;
  kanji: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-baseline gap-2">
        <span className="eyebrow !text-[var(--ink-soft)]">{label}</span>
        <span className="jp text-xs text-[var(--ink-muted)]">{kanji}</span>
        {optional && <span className="font-mono text-[10px] text-[var(--ink-muted)]">opcional</span>}
        {error && <span className="ml-auto text-[10px] text-[var(--akira-red)] font-mono uppercase">! {error}</span>}
      </div>
      {children}
    </label>
  );
}

function inputCls(error: boolean) {
  return `w-full border-[2px] bg-[var(--bg-3)] px-4 py-3.5 font-mono text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-muted)] focus:border-[var(--akira-red)] focus:shadow-[0_0_12px_rgba(193,18,31,0.4)] ${
    error ? "border-[var(--akira-red)]" : "border-[var(--line)]"
  }`;
}

function NavButtons({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center justify-between pt-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 border-[2px] border-[var(--ink)] bg-transparent px-5 py-3 text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--bg)]"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="square" d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        <span className="font-mono text-xs uppercase tracking-widest">Voltar</span>
      </button>
      <button
        type="button"
        onClick={onNext}
        className="shimmer group relative inline-flex items-center gap-3 border-[3px] border-[var(--ink)] bg-[var(--akira-red)] px-8 py-4 text-[var(--ink)] shadow-hard transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
      >
        <span className="display text-lg uppercase tracking-wider">Proximo</span>
        <span className="jp text-base">次</span>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="square" d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}
