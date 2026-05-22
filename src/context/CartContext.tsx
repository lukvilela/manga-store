"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  volumeId: string;
  seriesSlug: string;
  seriesTitle: string;
  volumeNumber: number;
  price: number;
  coverImage: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">) => void;
  remove: (volumeId: string) => void;
  update: (volumeId: string, quantity: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem("manga-cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("manga-cart", JSON.stringify(items));
  }, [items]);

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

  const clear = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, update, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}
