"use client";

import { useCart } from "@/context/CartContext";

type Props = {
  volumeId: string;
  seriesSlug: string;
  seriesTitle: string;
  volumeNumber: number;
  price: number;
  coverImage: string;
  stock: number;
};

export function AddToCartButton({
  volumeId,
  seriesSlug,
  seriesTitle,
  volumeNumber,
  price,
  coverImage,
  stock,
}: Props) {
  const { add, items } = useCart();
  const inCart = items.find((i) => i.volumeId === volumeId);

  return (
    <button
      type="button"
      onClick={() => add({ volumeId, seriesSlug, seriesTitle, volumeNumber, price, coverImage })}
      disabled={stock === 0}
      className={`w-full rounded-xl px-4 py-3 text-sm font-black uppercase tracking-wider transition ${
        stock === 0
          ? "cursor-not-allowed bg-gray-100 text-gray-400"
          : inCart
          ? "bg-red-50 text-[#dc2626] ring-1 ring-[#dc2626] hover:bg-red-100"
          : "bg-[#111827] text-white hover:bg-gray-800"
      }`}
    >
      {stock === 0
        ? "Esgotado"
        : inCart
        ? `No carrinho (${inCart.quantity}x) — Adicionar mais`
        : "Adicionar ao carrinho"}
    </button>
  );
}
