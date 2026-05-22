"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function CarrinhoPage() {
  const { items, remove, update, total } = useCart();

  const frete = total >= 150 ? 0 : 19.9;

  return (
    <main className="min-h-screen bg-[#f3f4f6]">
      {/* Page header */}
      <div className="bg-[#dc2626] px-4 py-5 md:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <h1 className="text-2xl font-black uppercase tracking-widest text-white">Carrinho</h1>
          <Link
            href="/"
            className="rounded-full border border-white/30 bg-white/15 px-5 py-1.5 text-sm font-bold text-white hover:bg-white/25"
          >
            Continuar comprando
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
        {items.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <p className="text-xl font-semibold text-gray-700">Seu carrinho está vazio</p>
            <Link
              href="/"
              className="rounded-full bg-[#111827] px-6 py-2.5 text-sm font-bold text-white hover:bg-gray-800"
            >
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            {/* Itens */}
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.volumeId}
                  className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
                >
                  <Link href={`/volume/${item.volumeId}`} className="shrink-0">
                    <div className="relative h-24 w-16 overflow-hidden rounded-lg">
                      <Image
                        src={item.coverImage}
                        alt={`${item.seriesTitle} Vol. ${item.volumeNumber}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.seriesTitle} Vol. {String(item.volumeNumber).padStart(2, "0")}
                      </p>
                      <p className="text-sm text-gray-500">{item.seriesTitle}</p>
                      <p className="mt-1 text-sm text-gray-600">
                        Total do item: {fmt.format(item.price * item.quantity)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-1">
                        <button
                          onClick={() => update(item.volumeId, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => update(item.volumeId, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => remove(item.volumeId)}
                        className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-500 hover:text-red-500"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo */}
            <div className="h-fit rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h2 className="mb-4 text-base font-bold text-gray-800">Resumo do pedido</h2>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{fmt.format(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span className={frete === 0 ? "font-semibold text-green-600" : ""}>
                    {frete === 0 ? "Gratis" : fmt.format(frete)}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-2xl font-bold text-gray-900">{fmt.format(total + frete)}</p>
              </div>

              <Link
                href="/checkout"
                className="mt-4 block rounded-xl bg-[#dc2626] px-4 py-3 text-center text-sm font-black uppercase tracking-wider text-white hover:bg-[#b91c1c]"
              >
                Ir para checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
