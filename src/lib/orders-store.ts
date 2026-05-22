"use client";

import { useCallback, useEffect, useState } from "react";

export type OrderStatus = "pendente" | "confirmado" | "preparando" | "enviado" | "a_caminho" | "entregue";

export type StoredOrder = {
  orderId: string;
  trackingCode: string;
  createdAt: string; // ISO
  identification: { name: string; email: string; mode: string };
  address: {
    cep: string;
    street: string;
    number: string;
    complement: string;
    district: string;
    city: string;
    state: string;
  };
  shipping: "PAC" | "SEDEX" | "PICKUP";
  shippingLabel: string;
  shippingEtaDays: number;
  payment: "PIX" | "CREDIT_CARD" | "BOLETO";
  installments: number;
  items: Array<{
    volumeId: string;
    seriesTitle: string;
    volumeNumber: number;
    quantity: number;
    price: number;
    coverImage: string;
  }>;
  totals: { subtotal: number; shipping: number; discount: number; total: number };
};

const KEY = "akira-orders";
const EVENT = "orders:change";

function readAll(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeAll(orders: StoredOrder[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    // quota exceeded etc — silencia
  }
}

export function persistOrder(order: StoredOrder) {
  const all = readAll();
  const next = [order, ...all.filter((o) => o.orderId !== order.orderId)].slice(0, 50);
  writeAll(next);
}

export function getOrder(orderId: string): StoredOrder | null {
  return readAll().find((o) => o.orderId === orderId) ?? null;
}

// Gera codigo de rastreio mock no padrao Correios: AK123456789BR
export function generateTrackingCode(orderId: string): string {
  let hash = 0;
  for (let i = 0; i < orderId.length; i++) {
    hash = (hash * 31 + orderId.charCodeAt(i)) >>> 0;
  }
  const digits = String(hash).padStart(9, "0").slice(0, 9);
  return `AK${digits}BR`;
}

// ===== STATUS DERIVATION =====
// Ritmo demo: pra dar gostinho de evolucao real sem precisar de cron real,
// derivamos o status atual baseado em minutos decorridos.
//
// pendente: 0-1 min  (pagamento sendo processado)
// confirmado: 1-3 min (pagamento OK)
// preparando: 3-8 min (separando volumes)
// enviado: 8-15 min  (postado nos Correios)
// a_caminho: 15-30 min (transito)
// entregue: 30+ min  (chegou)
//
// Pra PICKUP a entrega e mais rapida.

const STATUS_SEQUENCE: OrderStatus[] = [
  "pendente",
  "confirmado",
  "preparando",
  "enviado",
  "a_caminho",
  "entregue",
];

const TIMELINE_MIN: Record<OrderStatus, number> = {
  pendente: 0,
  confirmado: 1,
  preparando: 3,
  enviado: 8,
  a_caminho: 15,
  entregue: 30,
};

export function deriveStatus(order: Pick<StoredOrder, "createdAt" | "shipping">): OrderStatus {
  const ageMin = (Date.now() - new Date(order.createdAt).getTime()) / 60_000;
  // PICKUP pula transito longo
  if (order.shipping === "PICKUP") {
    if (ageMin < 1) return "pendente";
    if (ageMin < 3) return "confirmado";
    if (ageMin < 8) return "preparando";
    return "entregue"; // pronto pra retirar
  }
  let current: OrderStatus = "pendente";
  for (const s of STATUS_SEQUENCE) {
    if (ageMin >= TIMELINE_MIN[s]) current = s;
  }
  return current;
}

// Timeline para UI: lista de etapas com timestamps absolutos
export type TimelineEntry = {
  status: OrderStatus;
  label: string;
  kanji: string;
  description: string;
  timestamp: Date;
  completed: boolean;
  current: boolean;
};

const STATUS_META: Record<OrderStatus, { label: string; kanji: string; description: string; color: string }> = {
  pendente: { label: "Pedido recebido", kanji: "受", description: "Confirmando o pagamento", color: "var(--akira-yellow)" },
  confirmado: { label: "Pagamento confirmado", kanji: "認", description: "Iniciando preparacao", color: "var(--akira-cyan)" },
  preparando: { label: "Em preparacao", kanji: "箱", description: "Separando os volumes na loja", color: "var(--akira-pink)" },
  enviado: { label: "Despachado", kanji: "発", description: "Postado nos Correios — rastreio liberado", color: "var(--akira-violet)" },
  a_caminho: { label: "A caminho", kanji: "走", description: "Em transito ate seu endereco", color: "var(--akira-red)" },
  entregue: { label: "Entregue", kanji: "届", description: "Chegou ao destinatario", color: "var(--akira-green)" },
};

export function buildTimeline(order: Pick<StoredOrder, "createdAt" | "shipping">): TimelineEntry[] {
  const current = deriveStatus(order);
  const createdMs = new Date(order.createdAt).getTime();
  const sequence: OrderStatus[] =
    order.shipping === "PICKUP"
      ? ["pendente", "confirmado", "preparando", "entregue"]
      : STATUS_SEQUENCE;

  return sequence.map((s) => {
    const meta = STATUS_META[s];
    const minutes = TIMELINE_MIN[s];
    return {
      status: s,
      label: meta.label,
      kanji: meta.kanji,
      description: meta.description,
      timestamp: new Date(createdMs + minutes * 60_000),
      completed: STATUS_SEQUENCE.indexOf(s) <= STATUS_SEQUENCE.indexOf(current),
      current: s === current,
    };
  });
}

export function getStatusMeta(status: OrderStatus) {
  return STATUS_META[status];
}

// Hook reativo (auto re-render a cada 30s pra evoluir status)
export function useOrders() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setOrders(readAll());
      setHydrated(true);
    });

    const sync = () => setOrders(readAll());
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT, sync);

    // Tick a cada 30s pra status visualmente evoluir
    const tick = setInterval(() => setOrders((prev) => [...prev]), 30_000);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT, sync);
      clearInterval(tick);
    };
  }, []);

  const removeOrder = useCallback((orderId: string) => {
    const all = readAll();
    writeAll(all.filter((o) => o.orderId !== orderId));
  }, []);

  return { orders, hydrated, removeOrder };
}

// Hook pra um pedido especifico (auto refresh)
export function useOrder(orderId: string) {
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setOrder(getOrder(orderId));
      setHydrated(true);
    });

    const sync = () => setOrder(getOrder(orderId));
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT, sync);

    // Re-render a cada 30s pra status evoluir
    const tick = setInterval(() => setOrder((prev) => (prev ? { ...prev } : prev)), 30_000);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT, sync);
      clearInterval(tick);
    };
  }, [orderId]);

  return { order, hydrated };
}
