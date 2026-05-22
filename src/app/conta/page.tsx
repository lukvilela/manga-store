"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEstante } from "@/lib/estante-store";
import { useAddresses } from "@/lib/addresses-store";

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

type StoredOrder = {
  orderId: string;
  createdAt: string;
  totals: { total: number };
  items: Array<{ volumeId: string; quantity: number; coverImage: string; seriesTitle: string }>;
};

function useRecentOrders() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const list: StoredOrder[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (!k || !k.startsWith("order:")) continue;
      try {
        const raw = sessionStorage.getItem(k);
        if (raw) list.push(JSON.parse(raw));
      } catch {
        // skip
      }
    }
    list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    setOrders(list);
  }, []);
  return orders;
}

export default function ContaDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const estante = useEstante();
  const addresses = useAddresses();
  const orders = useRecentOrders();

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redirect=/conta");
  }, [loading, user, router]);

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

  const totalEstante = estante.count();
  const recent5 = orders.slice(0, 5);

  return (
    <div className="space-y-10">
      {/* Hero gigante */}
      <section className="relative panel-frame bg-[var(--bg-2)] p-8 md:p-12 overflow-hidden">
        <div className="absolute inset-0 halftone-red opacity-20 pointer-events-none" />
        <div className="absolute -right-10 -top-10 jp text-[180px] text-[var(--akira-red)]/15 leading-none select-none">
          頁
        </div>
        <div className="relative">
          <span className="onomatopeia text-xl">WELCOME!</span>
          <p className="eyebrow mt-4">Account // マイページ</p>
          <h2 className="display mt-2 text-5xl md:text-7xl text-[var(--ink)] leading-none">
            MINHA <span className="text-[var(--akira-red)] glow-red">CONTA</span>
          </h2>
          <p className="jp mt-3 text-2xl md:text-3xl text-[var(--akira-cyan)] glow-cyan">マイページ</p>
          <p className="mt-5 max-w-xl text-[var(--ink-soft)]">
            Ola, <span className="display text-2xl text-[var(--akira-yellow)]">{user.name}</span>
            <span className="jp text-base text-[var(--ink-muted)] ml-2">さん</span>
          </p>
          <p className="mt-1 font-mono text-xs text-[var(--ink-muted)] uppercase tracking-wider">
            {">"} sessao ativa // {user.email}
          </p>
        </div>
      </section>

      {/* Cards de stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          href="/conta/pedidos"
          kanji="注"
          label="Pedidos"
          value={orders.length}
          accent="var(--akira-red)"
          sub="historico completo"
        />
        <StatCard
          href="/conta/estante"
          kanji="棚"
          label="Estante"
          value={totalEstante}
          accent="var(--akira-cyan)"
          sub={`${estante.count("reading")} lendo / ${estante.count("owned")} tenho / ${estante.count("wishlist")} wish`}
        />
        <StatCard
          href="/conta/enderecos"
          kanji="宅"
          label="Enderecos"
          value={addresses.count}
          accent="var(--akira-pink)"
          sub={`${5 - addresses.count} slot(s) livres`}
        />
        <StatCard
          href="/conta"
          kanji="点"
          label="Pontos"
          value={250}
          accent="var(--akira-yellow)"
          sub="resgate em breve"
        />
      </section>

      {/* Atividade recente */}
      <section>
        <div className="mb-5 flex items-baseline gap-3">
          <span className="display text-3xl text-[var(--ink)]">ATIVIDADE RECENTE</span>
          <span className="jp text-lg text-[var(--akira-red)]">最近</span>
          <span className="ml-auto font-mono text-[10px] text-[var(--ink-muted)] uppercase">
            {">"} ultimos 5 pedidos
          </span>
        </div>

        {recent5.length === 0 ? (
          <div className="panel-frame bg-[var(--bg-2)] p-10 text-center">
            <p className="jp text-7xl text-[var(--akira-red)]/30 leading-none">空</p>
            <p className="display mt-4 text-2xl text-[var(--ink)]">SEM PEDIDOS AINDA</p>
            <p className="mt-2 font-mono text-xs text-[var(--ink-muted)] uppercase">
              {">"} faca seu primeiro pedido pra ver aqui
            </p>
            <Link
              href="/busca"
              className="mt-6 inline-flex items-center gap-2 border-[3px] border-[var(--ink)] bg-[var(--akira-red)] px-6 py-3 text-[var(--ink)] shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <span className="display text-base uppercase">Explorar catalogo</span>
              <span className="jp text-sm">行</span>
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {recent5.map((o) => {
              const qty = o.items.reduce((s, i) => s + i.quantity, 0);
              return (
                <li key={o.orderId}>
                  <Link
                    href={`/pedido/${o.orderId}`}
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-[2px] border-[var(--line)] bg-[var(--bg-2)] px-4 py-3 hover:border-[var(--akira-red)] transition-all"
                  >
                    <span className="jp text-2xl text-[var(--akira-red)] group-hover:glow-red">
                      包
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-sm text-[var(--ink)] truncate">
                        #{o.orderId}
                      </p>
                      <p className="font-mono text-[10px] text-[var(--ink-muted)] uppercase">
                        {dateFmt.format(new Date(o.createdAt))} · {qty} item(ns)
                      </p>
                    </div>
                    <span className="display text-lg text-[var(--akira-cyan)] numerals">
                      {fmt.format(o.totals.total)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* CTA voltar catalogo */}
      <section className="border-t-2 border-dashed border-[var(--line)] pt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div>
          <p className="eyebrow">Catalogo // カタログ</p>
          <p className="display text-2xl text-[var(--ink)] mt-1">VOLTAR PRO CATALOGO</p>
          <p className="font-mono text-xs text-[var(--ink-muted)] mt-1">
            {">"} novos volumes toda semana
          </p>
        </div>
        <Link
          href="/busca"
          className="shimmer inline-flex items-center gap-3 border-[3px] border-[var(--ink)] bg-[var(--akira-cyan)] text-[var(--bg)] px-6 py-4 shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          <span className="display text-base uppercase tracking-wider">Ver catalogo</span>
          <span className="jp text-base">本</span>
        </Link>
      </section>
    </div>
  );
}

function StatCard({
  href,
  kanji,
  label,
  value,
  accent,
  sub,
}: {
  href: string;
  kanji: string;
  label: string;
  value: number;
  accent: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="relative border-[2px] border-[var(--line)] bg-[var(--bg-2)] p-5 shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all card-lift group block"
    >
      <span
        className="absolute -top-2 -right-2 px-2 py-0.5 font-mono text-[10px] font-bold"
        style={{ background: accent, color: "var(--bg)" }}
      >
        {label.toUpperCase()}
      </span>
      <div className="flex items-baseline justify-between gap-3">
        <span className="jp text-4xl" style={{ color: accent }}>
          {kanji}
        </span>
        <span
          className="display text-5xl numerals leading-none"
          style={{ color: accent }}
        >
          {value}
        </span>
      </div>
      <p className="mt-4 font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest">
        {">"} {sub}
      </p>
    </Link>
  );
}
