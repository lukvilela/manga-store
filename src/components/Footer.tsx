import Link from "next/link";

type FooterLink = { href: string; label: string };

const catalogo: FooterLink[] = [
  { href: "/busca", label: "Top Mangas" },
  { href: "/busca?ordem=populares", label: "Populares" },
  { href: "/busca?ordem=trending", label: "Trending" },
  { href: "/busca?ordem=novidades", label: "Novidades" },
];

const generos: FooterLink[] = [
  { href: "/busca?genre=27", label: "Shounen" },
  { href: "/busca?genre=42", label: "Seinen" },
  { href: "/busca?genre=25", label: "Shoujo" },
  { href: "/busca?genre=1", label: "Action" },
  { href: "/busca?genre=22", label: "Romance" },
  { href: "/busca?genre=14", label: "Horror" },
];

const conta: FooterLink[] = [
  { href: "/login", label: "Minha Conta" },
  { href: "/carrinho", label: "Carrinho" },
  { href: "/pedido", label: "Pedidos" },
  { href: "/estante", label: "Estante" },
  { href: "/endereco", label: "Enderecos" },
];

function FooterColumn({
  title,
  jpTitle,
  links,
  accent,
}: {
  title: string;
  jpTitle: string;
  links: FooterLink[];
  accent: string;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-4">
        <span className={`jp text-base font-black ${accent}`}>{jpTitle}</span>
        <span className="eyebrow text-[10px] text-ink-muted">{title}</span>
      </div>
      <ul className="flex flex-col gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-ink-soft hover:text-akira-cyan transition-colors inline-flex items-center gap-2 group"
            >
              <span className="text-akira-red opacity-0 group-hover:opacity-100 transition-opacity">
                ›
              </span>
              <span>{l.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative border-t-4 border-akira-red mt-8 overflow-hidden bg-[var(--bg)]">
      <div className="absolute inset-0 halftone-lg opacity-25 pointer-events-none" aria-hidden />
      <div className="bike-streak" style={{ top: "20%" }} />
      <div className="bike-streak" style={{ top: "70%" }} />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16">
        {/* Top: 4 colunas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* Coluna 1 — brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="jp text-akira-red text-2xl font-black glow-red mb-1">
              アキラ
            </p>
            <p className="display text-3xl md:text-4xl leading-none">
              Akira<span className="text-akira-red glow-red"> Mangás</span>
              <span className="text-akira-red">.</span>
            </p>
            <p className="jp text-xs text-ink-muted mt-3">
              アキラ・マンガ · Neo-Tokyo · 2026
            </p>
            <p className="text-sm text-ink-soft mt-4 max-w-xs">
              Catalogo curado de mangas com vibracao Akira, capas em alta resolucao e ritual cyberpunk.
            </p>
          </div>

          <FooterColumn
            title="CATALOGO"
            jpTitle="カタログ"
            links={catalogo}
            accent="text-akira-cyan glow-cyan"
          />

          <FooterColumn
            title="GENEROS"
            jpTitle="ジャンル"
            links={generos}
            accent="text-akira-yellow glow-yellow"
          />

          <FooterColumn
            title="CONTA"
            jpTitle="アカウント"
            links={conta}
            accent="text-akira-pink glow-pink"
          />
        </div>

        {/* Onomatopeias separator */}
        <div className="mt-12 mb-6 flex gap-6 eyebrow flex-wrap items-center justify-center md:justify-start">
          <span className="text-akira-red glow-red text-xl">DOKI!</span>
          <span className="text-akira-cyan glow-cyan text-xl">ZAP!</span>
          <span className="text-akira-pink glow-pink text-xl">BAM!</span>
          <span className="text-akira-yellow glow-yellow text-xl">KAPOW!</span>
          <span className="text-akira-violet glow-violet text-xl">CRASH!</span>
        </div>

        {/* Bottom row */}
        <div className="pt-6 border-t border-[var(--line)] flex flex-col md:flex-row justify-between gap-3 text-xs font-mono text-ink-muted uppercase tracking-widest">
          <p>© 2026 AKIRA MANGÁS · All rights reserved</p>
          <p>
            Powered by{" "}
            <span className="text-akira-cyan">Jikan</span> +{" "}
            <span className="text-akira-pink">MangaDex</span>
          </p>
          <p>
            Made in <span className="text-akira-red">Brasil</span> · Inspired by{" "}
            <span className="text-akira-yellow">Otomo Katsuhiro</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
