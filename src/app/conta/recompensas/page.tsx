"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useGamification } from "@/lib/gamification-store";

type Reward = {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  category: "desconto" | "frete" | "exclusivo" | "gamificacao" | "premium" | "mock";
  // codigo prefix usado na geracao do cupom (AKIRA-DESC-XXXX etc)
  codePrefix: string;
  badgeId?: string;
};

const REWARDS: Reward[] = [
  {
    id: "off-5",
    name: "5% OFF no carrinho",
    description: "Desconto unico no proximo pedido",
    price: 100,
    icon: "🏷️",
    category: "desconto",
    codePrefix: "OFF5",
  },
  {
    id: "frete-gratis",
    name: "Frete gratis",
    description: "Sem custo de entrega no proximo pedido",
    price: 200,
    icon: "🚚",
    category: "frete",
    codePrefix: "FRETE",
  },
  {
    id: "off-10",
    name: "10% OFF no carrinho",
    description: "Desconto unico maior pra pedidos medios",
    price: 500,
    icon: "🎟️",
    category: "desconto",
    codePrefix: "OFF10",
  },
  {
    id: "off-15-frete",
    name: "15% OFF + frete gratis",
    description: "Combo definitivo pra colecionador",
    price: 1000,
    icon: "💎",
    category: "desconto",
    codePrefix: "OFF15",
  },
  {
    id: "sticker-akira",
    name: "Sticker exclusivo Akira",
    description: "Badge especial 'Trader' adicionada ao perfil",
    price: 2000,
    icon: "🌟",
    category: "exclusivo",
    codePrefix: "STK",
    badgeId: "sticker-trader",
  },
  {
    id: "volume-free",
    name: "Volume gratis",
    description: "1 volume avulso de cortesia em qualquer compra",
    price: 3000,
    icon: "📚",
    category: "exclusivo",
    codePrefix: "VOL",
  },
  {
    id: "box-25",
    name: "Box set com 25% OFF",
    description: "Desconto agressivo em qualquer box set",
    price: 5000,
    icon: "📦",
    category: "exclusivo",
    codePrefix: "BOX25",
  },
  {
    id: "badge-trocador",
    name: "Badge 'Trocador'",
    description: "Conquista permanente e +50 XP imediato",
    price: 250,
    icon: "🎖️",
    category: "gamificacao",
    codePrefix: "BDG",
    badgeId: "trocador",
  },
  {
    id: "wallpaper",
    name: "Wallpaper digital",
    description: "Download exclusivo Neo-Tokyo 4K",
    price: 800,
    icon: "🖼️",
    category: "exclusivo",
    codePrefix: "WALL",
  },
  {
    id: "avatar-custom",
    name: "Avatar customizado",
    description: "Editor de avatar destravado no perfil",
    price: 1500,
    icon: "👤",
    category: "exclusivo",
    codePrefix: "AVT",
  },
  {
    id: "candidaturas-5",
    name: "5 candidaturas extras",
    description: "Cota extra de aplicacoes nesse mes",
    price: 100,
    icon: "📝",
    category: "mock",
    codePrefix: "CAND",
  },
  {
    id: "premium-30",
    name: "30 dias premium",
    description: "Sem ads + leitura preview liberada",
    price: 500,
    icon: "👑",
    category: "premium",
    codePrefix: "PRM",
  },
  {
    id: "pre-acesso",
    name: "Pre-acesso a lancamentos",
    description: "Compre 24h antes de qualquer drop",
    price: 750,
    icon: "🚀",
    category: "premium",
    codePrefix: "PRE",
  },
  {
    id: "reserva-pref",
    name: "Reserva preferencial",
    description: "Prioridade na fila de tiragens limitadas",
    price: 1200,
    icon: "⭐",
    category: "premium",
    codePrefix: "RSV",
  },
  {
    id: "lootbox-extra",
    name: "Loot box extra semanal",
    description: "Gira a roleta de novo essa semana",
    price: 100,
    icon: "🎁",
    category: "gamificacao",
    codePrefix: "LOOT",
  },
];

type Redemption = {
  rewardId: string;
  name: string;
  code: string;
  date: string;
  priceAtRedemption: number;
};

const REDEMPTIONS_KEY = "akira-mangas-redemptions";

function readRedemptions(): Redemption[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REDEMPTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Redemption[]) : [];
  } catch {
    return [];
  }
}

function writeRedemptions(list: Redemption[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REDEMPTIONS_KEY, JSON.stringify(list));
  } catch {
    // ignore quota
  }
}

// gera AKIRA-{PREFIX}-XXXX onde X = alfanumerico maiusculo
function generateCode(prefix: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // remove 0/O/I/1 pra leitura
  let suffix = "";
  for (let i = 0; i < 4; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `AKIRA-${prefix}-${suffix}`;
}

export default function RecompensasPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { state, hydrated, usePoints, addXp, unlockBadge } = useGamification();
  const { show } = useToast();
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redirect=/conta/recompensas");
  }, [loading, user, router]);

  useEffect(() => {
    setRedemptions(readRedemptions());
  }, []);

  const handleRedeem = (reward: Reward) => {
    if (state.points < reward.price) {
      show(`Faltam ${reward.price - state.points} pts pra resgatar`, "warning");
      return;
    }
    const ok = usePoints(reward.price);
    if (!ok) {
      show("Nao foi possivel debitar os pontos", "error");
      return;
    }
    const code = generateCode(reward.codePrefix);
    const entry: Redemption = {
      rewardId: reward.id,
      name: reward.name,
      code,
      date: new Date().toISOString(),
      priceAtRedemption: reward.price,
    };
    const nextList = [entry, ...redemptions].slice(0, 50);
    setRedemptions(nextList);
    writeRedemptions(nextList);

    // efeitos colaterais bonus (mock) — gamificacao acoplada
    if (reward.badgeId) unlockBadge(reward.badgeId);
    if (reward.id === "badge-trocador") addXp(50, "Resgate badge Trocador");

    show(`Resgatado! Codigo: ${code}`, "success", 5000);
  };

  if (loading || !user) {
    return (
      <div className="panel-frame bg-[var(--bg-2)] p-10 text-center">
        <p className="display text-3xl text-[var(--akira-red)] glow-red pulse-neon">
          {loading ? "CARREGANDO" : "REDIRECIONANDO"}
        </p>
        <p className="jp mt-2 text-base text-[var(--ink-muted)]">読み込み中</p>
      </div>
    );
  }

  const points = hydrated ? state.points : 0;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative panel-frame bg-[var(--bg-2)] p-6 md:p-10 overflow-hidden">
        <div className="absolute inset-0 halftone opacity-15 pointer-events-none" />
        <div className="absolute -right-10 -top-10 jp text-[180px] text-[var(--akira-yellow)]/15 leading-none select-none pointer-events-none">
          報
        </div>
        <div className="relative">
          <span className="onomatopeia text-xl">CASH IN!</span>
          <p className="eyebrow mt-3">Recompensas // 報酬</p>
          <h2 className="display mt-1 text-4xl md:text-6xl text-[var(--ink)] leading-none">
            TROQUE SEUS <span className="text-[var(--akira-yellow)] glow-yellow">PONTOS</span>
          </h2>
          <p className="jp mt-2 text-2xl text-[var(--akira-cyan)] glow-cyan">交換所</p>

          <div className="mt-6 inline-flex items-baseline gap-4 border-[3px] border-[var(--akira-yellow)] bg-[var(--bg-3)] px-5 py-3 shadow-hard">
            <span className="jp text-2xl text-[var(--akira-yellow)] glow-yellow">点</span>
            <div>
              <p className="eyebrow !text-[var(--akira-yellow)]">Saldo atual</p>
              <p className="display text-5xl text-[var(--akira-yellow)] glow-yellow numerals leading-none">
                {points.toLocaleString("pt-BR")}
              </p>
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--ink-muted)]">
              pts
            </span>
          </div>
        </div>
      </section>

      {/* Grid de recompensas */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REWARDS.map((r) => {
          const affordable = points >= r.price;
          return (
            <article
              key={r.id}
              className={`panel-frame bg-[var(--bg-2)] p-5 flex flex-col gap-3 transition-all ${
                affordable ? "card-lift" : "opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-4xl leading-none" aria-hidden>
                  {r.icon}
                </span>
                <span
                  className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border ${
                    affordable
                      ? "border-[var(--akira-yellow)] text-[var(--akira-yellow)]"
                      : "border-[var(--line)] text-[var(--ink-muted)]"
                  }`}
                >
                  {r.category}
                </span>
              </div>

              <div className="flex-1">
                <p className="display text-base uppercase tracking-wider text-[var(--ink)] leading-tight">
                  {r.name}
                </p>
                <p className="font-mono text-[11px] text-[var(--ink-muted)] uppercase tracking-wider mt-1 leading-relaxed">
                  {r.description}
                </p>
              </div>

              <div className="flex items-baseline justify-between gap-3 pt-2 border-t border-dashed border-[var(--line)]">
                <div className="flex items-baseline gap-1">
                  <span
                    className={`display text-2xl numerals leading-none ${
                      affordable ? "text-[var(--akira-yellow)]" : "text-[var(--ink-muted)]"
                    }`}
                  >
                    {r.price.toLocaleString("pt-BR")}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
                    pts
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRedeem(r)}
                  disabled={!affordable}
                  className={`font-mono text-[11px] uppercase tracking-widest px-3 py-1.5 border-[2px] transition-all ${
                    affordable
                      ? "border-[var(--akira-red)] bg-[var(--akira-red)] text-[var(--ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_var(--ink)] shimmer"
                      : "border-[var(--line)] text-[var(--ink-muted)] cursor-not-allowed"
                  }`}
                >
                  {affordable ? "Resgatar" : "Insuficiente"}
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {/* Historico de resgates */}
      <section className="panel-frame bg-[var(--bg-2)] p-6 md:p-8">
        <div className="flex items-baseline justify-between gap-3 flex-wrap mb-5">
          <div>
            <p className="eyebrow">Historico // 履歴</p>
            <h3 className="display text-2xl text-[var(--ink)] mt-1">
              SEUS <span className="text-[var(--akira-cyan)] glow-cyan">RESGATES</span>
            </h3>
          </div>
          <span className="font-mono text-xs text-[var(--ink-muted)] uppercase tracking-widest">
            <span className="text-[var(--akira-cyan)] numerals">{redemptions.length}</span> total
          </span>
        </div>

        {redemptions.length === 0 ? (
          <p className="font-mono text-[11px] text-[var(--ink-muted)] uppercase tracking-widest border border-dashed border-[var(--line)] p-6 text-center">
            {">"} nenhum resgate ainda
          </p>
        ) : (
          <ul className="space-y-2">
            {redemptions.map((r, idx) => (
              <li
                key={`${r.code}-${idx}`}
                className="grid grid-cols-[1fr_auto] items-center gap-4 border-[2px] border-[var(--line)] bg-[var(--bg-3)] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="display text-sm uppercase tracking-wider text-[var(--ink)] truncate">
                    {r.name}
                  </p>
                  <p className="font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest mt-0.5">
                    {new Date(r.date).toLocaleString("pt-BR")} ·{" "}
                    <span className="text-[var(--akira-yellow)]">-{r.priceAtRedemption} pts</span>
                  </p>
                </div>
                <code className="font-mono text-[11px] text-[var(--akira-cyan)] px-2 py-1 border border-[var(--akira-cyan)] whitespace-nowrap">
                  {r.code}
                </code>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Dica */}
      <section className="border-t-2 border-dashed border-[var(--line)] pt-6">
        <p className="font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest leading-relaxed">
          {">"} pontos sao acumulados em compras, reviews e streak<br />
          {">"} codigos sao guardados localmente em localStorage<br />
          {">"} resgates nao podem ser desfeitos
        </p>
      </section>
    </div>
  );
}
