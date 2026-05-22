import Link from "next/link";
import Header from "@/components/Header";
import NotFoundAkiraTrigger from "@/components/easter-eggs/NotFoundAkiraTrigger";

export default function NotFound() {
  return (
    <>
      <Header />
      <NotFoundAkiraTrigger />
      <main className="relative overflow-hidden min-h-[calc(100vh-80px)] bg-zone-red flex items-center">
        {/* Backdrop: katakana gigante */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden
        >
          <span
            className="jp text-akira-red opacity-[0.06] font-black leading-none"
            style={{ fontSize: "clamp(15rem, 40vw, 48rem)" }}
          >
            404
          </span>
        </div>

        <div
          className="absolute inset-0 halftone-lg opacity-25 pointer-events-none"
          aria-hidden
        />

        {/* Bike streaks animados */}
        <div className="bike-streak" style={{ top: "18%" }} />
        <div className="bike-streak" style={{ top: "48%" }} />
        <div className="bike-streak" style={{ top: "78%" }} />

        <div className="relative max-w-5xl mx-auto px-4 md:px-8 py-20 md:py-32 w-full text-center">
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="block w-1.5 h-8 bg-akira-red shadow-[3px_3px_0_var(--ink)]" />
            <span className="eyebrow text-akira-cyan glow-cyan">
              SYSTEM ERROR · NEO-TOKYO
            </span>
          </div>

          {/* ERROR 404 glitch */}
          <div className="relative inline-block mb-4">
            <h1
              className="display text-akira-red glow-red leading-[0.85] glitch-text"
              style={{ fontSize: "clamp(5rem, 18vw, 14rem)" }}
              data-text="ERROR 404"
              data-akira-target="title"
            >
              ERROR 404
            </h1>
            <span className="onomatopeia text-2xl md:text-4xl absolute -top-4 md:-top-6 -right-6 md:-right-12 rotate-12 text-akira-yellow">
              CRASH!
            </span>
          </div>

          {/* Katakana */}
          <p className="jp text-akira-pink text-2xl md:text-4xl font-black glow-pink mb-6">
            ページが見つかりません
          </p>

          <p className="text-base md:text-xl text-ink-soft max-w-2xl mx-auto mb-10">
            Esta pagina nao existe no Neo-Tokyo. Pode ter sido apagada, movida
            ou nunca esteve aqui — verifique a URL ou volte para o catalogo.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-akira-red text-ink font-bold uppercase tracking-widest text-sm border-2 border-ink shadow-hard-lg hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[12px_12px_0_var(--akira-yellow)] transition-all shimmer"
            >
              <span>Voltar ao inicio</span>
              <span className="group-hover:translate-x-1 transition-transform text-xl">
                →
              </span>
            </Link>
            <Link
              href="/busca"
              className="inline-flex items-center gap-3 px-6 py-4 border-2 border-akira-cyan text-akira-cyan font-bold uppercase tracking-widest text-xs hover:bg-akira-cyan hover:text-bg transition-all"
            >
              Explorar catalogo
            </Link>
          </div>

          {/* Codigo de erro decorativo */}
          <div className="mt-12 inline-flex items-center gap-3 text-[10px] font-mono text-ink-muted uppercase tracking-widest">
            <span className="w-2 h-2 bg-akira-red rounded-full pulse-neon" />
            <span>ERR_NEO_TOKYO_NOT_FOUND · 0x404</span>
          </div>
        </div>

        <style>{`
          @keyframes glitch-anim {
            0%, 100% { transform: translate(0, 0); }
            20% { transform: translate(-2px, 1px); }
            40% { transform: translate(2px, -1px); }
            60% { transform: translate(-1px, 2px); }
            80% { transform: translate(1px, -2px); }
          }
          .glitch-text {
            position: relative;
            animation: glitch-anim 2.4s infinite steps(1);
          }
          .glitch-text::before,
          .glitch-text::after {
            content: attr(data-text);
            position: absolute;
            inset: 0;
            opacity: 0.7;
            pointer-events: none;
          }
          .glitch-text::before {
            color: var(--akira-cyan);
            transform: translate(-3px, 0);
            clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
            animation: glitch-anim 2.4s infinite reverse steps(1);
          }
          .glitch-text::after {
            color: var(--akira-pink);
            transform: translate(3px, 0);
            clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
            animation: glitch-anim 2.4s infinite steps(1);
          }
        `}</style>
      </main>
    </>
  );
}
