"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import OrderSummary from "@/components/checkout/OrderSummary";
import StepIdentification, { type IdentificationData } from "@/components/checkout/StepIdentification";
import StepAddress, { type AddressData } from "@/components/checkout/StepAddress";
import StepShippingPayment, {
  type ShippingPaymentData,
} from "@/components/checkout/StepShippingPayment";
import StepConfirmation from "@/components/checkout/StepConfirmation";
import { calcShippingQuotes } from "@/lib/shipping";
import { persistOrder, generateTrackingCode, type StoredOrder } from "@/lib/orders-store";
import { computeCouponDiscount, markCouponUsed } from "@/lib/coupons-store";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, total, count, clear, coupon } = useCart();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const [identification, setIdentification] = useState<IdentificationData>({
    mode: "logged",
    name: "",
    email: "",
  });

  const [address, setAddress] = useState<AddressData>({
    cep: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
  });

  const [shippingPayment, setShippingPayment] = useState<ShippingPaymentData>({
    shipping: "PAC",
    payment: "PIX",
    installments: 1,
  });

  // Hidrata identificacao quando user carregar
  useEffect(() => {
    if (user) {
      setIdentification((prev) =>
        prev.name || prev.email
          ? prev
          : { mode: "logged", name: user.name, email: user.email }
      );
    } else if (!authLoading) {
      setIdentification((prev) => ({ ...prev, mode: "guest" }));
    }
  }, [user, authLoading]);

  // Carrinho vazio => /carrinho
  useEffect(() => {
    if (!authLoading && count === 0 && !redirecting) {
      router.replace("/carrinho");
    }
  }, [count, authLoading, router, redirecting]);

  // Cota dinamica por CEP/UF (mesma logica do step 3)
  const quotes = useMemo(
    () =>
      calcShippingQuotes({
        uf: address.state,
        cep: address.cep,
        subtotal: total,
        weightKg: 0.3 + count * 0.2,
      }),
    [address.state, address.cep, total, count]
  );
  const currentQuote = quotes.find((q) => q.method === shippingPayment.shipping);
  const baseShippingPrice = currentQuote?.available ? currentQuote.price : 0;
  const shippingEtaDays = currentQuote?.etaDays ?? 7;
  const shippingLabel = currentQuote?.label ?? shippingPayment.shipping;

  // Cupom — pode zerar frete e/ou descontar subtotal
  const { amountOff: couponAmount, freeShipping: couponFreeShipping } = computeCouponDiscount(
    coupon,
    total
  );
  const shippingPrice = couponFreeShipping ? 0 : baseShippingPrice;

  const discount =
    shippingPayment.payment === "PIX"
      ? total * 0.05
      : shippingPayment.payment === "BOLETO"
        ? total * 0.03
        : 0;
  const totalFinal = Math.max(0, total + shippingPrice - discount - couponAmount);

  const paymentLabel = useMemo(() => {
    if (shippingPayment.payment === "PIX") return "PIX 5%";
    if (shippingPayment.payment === "BOLETO") return "Boleto 3%";
    return undefined;
  }, [shippingPayment.payment]);

  // ===== HANDLER FINAL =====
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setRedirecting(true);

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const trackingCode = generateTrackingCode(orderId);
    const payload: StoredOrder = {
      orderId,
      trackingCode,
      identification,
      address,
      shipping: shippingPayment.shipping,
      shippingLabel,
      shippingEtaDays,
      payment: shippingPayment.payment,
      installments: shippingPayment.installments,
      items: items.map((it) => ({
        volumeId: it.volumeId,
        seriesTitle: it.seriesTitle,
        volumeNumber: it.volumeNumber,
        quantity: it.quantity,
        price: it.price,
        coverImage: it.coverImage,
      })),
      totals: {
        subtotal: total,
        shipping: shippingPrice,
        discount: discount + couponAmount,
        total: totalFinal,
      },
      createdAt: new Date().toISOString(),
    };

    // Persiste em localStorage (cross-session) + sessionStorage (compatibilidade)
    persistOrder(payload);
    try {
      sessionStorage.setItem(`order:${orderId}`, JSON.stringify(payload));
    } catch {
      // ignore
    }

    // Marca cupom como usado (so afeta cupons de resgate; fixos sao reutilizaveis)
    if (coupon) {
      markCouponUsed(coupon.code, orderId);
    }

    // mock processamento curto (criacao do pedido no backend)
    await new Promise((r) => setTimeout(r, 600));

    // Limpa o carrinho — o pedido ja esta persistido como "pendente".
    // O proximo passo (tela de pagamento) so muda o paidAt do pedido.
    clear();
    // Sempre vai pra /pagamento/[id]; se ja estiver pago (caso usuario volte),
    // a pagina mostra atalho pra /pedido/[id].
    router.push(`/pagamento/${orderId}`);
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-3">
          <span className="display text-3xl text-[var(--akira-red)] glow-red pulse-neon">CARREGANDO</span>
          <span className="jp text-sm text-[var(--ink-muted)]">読み込み中</span>
        </div>
      </main>
    );
  }

  if (count === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <span className="font-mono text-sm text-[var(--ink-muted)] uppercase tracking-widest">
          {">"} redirecionando...
        </span>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[var(--bg)] bg-zone-warm">
      {/* Hero / breadcrumb */}
      <section className="relative overflow-hidden border-b-2 border-[var(--line)]">
        <div className="absolute inset-0 halftone-red opacity-40" />
        <div className="bike-streak top-1/2" style={{ animationDelay: "0.5s" }} />
        <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-6">
          <div className="flex items-baseline gap-4">
            <span className="eyebrow">/ checkout / 会計</span>
          </div>
          <div className="mt-2 flex items-baseline gap-5">
            <h1 className="display text-5xl md:text-7xl text-[var(--ink)] glow-red leading-none">
              FECHAR PEDIDO
            </h1>
            <span className="jp text-2xl md:text-3xl text-[var(--akira-red)] glow-red">会計</span>
          </div>
          <p className="mt-3 max-w-xl font-mono text-xs text-[var(--ink-muted)] uppercase tracking-wider">
            {">"} 4 etapas / processo seguro / Neo-Tokyo Manga Distribution
          </p>
        </div>
      </section>

      {/* Stepper */}
      <section className="border-b-2 border-[var(--line)] bg-[var(--bg-2)]">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
          <CheckoutStepper current={step} />
        </div>
      </section>

      {/* Grid principal */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Coluna principal — step ativo */}
          <div className="panel-frame bg-[var(--bg-2)] p-6 md:p-10">
            {step === 1 && (
              <StepIdentification
                user={user}
                value={identification}
                onChange={setIdentification}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <StepAddress
                value={address}
                onChange={setAddress}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <StepShippingPayment
                value={shippingPayment}
                onChange={setShippingPayment}
                subtotal={total}
                itemCount={count}
                cep={address.cep}
                uf={address.state}
                onNext={() => setStep(4)}
                onBack={() => setStep(2)}
              />
            )}
            {step === 4 && (
              <StepConfirmation
                identification={identification}
                address={address}
                shippingPayment={shippingPayment}
                shippingPrice={shippingPrice}
                discount={discount}
                totalFinal={totalFinal}
                submitting={submitting}
                onBack={() => setStep(3)}
                onSubmit={handleFinalSubmit}
              />
            )}
          </div>

          {/* Sidebar */}
          <OrderSummary
            shipping={step >= 3 ? shippingPrice : 0}
            discount={step >= 3 ? discount : 0}
            paymentLabel={step >= 3 ? paymentLabel : undefined}
            couponAmount={couponAmount}
          />
        </div>
      </section>
    </main>
  );
}
