"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  computeCouponDiscount,
  validateCoupon as runValidate,
  type AppliedCoupon,
  type CouponDiscount,
  type ValidateResult,
} from "@/lib/coupons-store";

export type CartItem = {
  volumeId: string;
  seriesSlug: string;
  seriesTitle: string;
  volumeNumber: number;
  price: number;
  coverImage: string;
  quantity: number;
};

type ApplyCouponResult =
  | { ok: true; discount: CouponDiscount }
  | { ok: false; reason: string };

type CartContextType = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">) => void;
  remove: (volumeId: string) => void;
  update: (volumeId: string, quantity: number) => void;
  clear: () => void;
  total: number;
  count: number;
  // Cupom
  coupon: AppliedCoupon | null;
  applyCoupon: (code: string) => ApplyCouponResult;
  removeCoupon: () => void;
  couponAmountOff: number;
  couponFreeShipping: boolean;
};

const CartContext = createContext<CartContextType | null>(null);

const CART_KEY = "manga-cart";
const COUPON_KEY = "manga-cart-coupon";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState<AppliedCoupon | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(COUPON_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Sanity check no shape
      if (parsed && typeof parsed.code === "string" && parsed.discount) {
        return parsed as AppliedCoupon;
      }
      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (coupon) localStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
    else localStorage.removeItem(COUPON_KEY);
  }, [coupon]);

  const add = (item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.volumeId === item.volumeId);
      if (existing) {
        return prev.map((i) =>
          i.volumeId === item.volumeId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const remove = (volumeId: string) =>
    setItems((prev) => prev.filter((i) => i.volumeId !== volumeId));

  const update = (volumeId: string, quantity: number) => {
    if (quantity <= 0) return remove(volumeId);
    setItems((prev) =>
      prev.map((i) => (i.volumeId === volumeId ? { ...i, quantity } : i))
    );
  };

  const clear = () => {
    setItems([]);
    setCoupon(null);
  };

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  // Cupom — re-valida sempre que mudar subtotal (ex: usuario removeu item
  // e caiu abaixo do minimo). Se invalidar, remove o cupom silenciosamente.
  useEffect(() => {
    if (!coupon) return;
    const result = runValidate(coupon.code, total);
    if (!result.valid) {
      setCoupon(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const applyCoupon = useCallback(
    (code: string): ApplyCouponResult => {
      const result: ValidateResult = runValidate(code, total);
      if (!result.valid) return { ok: false, reason: result.reason };
      const applied: AppliedCoupon = {
        code: code.trim().toUpperCase(),
        discount: result.discount,
        source: result.source,
      };
      setCoupon(applied);
      return { ok: true, discount: result.discount };
    },
    [total]
  );

  const removeCoupon = useCallback(() => setCoupon(null), []);

  const { amountOff, freeShipping } = computeCouponDiscount(coupon, total);

  return (
    <CartContext.Provider
      value={{
        items,
        add,
        remove,
        update,
        clear,
        total,
        count,
        coupon,
        applyCoupon,
        removeCoupon,
        couponAmountOff: amountOff,
        couponFreeShipping: freeShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}
