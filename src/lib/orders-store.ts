"use client";

import { useCallback, useEffect, useState } from "react";

export type OrderStatus =
  | "pendente"
  | "confirmado"
  | "preparando"
  | "enviado"
  | "a_caminho"
  | "entregue"
  | "cancelado"
  | "devolvido";

export type ReturnStatus = "solicitada" | "aprovada" | "concluida";

export type StoredOrder = {
  orderId: string;
  trackingCode: string;
  createdAt: string; // ISO
  paidAt?: string; // ISO — preenchido apos confirmacao mock do pagamento
  // Cancelamento
  cancelledAt?: string; // ISO — preenchido quando cliente cancela
  cancelReason?: string;
  // Devolucao
  returnRequestedAt?: string; // ISO — quando cliente abriu pedido de devolucao
  returnReason?: string;
  returnItems?: string[]; // ids dos volumes a devolver
  returnStatus?: ReturnStatus;
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

// Cancela o pedido (mock). Define cancelledAt + motivo e dispara o event
// pra UI atualizar imediatamente. Idempotente — chamar 2x nao reverte.
export function cancelOrder(orderId: string, reason: string): StoredOrder | null {
  const all = readAll();
  const idx = all.findIndex((o) => o.orderId === orderId);
  if (idx === -1) return null;
  if (all[idx].cancelledAt) return all[idx]; // ja cancelado
  const updated: StoredOrder = {
    ...all[idx],
    cancelledAt: new Date().toISOString(),
    cancelReason: reason,
  };
  all[idx] = updated;
  writeAll(all);
  try {
    sessionStorage.setItem(`order:${orderId}`, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

// Abre uma solicitacao de devolucao. Items opcional (default: todos os volumes).
export function requestReturn(
  orderId: string,
  reason: string,
  items?: string[]
): StoredOrder | null {
  const all = readAll();
  const idx = all.findIndex((o) => o.orderId === orderId);
  if (idx === -1) return null;
  if (all[idx].returnRequestedAt) return all[idx]; // ja solicitado
  const target = all[idx];
  const updated: StoredOrder = {
    ...target,
    returnRequestedAt: new Date().toISOString(),
    returnReason: reason,
    returnItems: items && items.length > 0 ? items : target.items.map((i) => i.volumeId),
    returnStatus: "solicitada",
  };
  all[idx] = updated;
  writeAll(all);
  try {
    sessionStorage.setItem(`order:${orderId}`, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

// Marca o pedido como pago (mock). Quando paidAt e setado, a deriveStatus
// passa a usar paidAt como ancora — entao o status pula direto pra "confirmado"
// e evolui rapido pelas etapas seguintes (igual loja real apos checkout).
export function markAsPaid(orderId: string): StoredOrder | null {
  const all = readAll();
  const idx = all.findIndex((o) => o.orderId === orderId);
  if (idx === -1) return null;
  const updated: StoredOrder = { ...all[idx], paidAt: new Date().toISOString() };
  all[idx] = updated;
  writeAll(all);
  // sessionStorage legado tambem precisa do mirror
  try {
    sessionStorage.setItem(`order:${orderId}`, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
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
  // Estados terminais — nao entram na sequencia padrao, valor ignorado
  cancelado: 0,
  devolvido: 0,
};

export function deriveStatus(
  order: Pick<StoredOrder, "createdAt" | "shipping" | "paidAt" | "cancelledAt" | "returnStatus">
): OrderStatus {
  // Cancelado e prioritario — nao importa o tempo
  if (order.cancelledAt) return "cancelado";
  // Devolucao concluida sobrepoe "entregue"
  if (order.returnStatus === "concluida") return "devolvido";
  // Se ja foi pago, ancora o tempo no paidAt — assim status pula direto
  // pra "confirmado" no instante 0 e evolui pelas etapas seguintes.
  // Se ainda nao foi pago, fica eternamente em "pendente" (aguarda checkout).
  if (!order.paidAt) return "pendente";
  const ageMin = (Date.now() - new Date(order.paidAt).getTime()) / 60_000;
  // PICKUP pula transito longo
  if (order.shipping === "PICKUP") {
    if (ageMin < 2) return "confirmado";
    if (ageMin < 5) return "preparando";
    return "entregue"; // pronto pra retirar
  }
  // Mapeia tempo desde pagamento em status (pago = ja confirmado)
  if (ageMin < 2) return "confirmado";
  if (ageMin < 5) return "preparando";
  if (ageMin < 10) return "enviado";
  if (ageMin < 20) return "a_caminho";
  return "entregue";
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
  cancelado: { label: "Cancelado", kanji: "中止", description: "Pedido cancelado pelo cliente", color: "var(--ink-muted)" },
  devolvido: { label: "Devolvido", kanji: "返品", description: "Produto devolvido — reembolso processado", color: "var(--ink-muted)" },
};

export function buildTimeline(
  order: Pick<StoredOrder, "createdAt" | "shipping" | "paidAt" | "cancelledAt" | "returnStatus">
): TimelineEntry[] {
  const current = deriveStatus(order);
  const createdMs = new Date(order.createdAt).getTime();

  // Pedido cancelado: timeline curta — recebimento + cancelado
  if (current === "cancelado") {
    const cancelMs = order.cancelledAt ? new Date(order.cancelledAt).getTime() : Date.now();
    const pendMeta = STATUS_META.pendente;
    const cancMeta = STATUS_META.cancelado;
    return [
      {
        status: "pendente",
        label: pendMeta.label,
        kanji: pendMeta.kanji,
        description: pendMeta.description,
        timestamp: new Date(createdMs),
        completed: true,
        current: false,
      },
      {
        status: "cancelado",
        label: cancMeta.label,
        kanji: cancMeta.kanji,
        description: cancMeta.description,
        timestamp: new Date(cancelMs),
        completed: true,
        current: true,
      },
    ];
  }

  // Ancora o resto da timeline em paidAt (se houver). Antes de pagar,
  // tudo fica relativo a createdAt mas marcado como nao concluido.
  const paidMs = order.paidAt ? new Date(order.paidAt).getTime() : null;
  const sequence: OrderStatus[] =
    order.shipping === "PICKUP"
      ? ["pendente", "confirmado", "preparando", "entregue"]
      : STATUS_SEQUENCE;

  return sequence.map((s) => {
    const meta = STATUS_META[s];
    const minutes = TIMELINE_MIN[s];
    // "pendente" usa createdAt; demais usam paidAt (se pago)
    const anchor = s === "pendente" ? createdMs : paidMs ?? createdMs;
    return {
      status: s,
      label: meta.label,
      kanji: meta.kanji,
      description: meta.description,
      timestamp: new Date(anchor + (s === "pendente" ? 0 : minutes) * 60_000),
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
