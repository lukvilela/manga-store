import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--line)]">
      {/* AKIRA katakana gigante background */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden
      >
        <span
          className="jp text-akira-red opacity-[0.08] font-black leading-none"
          style={{ fontSize: "clamp(20rem, 50vw, 60rem)" }}
        >
          アキラ
        </span>
      </div>

      {/* Halftone overlay */}
      <div className="absolute inset-0 halftone-lg opacity-40" aria-hidden />

      {/* Bike trail streak */}
      <div className="bike-streak" style={{ top: "30%" }} />
      <div className="bike-streak" style={{ top: "70%", animationDelay: "2.5s" }} />

      {/* Akira gradient overlay */}
      <div className="akira-trail absolute inset-0" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-32">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-8 reveal" style={{ animationDelay: "0.1s" }}>
          <span className="pulse-neon w-2 h-2 rounded-full bg-akira-red shadow-[0_0_12px_var(--akira-red)]" />
          <span className="eyebrow text-akira-cyan glow-cyan">Neo-Tokyo · 2026 · A.D.</span>
          <span className="hidden md:inline eyebrow text-ink-muted">·</span>
          <span className="hidden md:inline eyebrow text-akira-yellow glow-yellow">SYSTEM ONLINE</span>
        </div>

        {/* Japanese title */}
        <div className="reveal" style={{ animationDelay: "0.2s" }}>
          <span className="jp text-akira-red text-3xl md:text-5xl font-black glow-red">
            アキラ・マンガ
          </span>
        </div>

        {/* Title */}
        <h1 className="display text-[clamp(3.5rem,12vw,11rem)] mt-4 leading-[0.85] reveal" style={{ animationDelay: "0.3s" }}>
          <span className="block">AKIRA</span>
          <span className="block text-akira-red glow-red action-lines pl-2">MANGÁS.</span>
        </h1>

        {/* Tagline */}
        <p className="mt-10 max-w-2xl text-lg md:text-2xl text-ink-soft leading-relaxed reveal" style={{ animationDelay: "0.5s" }}>
          A loja de mangas que voce sempre quis em{" "}
          <span className="text-akira-red glow-red font-semibold">Neo-Tokyo</span>. Coracao via{" "}
          <span className="text-akira-cyan glow-cyan">MyAnimeList API</span>, capas em alta,{" "}
          <span className="text-akira-pink glow-pink">vibracao cyberpunk</span>.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center gap-4 reveal" style={{ animationDelay: "0.7s" }}>
          <Link
            href="/busca"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-akira-red text-ink font-bold uppercase tracking-widest text-sm border-2 border-akira-red shadow-hard-lg hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[12px_12px_0_var(--ink)] transition-all"
          >
            <span>Explorar Catalogo</span>
            <span className="group-hover:translate-x-1 transition-transform text-xl">→</span>
          </Link>
          <Link
            href="/busca?genre=42"
            className="inline-flex items-center gap-3 px-8 py-4 border-2 border-akira-cyan text-akira-cyan font-bold uppercase tracking-widest text-sm hover:bg-akira-cyan hover:text-bg transition-all"
          >
            Top Seinen
          </Link>
          <span className="hidden md:inline eyebrow text-ink-muted ml-4">
            ↳ <span className="text-akira-yellow">55.000+ series</span> indexadas
          </span>
        </div>

        {/* Onomatopeia decorativa */}
        <div className="absolute top-16 right-4 md:right-12 reveal" style={{ animationDelay: "0.9s" }}>
          <span className="onomatopeia text-3xl md:text-5xl">DOKI!</span>
        </div>
        <div className="absolute bottom-32 right-1/3 hidden md:block reveal" style={{ animationDelay: "1.2s" }}>
          <span className="jp text-akira-yellow text-6xl font-black opacity-60 glow-yellow">ドン!</span>
        </div>

        {/* Stats bar */}
        <div className="mt-20 pt-8 border-t-2 border-akira-red grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 reveal" style={{ animationDelay: "1s" }}>
          <Stat jp="件数" label="Series catalogadas" value="55.000+" sub="via Jikan API" accent="red" />
          <Stat jp="種類" label="Generos" value="50+" sub="Shounen · Seinen · Shoujo" accent="cyan" />
          <Stat jp="画質" label="Capas em alta" value="HD" sub="WebP otimizado" accent="yellow" />
          <Stat jp="配送" label="Frete" value="Brasil" sub="PIX · cartao · boleto" accent="pink" />
        </div>
      </div>
    </section>
  );
}

function Stat({ jp, label, value, sub, accent }: { jp: string; label: string; value: string; sub: string; accent: "red"|"cyan"|"yellow"|"pink" }) {
  const colorClass = {
    red: "text-akira-red glow-red",
    cyan: "text-akira-cyan glow-cyan",
    yellow: "text-akira-yellow glow-yellow",
    pink: "text-akira-pink glow-pink",
  }[accent];
  return (
    <div>
      <div className="eyebrow mb-1 flex items-center gap-2">
        <span className={`jp text-base ${colorClass}`}>{jp}</span>
        <span>·</span>
        <span>{label}</span>
      </div>
      <div className="display text-3xl md:text-4xl text-ink">{value}</div>
      <div className="text-xs text-ink-muted mt-1 font-mono">{sub}</div>
    </div>
  );
}
