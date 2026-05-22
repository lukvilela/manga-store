"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/context/ToastContext";
import { useGamification } from "@/lib/gamification-store";
import {
  NewsletterPrefs,
  readNewsletter,
  writeNewsletter,
} from "@/components/Newsletter";

const DEFAULT_PREFS: NewsletterPrefs = {
  email: "",
  weekly: true,
  preVenda: true,
  shonen: false,
  seinen: false,
  shoujo: false,
  novidades: true,
  promos: true,
  subscribedAt: "",
};

const EASTER_EMAIL = "kaneda@neo-tokyo.com";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

type CheckboxKey = "weekly" | "preVenda" | "shonen" | "seinen" | "shoujo" | "novidades" | "promos";

const TOPICS: Array<{ key: CheckboxKey; label: string; jp: string; accent: string }> = [
  { key: "weekly", label: "Dicas semanais", jp: "週刊", accent: "var(--akira-cyan)" },
  { key: "preVenda", label: "Pre-vendas exclusivas", jp: "予約", accent: "var(--akira-red)" },
  { key: "novidades", label: "Novidades & lancamentos", jp: "新作", accent: "var(--akira-yellow)" },
  { key: "promos", label: "Promocoes & cupons", jp: "割引", accent: "var(--akira-pink)" },
  { key: "shonen", label: "Shonen — acao", jp: "少年", accent: "var(--akira-yellow)" },
  { key: "seinen", label: "Seinen — maduro", jp: "青年", accent: "var(--akira-cyan)" },
  { key: "shoujo", label: "Shoujo — romance", jp: "少女", accent: "var(--akira-pink)" },
];

export default function NewsletterPage() {
  const { show } = useToast();
  const { addXp } = useGamification();
  const [hydrated, setHydrated] = useState(false);
  const [prefs, setPrefs] = useState<NewsletterPrefs>(DEFAULT_PREFS);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const existing = readNewsletter();
    if (existing) setPrefs(existing);
    setHydrated(true);
  }, []);

  const isSubscribed = hydrated && !!prefs.email;

  const togglePref = (key: CheckboxKey) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(prefs.email)) {
      show("Email invalido — confira e tente de novo", "error");
      return;
    }
    const isEaster = prefs.email.trim().toLowerCase() === EASTER_EMAIL;
    const alreadyExists = isSubscribed && !editing;

    const next: NewsletterPrefs = {
      ...prefs,
      email: prefs.email.trim(),
      subscribedAt: prefs.subscribedAt || new Date().toISOString(),
    };
    writeNewsletter(next);
    setPrefs(next);
    setEditing(false);

    if (isEaster) {
      show("Kaneda assinou nossa newsletter! Bike streak engaged.", "success", 5000);
    } else if (alreadyExists) {
      show("Preferencias atualizadas!", "success");
    } else {
      show("Inscrito! +50 XP creditado", "success", 4000);
      addXp(50, "Newsletter signup");
    }
  };

  const handleUnsubscribe = () => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem("akira-mangas-newsletter");
      window.dispatchEvent(new Event("newsletter:change"));
    } catch {
      // ignore
    }
    setPrefs(DEFAULT_PREFS);
    setEditing(false);
    show("Inscricao cancelada", "info");
  };

  return (
    <>
      <Header />
      <main className="relative min-h-screen bg-[var(--bg)] bg-zone-warm">
        <section className="relative overflow-hidden border-b-2 border-[var(--line)]">
          <div className="absolute inset-0 halftone-red opacity-25" />
          <div className="bike-streak" style={{ top: "55%", animationDelay: "0.8s" }} />
          <div className="relative mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
            <span className="eyebrow">/ newsletter / ニュースレター</span>
            <h1 className="display mt-2 text-4xl md:text-6xl text-[var(--ink)] leading-none">
              FIQUE NA <span className="text-[var(--akira-red)] glow-red">FRENTE</span>
            </h1>
            <p className="jp mt-3 text-2xl text-[var(--akira-cyan)] glow-cyan">
              先取り情報
            </p>
            <p className="mt-4 text-base text-[var(--ink-soft)] max-w-2xl">
              Drops, pre-vendas, cupons e curadoria semanal direto na sua caixa de entrada. Sem spam.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-10 md:px-6">
          <div className="panel-frame bg-[var(--bg-2)] p-6 md:p-10 space-y-6">
            {isSubscribed && !editing && (
              <div className="border-[2px] border-[var(--akira-green)] bg-[var(--akira-green)]/5 p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="font-mono text-xs uppercase tracking-widest text-[var(--akira-green)] font-bold">
                    ✓ Voce esta inscrito
                  </p>
                  <p className="font-mono text-[11px] text-[var(--ink-soft)] uppercase tracking-widest mt-1 truncate">
                    {">"} {prefs.email}
                  </p>
                  <p className="font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest mt-0.5">
                    {">"} desde{" "}
                    {prefs.subscribedAt
                      ? new Date(prefs.subscribedAt).toLocaleDateString("pt-BR")
                      : "—"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="font-mono text-[11px] uppercase tracking-widest px-3 py-2 border-[2px] border-[var(--akira-cyan)] text-[var(--akira-cyan)] hover:bg-[var(--akira-cyan)] hover:text-[var(--bg)] transition-colors"
                >
                  Gerenciar
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
                  Email
                </span>
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={prefs.email}
                  onChange={(e) => setPrefs((p) => ({ ...p, email: e.target.value }))}
                  disabled={isSubscribed && !editing}
                  className="mt-1 w-full bg-[var(--bg-3)] border-[2px] border-[var(--line)] focus:border-[var(--akira-cyan)] px-3 py-3 font-mono text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)] disabled:opacity-60"
                />
              </label>

              <fieldset
                disabled={isSubscribed && !editing}
                className="space-y-2 disabled:opacity-60"
              >
                <legend className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)] mb-2">
                  Preferencias
                </legend>
                {TOPICS.map((t) => (
                  <label
                    key={t.key}
                    className="flex items-center gap-3 cursor-pointer border-[2px] border-[var(--line)] hover:border-[var(--akira-cyan)] px-3 py-2 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={prefs[t.key]}
                      onChange={() => togglePref(t.key)}
                      className="w-4 h-4 accent-[var(--akira-red)] cursor-pointer"
                    />
                    <span className="jp text-base" style={{ color: t.accent }}>
                      {t.jp}
                    </span>
                    <span className="flex-1 text-sm text-[var(--ink)] leading-tight">
                      {t.label}
                    </span>
                  </label>
                ))}
              </fieldset>

              <div className="flex gap-3 flex-wrap">
                {(!isSubscribed || editing) && (
                  <button
                    type="submit"
                    className="inline-flex items-center gap-3 px-6 py-3 bg-akira-red text-ink font-bold uppercase tracking-widest text-sm border-[2px] border-akira-red shadow-hard hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_var(--ink)] transition-all shimmer"
                  >
                    <span>{isSubscribed ? "Salvar preferencias" : "Assinar gratis"}</span>
                    <span className="text-lg">→</span>
                  </button>
                )}
                {isSubscribed && editing && (
                  <button
                    type="button"
                    onClick={handleUnsubscribe}
                    className="font-mono text-[11px] uppercase tracking-widest px-4 py-3 border-[2px] border-[var(--akira-red)] text-[var(--akira-red)] hover:bg-[var(--akira-red)] hover:text-[var(--ink)] transition-colors"
                  >
                    Cancelar inscricao
                  </button>
                )}
              </div>

              <p className="font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest border-t border-dashed border-[var(--line)] pt-4">
                {">"} preferencias guardadas localmente em localStorage<br />
                {">"} +50 XP no primeiro signup<br />
                {">"} zero spam · cancele quando quiser
              </p>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
