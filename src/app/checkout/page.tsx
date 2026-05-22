"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { lookupCep } from "@/lib/viacep";

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type Address = {
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
};

type PaymentMethod = "PIX" | "CREDIT_CARD" | "BOLETO";

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, total, clear } = useCart();
  const router = useRouter();

  const [address, setAddress] = useState<Address>({
    cep: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
  });
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("PIX");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?redirect=/checkout");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!authLoading && items.length === 0 && !success) {
      router.replace("/carrinho");
    }
  }, [items, authLoading, router, success]);

  const handleCepBlur = async () => {
    const cleaned = address.cep.replace(/\D/g, "");
    if (cleaned.length !== 8) return;
    setCepLoading(true);
    setCepError("");

    const result = await lookupCep(cleaned);
    setCepLoading(false);

    if (!result) {
      setCepError("CEP não encontrado.");
      return;
    }

    setAddress((prev) => ({
      ...prev,
      street: result.logradouro,
      district: result.bairro,
      city: result.localidade,
      state: result.uf,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSuccess(true);
    clear();
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f4f6]">
        <p className="text-gray-400">Carregando...</p>
      </main>
    );
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f4f6] px-4 py-10">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pedido realizado!</h1>
          <p className="mt-3 text-gray-600">
            Obrigado, <strong>{user?.name}</strong>! Seu pedido foi confirmado e será enviado em breve.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-xl bg-[#111827] px-6 py-3 text-sm font-bold text-white hover:bg-gray-800"
          >
            Continuar comprando
          </Link>
        </div>
      </main>
    );
  }

  const frete = total >= 150 ? 0 : 19.9;
  const desconto = payment === "PIX" ? total * 0.05 : payment === "BOLETO" ? total * 0.03 : 0;
  const totalFinal = total + frete - desconto;

  const paymentOptions: { value: PaymentMethod; label: string; desc: string }[] = [
    { value: "PIX", label: "PIX", desc: "5% de desconto — aprovação imediata" },
    { value: "CREDIT_CARD", label: "Cartão de crédito", desc: "Até 12x sem juros" },
    { value: "BOLETO", label: "Boleto bancário", desc: "3% de desconto — vence em 3 dias" },
  ];

  return (
    <main className="min-h-screen bg-[#f3f4f6]">
      {/* Page header */}
      <div className="bg-[#dc2626] px-4 py-5 md:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <h1 className="text-2xl font-black uppercase tracking-widest text-white">Checkout</h1>
          <Link
            href="/carrinho"
            className="rounded-full border border-white/30 bg-white/15 px-5 py-1.5 text-sm font-bold text-white hover:bg-white/25"
          >
            Voltar ao carrinho
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Lado esquerdo: endereço + pagamento */}
          <div className="space-y-4">
            {/* Endereço */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h2 className="mb-5 text-lg font-bold">Endereço de entrega</h2>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">CEP</label>
                    <input
                      type="text"
                      value={address.cep}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 8);
                        const formatted = v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v;
                        setAddress((p) => ({ ...p, cep: formatted }));
                        setCepError("");
                      }}
                      onBlur={handleCepBlur}
                      required
                      placeholder="00000-000"
                      className="w-full rounded-xl rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                    />
                    {cepLoading && <p className="mt-1 text-xs text-zinc-500">Buscando CEP...</p>}
                    {cepError && <p className="mt-1 text-xs text-red-500">{cepError}</p>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">Estado</label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress((p) => ({ ...p, state: e.target.value }))}
                      required
                      placeholder="SP"
                      className="w-full rounded-xl rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">Cidade</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
                    required
                    className="w-full rounded-xl rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">Bairro</label>
                  <input
                    type="text"
                    value={address.district}
                    onChange={(e) => setAddress((p) => ({ ...p, district: e.target.value }))}
                    required
                    className="w-full rounded-xl rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">Rua / Logradouro</label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => setAddress((p) => ({ ...p, street: e.target.value }))}
                      required
                      className="w-full rounded-xl rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">Número</label>
                    <input
                      type="text"
                      value={address.number}
                      onChange={(e) => setAddress((p) => ({ ...p, number: e.target.value }))}
                      required
                      className="w-full rounded-xl rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                    Complemento <span className="text-zinc-400">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={address.complement}
                    onChange={(e) => setAddress((p) => ({ ...p, complement: e.target.value }))}
                    placeholder="Apto, bloco, sala..."
                    className="w-full rounded-xl rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                  />
                </div>
              </div>
            </div>

            {/* Pagamento */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h2 className="mb-5 text-lg font-bold">Forma de pagamento</h2>
              <div className="space-y-3">
                {paymentOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                      payment === opt.value
                        ? "border-zinc-900 bg-zinc-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.value}
                      checked={payment === opt.value}
                      onChange={() => setPayment(opt.value)}
                      className="accent-zinc-900"
                    />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{opt.label}</p>
                      <p className="text-xs text-zinc-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Lado direito: resumo */}
          <div className="space-y-4">
            <div className="h-fit rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h2 className="mb-5 text-lg font-bold">Resumo do pedido</h2>

              <div className="mb-4 max-h-64 overflow-y-auto space-y-3 pr-1">
                {items.map((item) => (
                  <div key={item.volumeId} className="flex items-center gap-3">
                    <div className="relative h-14 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-black/5">
                      <Image
                        src={item.coverImage}
                        alt={item.seriesTitle}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{item.seriesTitle}</p>
                      <p className="text-xs text-zinc-500">Vol. {item.volumeNumber} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">{fmt.format(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-600">Subtotal</span>
                  <span>{fmt.format(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Frete</span>
                  {frete === 0 ? (
                    <span className="font-semibold text-green-600">Grátis</span>
                  ) : (
                    <span>{fmt.format(frete)}</span>
                  )}
                </div>
                {desconto > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto ({payment === "PIX" ? "5%" : "3%"})</span>
                    <span>- {fmt.format(desconto)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[#eadfce] pt-3 text-base font-bold">
                  <span>Total</span>
                  <span>{fmt.format(totalFinal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full rounded-xl bg-[#dc2626] px-4 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:bg-[#b91c1c] disabled:opacity-60"
              >
                {submitting ? "Processando..." : "Concluir pedido"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
