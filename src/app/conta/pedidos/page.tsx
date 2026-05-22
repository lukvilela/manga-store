"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

type StoredOrder = {
  orderId: string;
  createdAt: string;
  totals: { total: number };
  payment: "PIX" | "CREDIT_CARD" | "BOLETO";
  items: Array<{
    volumeId: string;
    seriesTitle: string;
    quantity: number;
    coverImage: string;
    volumeNumber: number;
  }>;
};

type StatusFilter = "todos" | "pendente" | "pago" | "entregue";

// status mock determinado pela idade do pedido
function deriveStatus(createdAt: string): "pendente" | "pago" | "entregue" {
  const ageMs = Date.now() - +new Date(createdAt);
  const ageH = ageMs / 3_600_000;
  if (ageH < 1) return "pendente";
  if (ageH < 72) return "pago";
  return "entregue";
}

const STATUS_META: Record<
  ReturnType<typeof deriveStatus>,
  { label: string; color: string; kanji: string }
> = {
  pendente: { label: "PENDENTE", color: "var(--akira-yellow)", kanji: "待" },
  pago: { label: "PAGO", color: "var(--akira-cyan)", kanji: "済" },
  entregue: { label: "ENTREGUE", color: "var(--akira-green)", kanji: "届" },
};

export default function PedidosPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("todos");

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redirect=/conta/pedidos");
  }, [loading, user, router]);

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

  const filtered = useMemo(() => {
    if (filter === "todos") return orders;
    return orders.filter((o) => deriveStatus(o.createdAt) === filter);
  }, [orders, filter]);

  if (loading || !user) {
    return (
      <div className="panel-frame bg-[var(--bg-2)] p-10 text-center">
        <p className="display text-2xl text-[var(--akira-red)] glow-red pulse-neon">CARREGANDO</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header secao */}
      <header className="border-b-2 border-[var(--line)] pb-5">
        <p className="eyebrow">Section 02 // 履歴</p>
        <div className="mt-2 flex items-baseline gap-4 flex-wrap">
          <span className="display text-6xl text-[var(--akira-red)] glow-red leading-none">02</span>
          <div>
            <h2 className="display text-4xl text-[var(--ink)] leading-none">PEDIDOS</h2>
            <p className="jp mt-1 text-lg text-[var(--ink-soft)]">注文履歴</p>
          </div>
          <span className="ml-auto font-mono text-xs text-[var(--ink-muted)] uppercase">
            {">"} total: <span className="text-[var(--akira-cyan)] numerals">{orders.length}</span>
          </span>
        </div>
      </header>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {(["todos", "pendente", "pago", "entregue"] as StatusFilter[]).map((f) => {
          const active = filter === f;
          const count =
            f === "todos"
              ? orders.length
              : orders.filter((o) => deriveStatus(o.createdAt) === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`border-[2px] px-4 py-2 font-mono text-xs uppercase tracking-widest transition-all ${
                active
                  ? "border-[var(--ink)] bg-[var(--akira-red)] text-[var(--ink)] shadow-hard"
                  : "border-[var(--line)] bg-[var(--bg-2)] text-[var(--ink-soft)] hover:border-[var(--akira-red)] hover:text-[var(--ink)]"
              }`}
            >
              {f} <span className="ml-2 numerals">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="panel-frame bg-[var(--bg-2)] p-14 text-center">
          <p className="jp text-[120px] text-[var(--akira-red)]/25 leading-none">空</p>
          <p className="display mt-2 text-3xl text-[var(--ink)]">
            {orders.length === 0 ? "NENHUM PEDIDO" : "NADA NESSE FILTRO"}
          </p>
          <p className="jp mt-2 text-base text-[var(--ink-muted)]">注文なし</p>
          <p className="mt-3 font-mono text-xs text-[var(--ink-muted)] uppercase">
            {">"} {orders.length === 0
              ? "compre algum volume pra ver aqui"
              : "remova o filtro pra ver outros pedidos"}
          </p>
          {orders.length === 0 && (
            <Link
              href="/busca"
              className="mt-6 inline-flex items-center gap-2 border-[3px] border-[var(--ink)] bg-[var(--akira-red)] px-6 py-3 text-[var(--ink)] shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <span className="display text-base uppercase">Comecar a comprar</span>
              <span className="jp text-sm">買</span>
            </Link>
          )}
        </div>
      ) : (
        <ul className="space-y-4">
          {filtered.map((o) => {
            const status = deriveStatus(o.createdAt);
            const meta = STATUS_META[status];
            const qty = o.items.reduce((s, i) => s + i.quantity, 0);
            const preview = o.items.slice(0, 4);
            const extra = o.items.length - preview.length;
            return (
              <li key={o.orderId}>
                <Link
                  href={`/pedido/${o.orderId}`}
                  className="group block panel-frame bg-[var(--bg-2)] p-5 md:p-6 hover:border-[var(--akira-red)] transition-all"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <span
                        className="inline-block px-2 py-0.5 font-mono text-[10px] font-bold"
                        style={{ background: meta.color, color: "var(--bg)" }}
                      >
                        {meta.label}
                      </span>
                      <p className="display text-2xl text-[var(--ink)] mt-2">
                        #{o.orderId}
                      </p>
                      <p className="font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest mt-1">
                        {dateFmt.format(new Date(o.createdAt))} · {qty} item(ns) · {o.payment}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="eyebrow !text-[var(--ink-muted)]">Total</p>
                      <p className="display text-3xl text-[var(--akira-red)] glow-red numerals leading-none mt-1">
                        {fmt.format(o.totals.total)}
                      </p>
                    </div>
                  </div>

                  {/* preview thumbs */}
                  <div className="mt-5 flex items-end gap-3">
                    {preview.map((it) => (
                      <div
                        key={it.volumeId}
                        className="relative h-20 w-14 flex-shrink-0 overflow-hidden border-2 border-[var(--ink)] shadow-hard"
                        title={`${it.seriesTitle} vol.${it.volumeNumber}`}
                      >
                        <Image src={it.coverImage} alt={it.seriesTitle} fill className="object-cover" />
                      </div>
                    ))}
                    {extra > 0 && (
                      <div className="h-20 w-14 flex-shrink-0 border-2 border-dashed border-[var(--line)] flex items-center justify-center font-mono text-xs text-[var(--ink-muted)]">
                        +{extra}
                      </div>
                    )}
                    <span className="ml-auto font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest group-hover:text-[var(--akira-cyan)] transition-colors">
                      {">"} ver detalhes <span className="jp text-sm">→</span>
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
