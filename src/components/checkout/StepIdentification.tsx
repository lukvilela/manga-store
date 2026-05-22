"use client";

import { useState } from "react";
import type { AuthUser } from "@/context/AuthContext";

export type IdentificationData = {
  mode: "logged" | "guest";
  name: string;
  email: string;
};

type Props = {
  user: AuthUser | null;
  value: IdentificationData;
  onChange: (data: IdentificationData) => void;
  onNext: () => void;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function StepIdentification({ user, value, onChange, onNext }: Props) {
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const handleNext = () => {
    if (value.mode === "logged" && user) {
      onNext();
      return;
    }
    const errs: { name?: string; email?: string } = {};
    if (!value.name.trim()) errs.name = "Informe seu nome.";
    if (!emailRegex.test(value.email)) errs.email = "Email invalido.";
    setErrors(errs);
    if (Object.keys(errs).length === 0) onNext();
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <header className="border-b-2 border-[var(--line)] pb-6">
        <p className="eyebrow">Step 01 // 第一段</p>
        <div className="mt-2 flex items-baseline gap-4">
          <span className="display text-7xl text-[var(--akira-red)] glow-red leading-none">01</span>
          <div>
            <h2 className="display text-4xl text-[var(--ink)] leading-none">IDENTIFICACAO</h2>
            <p className="jp mt-1 text-lg text-[var(--ink-soft)]">確認</p>
          </div>
        </div>
        <p className="mt-3 text-[var(--ink-muted)] text-sm">
          Quem esta finalizando este pedido?
        </p>
      </header>

      {user ? (
        <div className="space-y-5">
          <div className="panel-frame p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center border-[3px] border-[var(--ink)] bg-[var(--akira-cyan)] text-[var(--bg)] text-2xl font-black">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="eyebrow">Usuario conectado</p>
                <p className="display text-2xl text-[var(--ink)]">{user.name}</p>
                <p className="font-mono text-sm text-[var(--ink-muted)] mt-1">{user.email}</p>
              </div>
              <span className="onomatopeia text-xs">OK!</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onChange({ ...value, mode: value.mode === "logged" ? "guest" : "logged" })}
            className="font-mono text-xs text-[var(--ink-muted)] hover:text-[var(--akira-cyan)] uppercase tracking-widest underline underline-offset-4"
          >
            {value.mode === "logged" ? "> usar outro email (convidado)" : "> usar conta logada"}
          </button>
        </div>
      ) : null}

      {(!user || value.mode === "guest") && (
        <div className="space-y-5">
          <div className="rounded-none border-[2px] border-dashed border-[var(--akira-yellow)] bg-[var(--bg-2)] p-4">
            <p className="eyebrow !text-[var(--akira-yellow)]">! Convidado</p>
            <p className="text-sm text-[var(--ink-soft)] mt-1">
              Voce esta finalizando sem login. Pedido sera vinculado ao email informado.
            </p>
          </div>

          <FieldText
            label="Nome completo"
            kanji="名"
            value={value.name}
            onChange={(v) => {
              onChange({ ...value, name: v });
              setErrors((e) => ({ ...e, name: undefined }));
            }}
            error={errors.name}
            placeholder="Kaneda Shotaro"
          />
          <FieldText
            label="Email"
            kanji="@"
            type="email"
            value={value.email}
            onChange={(v) => {
              onChange({ ...value, email: v });
              setErrors((e) => ({ ...e, email: undefined }));
            }}
            error={errors.email}
            placeholder="kaneda@neo-tokyo.jp"
          />
        </div>
      )}

      <div className="flex items-center justify-end pt-4">
        <button
          type="button"
          onClick={handleNext}
          className="shimmer group relative inline-flex items-center gap-3 border-[3px] border-[var(--ink)] bg-[var(--akira-red)] px-8 py-4 text-[var(--ink)] shadow-hard transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
        >
          <span className="display text-lg uppercase tracking-wider">Proximo</span>
          <span className="jp text-base">次</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="square" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function FieldText({
  label,
  kanji,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
}: {
  label: string;
  kanji: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-baseline gap-2">
        <span className="eyebrow !text-[var(--ink-soft)]">{label}</span>
        <span className="jp text-xs text-[var(--ink-muted)]">{kanji}</span>
        {error && <span className="ml-auto text-[10px] text-[var(--akira-red)] font-mono uppercase">! {error}</span>}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border-[2px] bg-[var(--bg-3)] px-4 py-3.5 font-mono text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-muted)] focus:border-[var(--akira-red)] focus:shadow-[0_0_12px_rgba(193,18,31,0.4)] ${
          error ? "border-[var(--akira-red)]" : "border-[var(--line)]"
        }`}
      />
    </label>
  );
}
