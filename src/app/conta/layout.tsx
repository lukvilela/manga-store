import Header from "@/components/Header";
import AccountNav from "@/components/AccountNav";

export default function ContaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />

      <main className="relative min-h-screen bg-[var(--bg)] bg-zone-warm">
        {/* Hero strip menor */}
        <section className="relative overflow-hidden border-b-2 border-[var(--line)]">
          <div className="absolute inset-0 halftone-red opacity-25" />
          <div className="bike-streak" style={{ top: "55%", animationDelay: "0.8s" }} />

          <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
            <div className="flex items-baseline gap-4">
              <span className="eyebrow">/ conta / マイページ</span>
            </div>
            <div className="mt-2 flex items-baseline gap-5 flex-wrap">
              <h1 className="display text-4xl md:text-5xl text-[var(--ink)] leading-none">
                AREA <span className="text-[var(--akira-red)] glow-red">DO LEITOR</span>
              </h1>
              <span className="jp text-2xl text-[var(--akira-cyan)] glow-cyan">読者専用</span>
            </div>
            <p className="mt-3 max-w-xl font-mono text-[10px] md:text-xs text-[var(--ink-muted)] uppercase tracking-wider">
              {">"} estante / pedidos / enderecos / pontos
            </p>
          </div>
        </section>

        {/* Grid principal */}
        <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <AccountNav />
            <div className="min-w-0">{children}</div>
          </div>
        </section>

        {/* Footer faixa */}
        <footer className="border-t-2 border-[var(--line)] bg-[var(--bg-2)]">
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 flex items-center justify-between flex-wrap gap-3">
            <p className="font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest">
              {">"} akira-mangas // neo-tokyo manga distribution // 2026
            </p>
            <p className="jp text-sm text-[var(--akira-red)] glow-red">アキラ</p>
          </div>
        </footer>
      </main>
    </>
  );
}
