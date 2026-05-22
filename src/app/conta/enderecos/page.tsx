"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAddresses, type Address, ADDRESS_LIMIT } from "@/lib/addresses-store";
import { lookupCep } from "@/lib/viacep";

type FormState = Omit<Address, "id" | "isDefault"> & { isDefault: boolean };

const emptyForm: FormState = {
  label: "",
  recipient: "",
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
  isDefault: false,
};

export default function EnderecosPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { items, hydrated, add, update, remove, setDefault, count, canAdd } = useAddresses();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [cepLoading, setCepLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redirect=/conta/enderecos");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="panel-frame bg-[var(--bg-2)] p-10 text-center">
        <p className="display text-2xl text-[var(--akira-red)] glow-red pulse-neon">CARREGANDO</p>
      </div>
    );
  }

  const startNew = () => {
    if (!canAdd) return;
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setShowForm(true);
  };

  const startEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm({
      label: addr.label,
      recipient: addr.recipient,
      zipCode: addr.zipCode,
      street: addr.street,
      number: addr.number,
      complement: addr.complement,
      district: addr.district,
      city: addr.city,
      state: addr.state,
      isDefault: addr.isDefault,
    });
    setErrors({});
    setShowForm(true);
  };

  const cancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  };

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const handleCepBlur = async () => {
    const cleaned = form.zipCode.replace(/\D/g, "");
    if (cleaned.length !== 8) return;
    setCepLoading(true);
    const r = await lookupCep(cleaned);
    setCepLoading(false);
    if (!r) {
      setErrors((e) => ({ ...e, zipCode: "CEP nao encontrado" }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      street: r.logradouro || prev.street,
      district: r.bairro || prev.district,
      city: r.localidade || prev.city,
      state: r.uf || prev.state,
    }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.label.trim()) errs.label = "Obrigatorio";
    if (!form.recipient.trim()) errs.recipient = "Obrigatorio";
    if (form.zipCode.replace(/\D/g, "").length !== 8) errs.zipCode = "CEP invalido";
    if (!form.street.trim()) errs.street = "Obrigatorio";
    if (!form.number.trim()) errs.number = "Obrigatorio";
    if (!form.district.trim()) errs.district = "Obrigatorio";
    if (!form.city.trim()) errs.city = "Obrigatorio";
    if (!form.state.trim()) errs.state = "UF";

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (editingId) {
      update(editingId, form);
      if (form.isDefault) setDefault(editingId);
    } else {
      const result = add(form);
      if (!result.ok) {
        alert(result.error);
        return;
      }
    }
    cancel();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="border-b-2 border-[var(--line)] pb-5">
        <p className="eyebrow">Section 04 // 配送先</p>
        <div className="mt-2 flex items-baseline gap-4 flex-wrap">
          <span className="display text-6xl text-[var(--akira-red)] glow-red leading-none">04</span>
          <div>
            <h2 className="display text-4xl text-[var(--ink)] leading-none">ENDERECOS</h2>
            <p className="jp mt-1 text-lg text-[var(--ink-soft)]">配送先一覧</p>
          </div>
          <div className="ml-auto text-right">
            <p className="eyebrow !text-[var(--ink-muted)]">Slots</p>
            <p className="display text-2xl text-[var(--akira-cyan)] numerals leading-none">
              {count}/{ADDRESS_LIMIT}
            </p>
          </div>
        </div>
      </header>

      {/* Botao adicionar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="font-mono text-xs text-[var(--ink-muted)] uppercase tracking-widest">
          {">"} maximo {ADDRESS_LIMIT} enderecos por conta
        </p>
        <button
          onClick={startNew}
          disabled={!canAdd}
          className="shimmer inline-flex items-center gap-3 border-[3px] border-[var(--ink)] bg-[var(--akira-red)] text-[var(--ink)] px-5 py-3 shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="display text-sm uppercase tracking-wider">+ Novo endereco</span>
          <span className="jp text-sm">追加</span>
        </button>
      </div>

      {/* Lista */}
      {!hydrated ? (
        <p className="font-mono text-xs text-[var(--ink-muted)] uppercase text-center pulse-neon">
          {">"} carregando...
        </p>
      ) : items.length === 0 ? (
        <div className="panel-frame bg-[var(--bg-2)] p-14 text-center">
          <p className="jp text-[120px] text-[var(--akira-red)]/25 leading-none">空</p>
          <p className="display mt-2 text-3xl text-[var(--ink)]">SEM ENDERECOS</p>
          <p className="jp mt-2 text-base text-[var(--ink-muted)]">未登録</p>
          <p className="mt-3 font-mono text-xs text-[var(--ink-muted)] uppercase">
            {">"} cadastre seu primeiro endereco
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((addr) => (
            <li
              key={addr.id}
              className={`relative panel-frame p-5 ${
                addr.isDefault ? "bg-[var(--bg-3)] border-[var(--akira-red)]" : "bg-[var(--bg-2)]"
              }`}
            >
              {addr.isDefault && (
                <span className="absolute -top-2 -left-2 px-2 py-0.5 font-mono text-[10px] font-bold bg-[var(--akira-red)] text-[var(--ink)] shadow-hard">
                  DEFAULT
                </span>
              )}
              <div className="flex items-baseline gap-3">
                <span className="jp text-2xl text-[var(--akira-red)]">宅</span>
                <p className="display text-xl text-[var(--ink)]">{addr.label}</p>
              </div>
              <p className="mt-3 font-mono text-sm text-[var(--ink)] leading-relaxed">
                {addr.recipient}
              </p>
              <p className="mt-1 font-mono text-xs text-[var(--ink-soft)] leading-relaxed">
                {addr.street}, {addr.number}
                {addr.complement && ` - ${addr.complement}`}
                <br />
                {addr.district} · {addr.city}/{addr.state}
                <br />
                <span className="text-[var(--ink-muted)]">CEP {addr.zipCode}</span>
              </p>

              <div className="mt-4 flex gap-2 flex-wrap">
                <button
                  onClick={() => startEdit(addr)}
                  className="border border-[var(--akira-cyan)] text-[var(--akira-cyan)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest hover:bg-[var(--akira-cyan)] hover:text-[var(--bg)] transition-all"
                >
                  Editar
                </button>
                {!addr.isDefault && (
                  <button
                    onClick={() => setDefault(addr.id)}
                    className="border border-[var(--akira-yellow)] text-[var(--akira-yellow)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest hover:bg-[var(--akira-yellow)] hover:text-[var(--bg)] transition-all"
                  >
                    Definir padrao
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm(`Remover endereco "${addr.label}"?`)) remove(addr.id);
                  }}
                  className="ml-auto border border-[var(--ink-muted)] text-[var(--ink-muted)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest hover:border-[var(--akira-red)] hover:text-[var(--akira-red)] transition-all"
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Formulario adicionar/editar */}
      {showForm && (
        <form onSubmit={submit} className="panel-frame bg-[var(--bg-2)] p-6 md:p-8 space-y-5">
          <header className="border-b-2 border-[var(--line)] pb-4">
            <p className="eyebrow">{editingId ? "Editar // 編集" : "Novo // 新規"}</p>
            <p className="display text-3xl text-[var(--ink)] mt-1">
              {editingId ? "EDITAR ENDERECO" : "NOVO ENDERECO"}
            </p>
          </header>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Apelido" kanji="名" error={errors.label}>
              <input
                type="text"
                value={form.label}
                onChange={(e) => set("label", e.target.value)}
                placeholder="Casa, Trabalho..."
                className={inputCls(!!errors.label)}
              />
            </Field>
            <Field label="Destinatario" kanji="宛" error={errors.recipient}>
              <input
                type="text"
                value={form.recipient}
                onChange={(e) => set("recipient", e.target.value)}
                placeholder="Nome completo"
                className={inputCls(!!errors.recipient)}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
            <Field label="CEP" kanji="郵便" error={errors.zipCode}>
              <input
                type="text"
                inputMode="numeric"
                value={form.zipCode}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 8);
                  const fmt = v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v;
                  set("zipCode", fmt);
                }}
                onBlur={handleCepBlur}
                placeholder="00000-000"
                className={inputCls(!!errors.zipCode)}
              />
              {cepLoading && (
                <p className="mt-1 font-mono text-[10px] text-[var(--akira-cyan)] uppercase">
                  {">"} buscando...
                </p>
              )}
            </Field>
            <Field label="Rua" kanji="街" error={errors.street}>
              <input
                type="text"
                value={form.street}
                onChange={(e) => set("street", e.target.value)}
                className={inputCls(!!errors.street)}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-[140px_1fr]">
            <Field label="Numero" kanji="号" error={errors.number}>
              <input
                type="text"
                value={form.number}
                onChange={(e) => set("number", e.target.value)}
                className={inputCls(!!errors.number)}
              />
            </Field>
            <Field label="Complemento" kanji="補" optional>
              <input
                type="text"
                value={form.complement}
                onChange={(e) => set("complement", e.target.value)}
                placeholder="Apto, bloco..."
                className={inputCls(false)}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-[1fr_1fr_100px]">
            <Field label="Bairro" kanji="区" error={errors.district}>
              <input
                type="text"
                value={form.district}
                onChange={(e) => set("district", e.target.value)}
                className={inputCls(!!errors.district)}
              />
            </Field>
            <Field label="Cidade" kanji="市" error={errors.city}>
              <input
                type="text"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                className={inputCls(!!errors.city)}
              />
            </Field>
            <Field label="UF" kanji="州" error={errors.state}>
              <input
                type="text"
                value={form.state}
                onChange={(e) => set("state", e.target.value.toUpperCase().slice(0, 2))}
                placeholder="SP"
                className={inputCls(!!errors.state)}
              />
            </Field>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => set("isDefault", e.target.checked)}
              className="w-5 h-5 accent-[var(--akira-red)]"
            />
            <span className="font-mono text-xs text-[var(--ink-soft)] uppercase tracking-widest">
              Definir como endereco padrao
            </span>
          </label>

          <div className="flex items-center justify-between gap-3 pt-4 border-t-2 border-dashed border-[var(--line)]">
            <button
              type="button"
              onClick={cancel}
              className="border-[2px] border-[var(--ink)] bg-transparent px-5 py-3 text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--bg)] transition"
            >
              <span className="font-mono text-xs uppercase tracking-widest">Cancelar</span>
            </button>
            <button
              type="submit"
              className="shimmer border-[3px] border-[var(--ink)] bg-[var(--akira-red)] text-[var(--ink)] px-8 py-4 shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <span className="display text-base uppercase tracking-wider">
                {editingId ? "Salvar" : "Cadastrar"}
              </span>
              <span className="jp text-sm ml-2">{editingId ? "保存" : "登録"}</span>
            </button>
          </div>
        </form>
      )}
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
        {error && (
          <span className="ml-auto text-[10px] text-[var(--akira-red)] font-mono uppercase">
            ! {error}
          </span>
        )}
      </div>
      {children}
    </label>
  );
}

function inputCls(error: boolean) {
  return `w-full border-[2px] bg-[var(--bg-3)] px-4 py-3 font-mono text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-muted)] focus:border-[var(--akira-red)] focus:shadow-[0_0_12px_rgba(193,18,31,0.4)] ${
    error ? "border-[var(--akira-red)]" : "border-[var(--line)]"
  }`;
}
