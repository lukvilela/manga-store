import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Sobre · Case Study",
  description:
    "Akira Mangás — case study técnico. E-commerce de mangás construído em 1 noite por Lucas Vilela. Next.js 16, TypeScript, Tailwind, Jikan + MangaDex.",
  openGraph: {
    title: "Akira Mangás — Case Study",
    description:
      "E-commerce de mangás estética Akira. Demo técnica fullstack: 50 rotas, 3 APIs externas, gamificação, checkout completo mockado.",
    type: "article",
  },
};

// ---------- icones SVG inline (sem deps) ----------

function NextLogo() {
  return (
    <svg viewBox="0 0 180 180" className="w-7 h-7" fill="currentColor" aria-hidden>
      <mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
        <circle cx="90" cy="90" r="90" fill="#000" />
      </mask>
      <g mask="url(#m)">
        <circle cx="90" cy="90" r="87" stroke="currentColor" strokeWidth="6" fill="none" />
        <path d="M60 50 L60 130 M60 50 L120 130 M120 50 L120 130" stroke="currentColor" strokeWidth="8" fill="none" />
      </g>
    </svg>
  );
}
function TsLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-7 h-7" fill="currentColor" aria-hidden>
      <rect width="32" height="32" rx="4" />
      <text x="16" y="22" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="11" fill="#0e0a0a">TS</text>
    </svg>
  );
}
function ReactLogo() {
  return (
    <svg viewBox="-12 -12 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
      <circle r="2" fill="currentColor" />
      <ellipse rx="11" ry="4.2" />
      <ellipse rx="11" ry="4.2" transform="rotate(60)" />
      <ellipse rx="11" ry="4.2" transform="rotate(120)" />
    </svg>
  );
}
function TailwindLogo() {
  return (
    <svg viewBox="0 0 32 20" className="w-7 h-7" fill="currentColor" aria-hidden>
      <path d="M9 0c-4 0-6.5 2-7.5 6 1.5-2 3.25-2.75 5.25-2.25 1.14.285 1.955 1.111 2.855 2.025C11.085 7.265 12.79 9 16.5 9c4 0 6.5-2 7.5-6-1.5 2-3.25 2.75-5.25 2.25-1.14-.285-1.955-1.111-2.855-2.025C14.415 1.735 12.71 0 9 0zM1.5 11c-4 0-6.5 2-7.5 6 1.5-2 3.25-2.75 5.25-2.25 1.14.285 1.955 1.111 2.855 2.025C3.585 18.265 5.29 20 9 20c4 0 6.5-2 7.5-6-1.5 2-3.25 2.75-5.25 2.25-1.14-.285-1.955-1.111-2.855-2.025C6.915 12.735 5.21 11 1.5 11z" transform="translate(6 0)" />
    </svg>
  );
}
function JikanLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-7 h-7" fill="currentColor" aria-hidden>
      <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
      <text x="16" y="20" textAnchor="middle" fontFamily="monospace" fontWeight="900" fontSize="10">MAL</text>
    </svg>
  );
}
function VercelLogo() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-hidden>
      <path d="M12 2L24 22H0L12 2z" />
    </svg>
  );
}
function PrismaLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-7 h-7" fill="currentColor" aria-hidden>
      <path d="M22.5 24.5l-13 4-4-19L15 1l11 17.5-3.5 6z" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M9.5 28.5L15 1" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}
function MangaDexLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-7 h-7" fill="currentColor" aria-hidden>
      <path d="M4 6h10l4 4h10v16H4z" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M16 14v8" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function ViaCepLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M16 4c-5 0-9 4-9 9 0 6 9 15 9 15s9-9 9-15c0-5-4-9-9-9z" />
      <circle cx="16" cy="13" r="3" />
    </svg>
  );
}

// ---------- dados estaticos ----------

const stackCards: Array<{
  Logo: () => ReactElement;
  name: string;
  version: string;
  uso: string;
  accent: string;
}> = [
  { Logo: NextLogo, name: "Next.js", version: "16.1.6", uso: "App Router, Server Components, ISR, View Transitions", accent: "text-ink" },
  { Logo: TsLogo, name: "TypeScript", version: "5 strict", uso: "Zero any. Tipagem ponta a ponta da API ao render.", accent: "text-akira-cyan" },
  { Logo: ReactLogo, name: "React", version: "19.2", uso: "Server-first; Client somente onde precisa de estado/efeito.", accent: "text-akira-cyan" },
  { Logo: TailwindLogo, name: "Tailwind CSS", version: "4", uso: "Design tokens em @theme inline + utilitarios custom Akira.", accent: "text-akira-cyan" },
  { Logo: JikanLogo, name: "Jikan v4", version: "MyAnimeList", uso: "55k+ mangas, busca, top, recomendacoes — cache ISR 1h.", accent: "text-akira-yellow" },
  { Logo: MangaDexLogo, name: "MangaDex", version: "API v5", uso: "Capa REAL por volume — fallback colorido se faltar.", accent: "text-akira-pink" },
  { Logo: ViaCepLogo, name: "ViaCEP", version: "v1", uso: "Auto-fill endereco no checkout a partir do CEP.", accent: "text-akira-green" },
  { Logo: VercelLogo, name: "Vercel", version: "Hobby", uso: "Deploy edge, ISR, zero custo neste demo.", accent: "text-ink" },
  { Logo: PrismaLogo, name: "Prisma", version: "6", uso: "Rotas legadas de auth (jose + bcrypt + cookies httpOnly).", accent: "text-akira-violet" },
];

const decisoes: Array<{ titulo: string; problema: string; solucao: string; tradeoff: string; accent: string }> = [
  {
    titulo: "Sem backend real",
    problema: "Banco hospedado custa $; demo precisa ser zero-custo e rodar offline.",
    solucao: "localStorage com Context (Cart, Auth fake, Estante, Wishlist).",
    tradeoff: "Sem sync cross-device. Roadmap: Neon Postgres + Prisma migrate.",
    accent: "text-akira-red",
  },
  {
    titulo: "Rate limit Jikan",
    problema: "API publica permite 3 req/s. Home carrega 6 listas paralelas.",
    solucao: "Carregamento sequencial com sleep 400ms + ISR de 1h.",
    tradeoff: "TTFB maior na primeira request fria — depois CDN serve em ms.",
    accent: "text-akira-yellow",
  },
  {
    titulo: "Imagens unoptimized",
    problema: "Vercel Image Optimization tem 1k transformacoes/mes no plano free.",
    solucao: "Servir capas direto do CDN MAL/MangaDex (unoptimized: true).",
    tradeoff: "Sem AVIF/WebP automatico — capas ja vem em JPG otimizado.",
    accent: "text-akira-cyan",
  },
  {
    titulo: "Capas por volume",
    problema: "Jikan so retorna capa principal da serie, nao por volume.",
    solucao: "Cruzar com MangaDex que indexa capa por language + volume.",
    tradeoff: "2 APIs encadeadas — cache 24h evita pressao na MangaDex.",
    accent: "text-akira-pink",
  },
  {
    titulo: "Traducao PT-BR",
    problema: "Sinopses do Jikan vem so em ingles. DeepL/Google sao pagos.",
    solucao: "MyMemory API free + chunking 500 chars + cache 24h.",
    tradeoff: "Qualidade ~80% do DeepL. Aceitavel pro contexto de catalogo.",
    accent: "text-akira-violet",
  },
];

const numeros: Array<{ valor: string; label: string; jp: string; accent: string }> = [
  { valor: "50", label: "Rotas", jp: "ルート", accent: "text-akira-red glow-red" },
  { valor: "12k", label: "Linhas de codigo", jp: "コード行", accent: "text-akira-cyan glow-cyan" },
  { valor: "6", label: "PRs mergeados", jp: "PR", accent: "text-akira-yellow glow-yellow" },
  { valor: "3", label: "APIs externas", jp: "API", accent: "text-akira-pink glow-pink" },
  { valor: "60s", label: "Build", jp: "ビルド", accent: "text-akira-green glow-green" },
  { valor: "100%", label: "TS strict, zero erros", jp: "型安全", accent: "text-akira-violet glow-violet" },
  { valor: "1", label: "Noite (~10h)", jp: "一夜", accent: "text-akira-red glow-red" },
];

const warStories: Array<{ titulo: string; corpo: string; sfx: string; accent: string }> = [
  {
    sfx: "BANG!",
    titulo: "Rate limit Jikan estourou",
    corpo: "Home com 5 fetches paralelos virou 429 instantaneo. Refatorei pra sequencial com sleep 400ms entre chamadas + ISR 1h. Primeira carga lenta, demais instantaneas via CDN.",
    accent: "text-akira-red",
  },
  {
    sfx: "ZAP!",
    titulo: "useSearchParams sem Suspense",
    corpo: "Build Next 16 quebrou com 'useSearchParams must be wrapped in Suspense'. Wrappei so o componente que consome, nao a pagina inteira — pra nao matar SSR do resto.",
    accent: "text-akira-cyan",
  },
  {
    sfx: "DOH!",
    titulo: "GitHub push 403",
    corpo: "Tinha 2 contas (lukvilela e lukasvilela) e o gh auth ativo era a outra. `gh auth switch` resolveu — agora tenho note mental: checar `git config user.email` antes de cada push.",
    accent: "text-akira-yellow",
  },
  {
    sfx: "POW!",
    titulo: "Traducao sem API key paga",
    corpo: "DeepL e Google Translate cobram por caractere. MyMemory da 5k chars/dia free — bati o limite em testes. Solucao: chunk de 500 + cache 24h + fallback pro ingles.",
    accent: "text-akira-pink",
  },
  {
    sfx: "BAM!",
    titulo: "Capa por volume nao existe no Jikan",
    corpo: "Quis montar a estante visual e descobri que so tinha capa da serie. Pluguei MangaDex pra cruzar por titulo + numero do volume. Coverage ~70%; fallback colorido pro resto.",
    accent: "text-akira-violet",
  },
];

const roadmap: Array<{ item: string; porque: string }> = [
  { item: "Backend real (Postgres)", porque: "Precisa Neon credentials + migration. Hoje vive em localStorage." },
  { item: "Gateway de pagamento real", porque: "Stripe BR / Mercado Pago. Hoje so mock deterministico (cartao 4242)." },
  { item: "Testes E2E (Playwright)", porque: "Em progresso. Quero rodar fluxo compra completo em CI." },
  { item: "App nativo (Capacitor)", porque: "Loja merece bolso. Capacitor ja foi feito no projeto Ritmo, da pra portar." },
  { item: "Recomendacao IA", porque: "Embeddings + cosine similarity nas sinopses pra sugerir series." },
];

// ---------- componente ----------

export default function SobrePage() {
  return (
    <>
      <Header />

      {/* ============ HERO ============ */}
      <section className="relative bg-zone-red overflow-hidden border-b-4 border-akira-red">
        <div className="absolute inset-0 halftone-lg opacity-30 pointer-events-none" aria-hidden />
        <div className="bike-streak" style={{ top: "30%" }} />
        <div className="bike-streak" style={{ top: "65%" }} />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-32">
          <p className="eyebrow text-akira-cyan glow-cyan mb-4">
            CASE STUDY · 紹介 · LUCAS VILELA
          </p>

          <div className="flex items-start gap-4 mb-4">
            <span className="onomatopeia text-3xl md:text-5xl">WHAM!</span>
            <span className="jp text-akira-yellow text-xl md:text-2xl glow-yellow mt-3">
              アキラ・マンガ
            </span>
          </div>

          <h1 className="display text-5xl md:text-8xl leading-[0.95] tracking-tight text-ink mb-8">
            SOBRE O <span className="text-akira-red glow-red">PROJETO</span>
            <span className="text-akira-red">.</span>
          </h1>

          <p className="text-lg md:text-2xl text-ink-soft max-w-3xl leading-snug mb-3">
            E-commerce de mangás. Estética <span className="text-akira-red glow-red font-bold">Akira</span>.
            Construído em <span className="text-akira-cyan glow-cyan font-bold">1 noite</span> por{" "}
            <span className="text-akira-yellow glow-yellow font-bold">@lukasvilela</span>.
          </p>
          <p className="text-base md:text-lg text-ink-muted max-w-3xl mb-10">
            Demo técnica fullstack. Sem produto pra vender — só pra provar que dá pra fazer.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="https://github.com/lukvilela/manga-store"
              target="_blank"
              rel="noopener noreferrer"
              className="shimmer inline-flex items-center gap-3 bg-akira-red text-ink px-6 py-3 font-mono text-sm uppercase tracking-widest shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform"
            >
              <span>Ver repositório</span>
              <span className="jp text-xs">→ GitHub</span>
            </a>
            <a
              href="https://github.com/lukvilela"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 border-2 border-ink text-ink px-6 py-3 font-mono text-sm uppercase tracking-widest hover:bg-akira-cyan hover:text-bg hover:border-akira-cyan transition-colors"
            >
              <span>Perfil do dev</span>
              <span className="jp text-xs">開発者</span>
            </a>
          </div>
        </div>
      </section>

      {/* ============ POR QUE EXISTE ============ */}
      <section className="relative bg-zone-warm py-20 md:py-28 border-b border-[var(--line)]">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <p className="eyebrow text-akira-red glow-red mb-3">POR QUE EXISTE · 理由</p>
          <h2 className="display text-4xl md:text-6xl text-ink mb-10 leading-tight">
            Esta loja não <span className="text-akira-cyan glow-cyan">vende</span> nada.
          </h2>

          <div className="space-y-6 text-lg md:text-xl text-ink-soft leading-relaxed">
            <p>
              Ela existe pra <span className="text-ink font-bold">provar</span> que dá pra construir
              um e-commerce inteiro em uma noite — com algumas paradas pra café e Akira na tela.
            </p>
            <p>
              O desafio começou simples: copywriter virou marca. Recrutador testa: tem auth? tem
              carrinho? tem checkout multi-step? mock de pagamento? rastreio de pedido? gamificação?
              <br />
              <span className="text-akira-red glow-red font-bold">Sim, sim, sim e sim.</span>
            </p>
            <p>
              A estética não é aleatória. <span className="jp text-akira-yellow">AKIRA</span>{" "}
              (Otomo Katsuhiro, 1982) é o ápice do design cyberpunk impresso — halftone, paleta
              abstrata, onomatopeias gigantes, sombra dura. Misturei isso com{" "}
              <span className="text-akira-pink">Letterboxd</span> (estante visual) e{" "}
              <span className="text-akira-cyan">Mercado Livre</span> (UX de e-commerce que brasileiro
              entende).
            </p>
            <p className="text-ink-muted italic text-base">
              Tudo o que tá aqui é decisão consciente. Nada foi adicionado &quot;porque dava&quot;.
            </p>
          </div>
        </div>
      </section>

      {/* ============ STACK GRID ============ */}
      <section className="relative bg-zone-cyan py-20 md:py-28 border-b border-[var(--line)] overflow-hidden">
        <div className="absolute inset-0 halftone opacity-20 pointer-events-none" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8">
          <p className="eyebrow text-akira-cyan glow-cyan mb-3">STACK · 技術</p>
          <h2 className="display text-4xl md:text-6xl text-ink mb-12 leading-tight">
            O que tá <span className="text-akira-yellow glow-yellow">debaixo</span> do capô<span className="text-akira-red">.</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stackCards.map((s) => (
              <div
                key={s.name}
                className="panel-frame p-5 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_var(--akira-red)] transition-transform"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className={s.accent}>
                    <s.Logo />
                  </div>
                  <span className="eyebrow text-[10px] text-ink-muted">{s.version}</span>
                </div>
                <p className="display text-2xl text-ink mb-2">{s.name}</p>
                <p className="text-sm text-ink-soft leading-snug">{s.uso}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ DECISOES ARQUITETURAIS ============ */}
      <section className="relative bg-zone-violet py-20 md:py-28 border-b border-[var(--line)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <p className="eyebrow text-akira-violet glow-violet mb-3">DECISÕES · 判断</p>
          <h2 className="display text-4xl md:text-6xl text-ink mb-4 leading-tight">
            Cada escolha tem um <span className="text-akira-pink glow-pink">tradeoff</span>.
          </h2>
          <p className="text-lg text-ink-soft max-w-2xl mb-12">
            Não existe stack perfeita. Existe a stack certa pro contexto. Aqui as 5 decisões
            que mais moldaram este projeto.
          </p>

          <div className="space-y-6">
            {decisoes.map((d, i) => (
              <div
                key={d.titulo}
                className="panel-frame p-6 md:p-8 grid md:grid-cols-[auto_1fr_1fr_1fr] gap-6 items-start"
              >
                <div className="flex md:flex-col items-center md:items-start gap-3 md:gap-1 md:min-w-[100px]">
                  <span className={`display text-5xl md:text-6xl ${d.accent} glow-red`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="eyebrow text-[10px] text-ink-muted">{d.titulo}</p>
                </div>

                <div>
                  <p className="eyebrow text-akira-red mb-2">PROBLEMA</p>
                  <p className="text-ink leading-snug">{d.problema}</p>
                </div>

                <div>
                  <p className="eyebrow text-akira-cyan mb-2">SOLUÇÃO</p>
                  <p className="text-ink leading-snug">{d.solucao}</p>
                </div>

                <div>
                  <p className="eyebrow text-akira-yellow mb-2">TRADEOFF</p>
                  <p className="text-ink-soft leading-snug">{d.tradeoff}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ NUMEROS ============ */}
      <section className="relative bg-zone-yellow py-20 md:py-28 border-b border-[var(--line)] overflow-hidden">
        <div className="absolute inset-0 halftone-lg opacity-25 pointer-events-none" aria-hidden />
        <div className="bike-streak" style={{ top: "50%" }} />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8">
          <p className="eyebrow text-akira-yellow glow-yellow mb-3">NÚMEROS · 数字</p>
          <h2 className="display text-4xl md:text-6xl text-ink mb-12 leading-tight">
            Quanto custa uma <span className="text-akira-red glow-red">noite</span>?
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {numeros.map((n) => (
              <div
                key={n.label}
                className="panel-frame p-5 text-center bg-[var(--bg-2)]"
              >
                <p className={`display text-4xl md:text-5xl ${n.accent} numerals leading-none mb-2`}>
                  {n.valor}
                </p>
                <p className="jp text-xs text-ink-muted mb-1">{n.jp}</p>
                <p className="eyebrow text-[10px] text-ink-soft leading-tight">{n.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WAR STORIES ============ */}
      <section className="relative bg-zone-pink py-20 md:py-28 border-b border-[var(--line)]">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <p className="eyebrow text-akira-pink glow-pink mb-3">DESAFIOS REAIS · 戦闘</p>
          <h2 className="display text-4xl md:text-6xl text-ink mb-4 leading-tight">
            Nem tudo foi <span className="text-akira-cyan glow-cyan">sopa</span>.
          </h2>
          <p className="text-lg text-ink-soft max-w-2xl mb-12">
            War stories curtos. Bug real, solução real. Sem polidor de currículo.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {warStories.map((w) => (
              <div key={w.titulo} className="panel-frame p-6 relative">
                <span className={`onomatopeia absolute -top-3 -left-2 text-xl ${w.accent}`}>
                  {w.sfx}
                </span>
                <h3 className="display text-2xl text-ink mt-4 mb-3 leading-tight">{w.titulo}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{w.corpo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ROADMAP / O QUE NAO TEM ============ */}
      <section className="relative bg-zone-green py-20 md:py-28 border-b border-[var(--line)]">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <p className="eyebrow text-akira-green glow-green mb-3">ROADMAP HONESTO · 未来</p>
          <h2 className="display text-4xl md:text-6xl text-ink mb-4 leading-tight">
            O que <span className="text-akira-red glow-red">não</span> tem (ainda).
          </h2>
          <p className="text-lg text-ink-soft max-w-2xl mb-12">
            Demonstrar autoconsciência é tão importante quanto entregar. Aqui o que ficou pra próxima.
          </p>

          <ul className="space-y-4">
            {roadmap.map((r, i) => (
              <li
                key={r.item}
                className="grid grid-cols-[auto_1fr_2fr] gap-6 items-baseline border-b border-dashed border-[var(--line)] pb-4"
              >
                <span className="display text-3xl text-akira-red glow-red numerals">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="display text-xl text-ink leading-snug">{r.item}</p>
                <p className="text-sm text-ink-soft leading-snug">{r.porque}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ CREDITOS ============ */}
      <section className="relative bg-zone-warm py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 halftone opacity-20 pointer-events-none" aria-hidden />

        <div className="relative max-w-5xl mx-auto px-4 md:px-8 text-center">
          <p className="jp text-akira-red text-3xl glow-red mb-2">作者</p>
          <h2 className="display text-5xl md:text-7xl text-ink mb-4 leading-tight">
            Lucas <span className="text-akira-red glow-red">Vilela</span>
          </h2>
          <p className="eyebrow text-akira-cyan glow-cyan mb-8">
            18 ANOS · BARUERI/SP · DEV FULLSTACK
          </p>

          <p className="text-xl md:text-2xl text-ink-soft max-w-2xl mx-auto mb-12 leading-relaxed">
            &quot;Aprende fazendo. Esta loja é um exemplo.&quot;
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-12">
            <a
              href="https://github.com/lukvilela"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-ink text-ink px-5 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-akira-red hover:border-akira-red transition-colors"
            >
              GitHub · @lukvilela
            </a>
            <a
              href="https://github.com/lukasvilela"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-ink text-ink px-5 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-akira-cyan hover:text-bg hover:border-akira-cyan transition-colors"
            >
              GitHub · @lukasvilela
            </a>
            <a
              href="mailto:lucas@lukvilela.dev"
              className="border-2 border-ink text-ink px-5 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-akira-yellow hover:text-bg hover:border-akira-yellow transition-colors"
            >
              E-mail
            </a>
            <a
              href="https://linkedin.com/in/lukasvilela"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-ink text-ink px-5 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-akira-pink hover:text-bg hover:border-akira-pink transition-colors"
            >
              LinkedIn
            </a>
            <Link
              href="/"
              className="border-2 border-akira-red bg-akira-red text-ink px-5 py-2.5 font-mono text-xs uppercase tracking-widest hover:translate-x-1 hover:translate-y-1 transition-transform shadow-hard"
            >
              ← Voltar à loja
            </Link>
          </div>

          <p className="font-mono text-xs text-ink-muted uppercase tracking-widest">
            Built with{" "}
            <span className="text-akira-red glow-red">♥</span>{" "}
            and{" "}
            <span className="jp text-akira-red glow-red">暴力</span>{" "}
            (violence) · Neo-Tokyo · 2026
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
