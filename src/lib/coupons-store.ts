"use client";

import { useCallback, useEffect, useState } from "react";

// ============================================================================
// TIPOS
// ============================================================================

export type CouponDiscount =
  | { kind: "percent"; value: number; minValue?: number }
  | { kind: "fixed"; value: number; minValue?: number }
  | { kind: "free_shipping" };

export type AppliedCoupon = {
  code: string;
  discount: CouponDiscount;
  // Quando vem de resgate (rewards), guarda o codigo original em formato
  // AKIRA-XXX-XXXX. Em cupons fixos (AKIRA10 etc), source = "fixed".
  source: "fixed" | "redemption";
};

export type ValidateResult =
  | { valid: true; discount: CouponDiscount; source: "fixed" | "redemption" }
  | { valid: false; reason: string };

// Redemption tem campos opcionais novos (usedAt / usedInOrder) pra compat
// retroativa com items antigos salvos em localStorage.
export type Redemption = {
  rewardId: string;
  name: string;
  code: string;
  date: string;
  priceAtRedemption: number;
  usedAt?: string;
  usedInOrder?: string;
};

// ============================================================================
// CUPONS FIXOS — sempre validos (demo)
// ============================================================================

type FixedCoupon = {
  code: string;
  discount: CouponDiscount;
  label: string;
  // Se firstOrderOnly = true, só valida quando nao ha pedidos previos
  firstOrderOnly?: boolean;
};

export const FIXED_COUPONS: Record<string, FixedCoupon> = {
  AKIRA10: {
    code: "AKIRA10",
    discount: { kind: "percent", value: 10, minValue: 100 },
    label: "10% OFF (min R$ 100)",
  },
  BIKEGANG: {
    code: "BIKEGANG",
    discount: { kind: "fixed", value: 25, minValue: 150 },
    label: "R$ 25 OFF (min R$ 150)",
  },
  NEOTOKYO: {
    code: "NEOTOKYO",
    discount: { kind: "free_shipping" },
    label: "Frete gratis",
  },
  MANGAFAN: {
    code: "MANGAFAN",
    discount: { kind: "percent", value: 5 },
    label: "5% OFF",
  },
  TETSUO: {
    code: "TETSUO",
    discount: { kind: "percent", value: 20 },
    label: "20% OFF primeiro pedido",
    firstOrderOnly: true,
  },
};

export const SUGGESTED_COUPONS = ["AKIRA10", "MANGAFAN"] as const;

// ============================================================================
// CONSTANTES
// ============================================================================

const REDEMPTIONS_KEY = "akira-mangas-redemptions";
const ORDERS_KEY = "akira-orders";
const EVENT = "redemptions:change";

// Map de rewardId pro tipo de desconto
const REDEMPTION_DISCOUNTS: Record<string, CouponDiscount> = {
  "off-5": { kind: "percent", value: 5 },
  "off-10": { kind: "percent", value: 10 },
  "off-15-frete": { kind: "percent", value: 15 },
  "frete-gratis": { kind: "free_shipping" },
  "box-25": { kind: "percent", value: 25 },
};

// ============================================================================
// HELPERS — LEITURA / ESCRITA
// ============================================================================

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
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    // ignore quota
  }
}

function hasAnyOrder(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return false;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) && arr.length > 0;
  } catch {
    return false;
  }
}

// Deriva desconto a partir do rewardId. Codigos cujo prefix nao mapeia
// pra desconto monetario (STK, WALL, AVT, etc) sao considerados decorativos
// e nao podem ser usados como cupom de carrinho.
function discountFromRedemption(r: Redemption): CouponDiscount | null {
  return REDEMPTION_DISCOUNTS[r.rewardId] ?? null;
}

// ============================================================================
// API PURA — sem hook
// ============================================================================

export function validateCoupon(code: string, subtotal: number): ValidateResult {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { valid: false, reason: "Digite um codigo" };

  // 1) Tenta cupom fixo
  const fixed = FIXED_COUPONS[normalized];
  if (fixed) {
    if (fixed.firstOrderOnly && hasAnyOrder()) {
      return { valid: false, reason: "Cupom valido apenas no primeiro pedido" };
    }
    if (fixed.discount.kind !== "free_shipping" && fixed.discount.minValue) {
      if (subtotal < fixed.discount.minValue) {
        return {
          valid: false,
          reason: `Pedido minimo de R$ ${fixed.discount.minValue.toFixed(2).replace(".", ",")}`,
        };
      }
    }
    return { valid: true, discount: fixed.discount, source: "fixed" };
  }

  // 2) Tenta cupom de resgate (AKIRA-XXX-XXXX)
  const redemptions = readRedemptions();
  const match = redemptions.find((r) => r.code === normalized);
  if (!match) return { valid: false, reason: "Cupom invalido" };
  if (match.usedAt) return { valid: false, reason: "Cupom ja utilizado" };

  const discount = discountFromRedemption(match);
  if (!discount) {
    return { valid: false, reason: "Recompensa decorativa, nao aplicavel no carrinho" };
  }

  if (discount.kind !== "free_shipping" && discount.minValue && subtotal < discount.minValue) {
    return {
      valid: false,
      reason: `Pedido minimo de R$ ${discount.minValue.toFixed(2).replace(".", ",")}`,
    };
  }

  return { valid: true, discount, source: "redemption" };
}

export function markCouponUsed(code: string, orderId?: string): void {
  const normalized = code.trim().toUpperCase();
  // Cupons fixos nao precisam marcar — sao reutilizaveis demo
  if (FIXED_COUPONS[normalized]) return;

  const redemptions = readRedemptions();
  const idx = redemptions.findIndex((r) => r.code === normalized);
  if (idx === -1) return;
  if (redemptions[idx].usedAt) return;

  const updated: Redemption = {
    ...redemptions[idx],
    usedAt: new Date().toISOString(),
    usedInOrder: orderId,
  };
  const next = [...redemptions];
  next[idx] = updated;
  writeRedemptions(next);
}

// ============================================================================
// HOOK REATIVO
// ============================================================================

export function useCoupons() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setRedemptions(readRedemptions());
      setHydrated(true);
    });
    const sync = () => setRedemptions(readRedemptions());
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT, sync);
    };
  }, []);

  const validate = useCallback((code: string, subtotal: number) => validateCoupon(code, subtotal), []);
  const markUsed = useCallback((code: string, orderId?: string) => {
    markCouponUsed(code, orderId);
  }, []);

  return { redemptions, hydrated, validateCoupon: validate, markCouponUsed: markUsed };
}

// ============================================================================
// CALCULO DE DESCONTO MONETARIO
// ============================================================================

// Retorna { amountOff, freeShipping } pra aplicar no checkout.
export function computeCouponDiscount(
  coupon: AppliedCoupon | null,
  subtotal: number
): { amountOff: number; freeShipping: boolean } {
  if (!coupon) return { amountOff: 0, freeShipping: false };
  const d = coupon.discount;
  if (d.kind === "free_shipping") return { amountOff: 0, freeShipping: true };
  if (d.kind === "percent") {
    return { amountOff: Math.round(subtotal * (d.value / 100) * 100) / 100, freeShipping: false };
  }
  // fixed
  return { amountOff: Math.min(d.value, subtotal), freeShipping: false };
}

// Helper pra label legivel do cupom (usado no summary)
export function formatCouponLabel(coupon: AppliedCoupon): string {
  const d = coupon.discount;
  if (d.kind === "free_shipping") return "frete gratis";
  if (d.kind === "percent") return `-${d.value}%`;
  return `-R$ ${d.value.toFixed(2).replace(".", ",")}`;
}
