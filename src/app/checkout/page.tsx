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

const SHIPPING_PRICES: Record<ShippingPaymentData["shipping"], number> = {
  PAC: 15.9,
  SEDEX: 24.9,
  PICKUP: 0,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, total, count, clear } = useCart();

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

  const shippingPrice = SHIPPING_PRICES[shippingPayment.shipping];
  const discount =
    shippingPayment.payment === "PIX"
      ? total * 0.05
      : shippingPayment.payment === "BOLETO"
        ? total * 0.03
        : 0;
  const totalFinal = total + shippingPrice - discount;

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
    const payload = {
      orderId,
      identification,
      address,
      shipping: shippingPayment.shipping,
      payment: shippingPayment.payment,
      installments: shippingPayment.installments,
      items,
      totals: { subtotal: total, shipping: shippingPrice, discount, total: totalFinal },
      createdAt: new Date().toISOString(),
    };

    // mock persist na session (pagina sucesso le)
    try {
      sessionStorage.setItem(`order:${orderId}`, JSON.stringify(payload));
    } catch {
      // ignore
    }

    // mock processamento
    await new Promise((r) => setTimeout(r, 1000));

    clear();
    router.push(`/pedido/${orderId}`);
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
          />
        </div>
      </section>
    </main>
  );
}
