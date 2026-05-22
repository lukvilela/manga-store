"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";
import { useGamification } from "@/lib/gamification-store";

export type NewsletterPrefs = {
  email: string;
  weekly: boolean;
  preVenda: boolean;
  shonen: boolean;
  seinen: boolean;
  shoujo: boolean;
  novidades: boolean;
  promos: boolean;
  subscribedAt: string;
};

export const NEWSLETTER_KEY = "akira-mangas-newsletter";

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

export function readNewsletter(): NewsletterPrefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(NEWSLETTER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<NewsletterPrefs>;
    if (!parsed?.email) return null;
    return { ...DEFAULT_PREFS, ...parsed } as NewsletterPrefs;
  } catch {
    return null;
  }
}

export function writeNewsletter(prefs: NewsletterPrefs) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NEWSLETTER_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new Event("newsletter:change"));
  } catch {
    // ignore quota
  }
}

// Regex basico tipo HTML5 — nao queremos rejeitar nada estranho mas pegar typos
function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

type Variant = "full" | "compact" | "inline";

type Props = {
  variant?: Variant;
  title?: string;
  jpTitle?: string;
  subtitle?: string;
};

/**
 * Newsletter — form mock pra captacao de email.
 *
 * Variants:
 *  - "full"    pagina/secao hero gigante com checkboxes
 *  - "inline"  versao compacta pra footer global (input + botao em linha)
 *  - "compact" versao pra empty states/rodapes de pagina, sem hero gigante
 *
 * Persiste prefs em localStorage NEWSLETTER_KEY. +50 XP no primeiro signup.
 * Easter egg: email kaneda@neo-tokyo.com dispara toast tematico.
 */
export default function Newsletter({
  variant = "full",
  title,
  jpTitle,
  subtitle,
}: Props) {
  const { show } = useToast();
  const { addXp } = useGamification();
  const [hydrated, setHydrated] = useState(false);
  const [existing, setExisting] = useState<NewsletterPrefs | null>(null);
  const [email, setEmail] = useState("");
  const [weekly, setWeekly] = useState(true);
  const [preVenda, setPreVenda] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setExisting(readNewsletter());
    setHydrated(true);
    // mantem sincronia entre instancias do componente
    const sync = () => setExisting(readNewsletter());
    window.addEventListener("newsletter:change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("newsletter:change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      show("Email invalido — confira e tente de novo", "error");
      return;
    }
    setSubmitting(true);

    const isEaster = trimmed.toLowerCase() === EASTER_EMAIL;
    const alreadyExists = !!existing;

    const next: NewsletterPrefs = {
      ...DEFAULT_PREFS,
      ...(existing || {}),
      email: trimmed,
      weekly,
      preVenda,
      subscribedAt: existing?.subscribedAt || new Date().toISOString(),
    };
    writeNewsletter(next);
    setExisting(next);

    if (isEaster) {
      show("Kaneda assinou nossa newsletter! Bike streak engaged.", "success", 5000);
    } else if (alreadyExists) {
      show("Preferencias atualizadas!", "success");
    } else {
      show("Inscrito! +50 XP creditado", "success", 4000);
      addXp(50, "Newsletter signup");
    }

    setSubmitting(false);
    if (variant !== "full") setEmail("");
  };

  // Estado "ja inscrito" — apenas variants nao-full mostram o callout simples
  // (a pagina /newsletter renderiza editor expandido mesmo se ja inscrito)
  if (hydrated && existing && variant !== "full") {
    return (
      <div
        className={`border-[2px] border-[var(--akira-green)] bg-[var(--bg-2)] px-4 py-3 ${
          variant === "inline" ? "" : "panel-frame"
        }`}
      >
        <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--akira-green)]">
          ✓ Voce ja esta inscrito
        </p>
        <p className="font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest mt-1 truncate">
          {">"} confirme em <span className="text-[var(--akira-cyan)]">{existing.email}</span>
        </p>
      </div>
    );
  }

  // Renderiza variant INLINE (footer global) — input + botao na mesma linha
  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
        <input
          type="email"
          required
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-[var(--bg-2)] border-[2px] border-[var(--line)] focus:border-[var(--akira-cyan)] px-3 py-2 font-mono text-xs text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)]"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-3 py-2 bg-akira-red text-ink border-[2px] border-akira-red font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-bg hover:text-akira-red transition-colors shimmer"
        >
          Assinar
        </button>
      </form>
    );
  }

  // Variants FULL e COMPACT
  const isFull = variant === "full";
  const headerTitle = title || "Nao perca lancamentos";
  const headerJp = jpTitle || "新作を逃さない";
  const headerSub =
    subtitle ||
    "Receba drops semanais com novidades de Neo-Tokyo direto na sua caixa.";

  return (
    <section
      className={`relative overflow-hidden ${
        isFull ? "bg-zone-warm panel-frame p-8 md:p-12" : "panel-frame bg-[var(--bg-2)] p-6 md:p-8"
      }`}
    >
      <div className="absolute inset-0 halftone opacity-15 pointer-events-none" aria-hidden />
      {isFull && (
        <div
          className="absolute -right-12 -top-12 jp text-[160px] text-[var(--akira-red)]/15 leading-none select-none pointer-events-none"
          aria-hidden
        >
          報
        </div>
      )}

      <div className="relative">
        <span className="onomatopeia text-xl">DRIP!</span>
        <p className="eyebrow mt-3">Newsletter // ニュース</p>
        <h2
          className={`display mt-1 text-[var(--ink)] leading-tight ${
            isFull ? "text-4xl md:text-6xl" : "text-3xl md:text-4xl"
          }`}
        >
          {headerTitle.split(" ").slice(0, -1).join(" ")}{" "}
          <span className="text-[var(--akira-red)] glow-red">
            {headerTitle.split(" ").slice(-1).join(" ")}
          </span>
        </h2>
        <p className="jp mt-2 text-xl md:text-2xl text-[var(--akira-cyan)] glow-cyan">
          {headerJp}
        </p>
        <p className="mt-4 text-sm md:text-base text-[var(--ink-soft)] max-w-xl">
          {headerSub}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-w-xl">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
              Email
            </span>
            <input
              type="email"
              required
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full bg-[var(--bg-3)] border-[2px] border-[var(--line)] focus:border-[var(--akira-cyan)] px-3 py-3 font-mono text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)]"
            />
          </label>

          <div className="space-y-2">
            <CheckboxRow
              checked={weekly}
              onChange={setWeekly}
              label="Quero receber dicas de novos mangas semanalmente"
            />
            <CheckboxRow
              checked={preVenda}
              onChange={setPreVenda}
              label="Quero pre-vendas exclusivas e drops antecipados"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-3 px-6 py-3 bg-akira-red text-ink font-bold uppercase tracking-widest text-sm border-[2px] border-akira-red shadow-hard hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_var(--ink)] transition-all shimmer disabled:opacity-50"
          >
            <span>Assinar gratis</span>
            <span className="text-lg">→</span>
          </button>
          <p className="font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest">
            {">"} +50 XP no primeiro signup · zero spam · cancele quando quiser
          </p>
        </form>
      </div>
    </section>
  );
}

function CheckboxRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 accent-[var(--akira-red)] cursor-pointer"
      />
      <span className="text-sm text-[var(--ink-soft)] group-hover:text-[var(--ink)] transition-colors leading-snug">
        {label}
      </span>
    </label>
  );
}
