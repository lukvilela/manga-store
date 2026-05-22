# 🏍️ Akira Mangás

> Loja de mangás cyberpunk · Next.js 16 · 50 rotas · zero custo Vercel.
> E-commerce completo construído em 1 noite por **[@lukvilela](https://github.com/lukvilela)** como demo técnica fullstack.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vercel](https://img.shields.io/badge/deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://mangaverse-zeta.vercel.app/)
[![Built in 1 night](https://img.shields.io/badge/built%20in-1%20night-c1121f?style=for-the-badge&labelColor=0e0a0a)](#-decisões-arquiteturais)
[![License](https://img.shields.io/badge/license-MIT-f3e9d6?style=for-the-badge&labelColor=0e0a0a)](#-license)

```
            ╔═══════════════════════════════════════════╗
            ║   ア キ ラ ・ マ ン ガ                    ║
            ║                                           ║
            ║   AKIRA MANGÁS · NEO-TOKYO MANGA STORE    ║
            ║   ──────────────────────────────────────  ║
            ║   50 rotas · Jikan + MangaDex · ISR · JWT ║
            ╚═══════════════════════════════════════════╝
                            ▼ WHAM! ▼
```

---

## 🎬 Live demo

**[mangaverse-zeta.vercel.app](https://mangaverse-zeta.vercel.app/)**

Veja o case study completo em **[/sobre](https://mangaverse-zeta.vercel.app/sobre)**.

Easter eggs ativos: `↑ ↑ ↓ ↓ ← → ← → B A` (Konami) · `4242 4242 4242 4242` (Stripe card no checkout) · digitar `KANEDA` · digitar `KAMEHAMEHA`.

---

## ⚡ Highlights

- **50 rotas** organizadas em App Router (catálogo, produto, carrinho, checkout, conta, ranking, comunidade…)
- **Fluxo de compra ponta a ponta** mockado de forma realista
  - Produto → carrinho → checkout 4-step → pagamento (PIX QR / cartão Luhn / boleto) → confirmação → timeline de status evoluindo
- **3 APIs externas** integradas com cache ISR
  - Jikan v4 (MyAnimeList, 55k+ mangás) · MangaDex (capa por volume) · ViaCEP (auto-fill endereço)
- **Tradução PT-BR automática** das sinopses (MyMemory + cache 24h)
- **Gamificação** completa — XP, badges, streak diário, lootbox semanal
- **Cupons funcionais** — 5 códigos fixos + sistema de resgate
- **Frete dinâmico por CEP** — 6 zonas Brasil
- **Estoque visível** (determinístico) · cancelar/devolver pedido · avaliação pós-compra
- **Comparador de mangás** lado-a-lado · wishlist compartilhável · ranking de leitores
- **Coleção visual** estilo Letterboxd · modo leitura mockado · newsletter
- **Easter eggs** (Konami code, cartão 4242, KANEDA, KAMEHAMEHA)
- **Microinterações** — View Transitions, parallax, GlitchText, TiltCard, PageLoader
- **SEO completo** — sitemap dinâmico, JSON-LD (Product + Breadcrumb), robots, PWA manifest
- **100% TypeScript strict** · zero erros · zero `any`

---

## 🛠 Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | [Next.js](https://nextjs.org/) (App Router + Server Components + ISR + View Transitions) | 16.1.6 |
| UI | [React](https://react.dev/) | 19.2 |
| Linguagem | [TypeScript](https://www.typescriptlang.org/) strict | 5 |
| Styling | [Tailwind CSS](https://tailwindcss.com/) com design tokens em `@theme inline` | 4 |
| Fontes | `next/font` (Bagel Fat One · Plus Jakarta · Noto Serif JP · JetBrains Mono) | — |
| Auth | [`jose`](https://github.com/panva/jose) (JWT) + [`bcryptjs`](https://github.com/dcodeIO/bcrypt.js) + cookies `httpOnly` | — |
| ORM | [Prisma](https://www.prisma.io/) (rotas legadas de auth) | 6 |
| API mangás | [Jikan v4](https://docs.api.jikan.moe/) (MyAnimeList wrapper) | — |
| API capas | [MangaDex API](https://api.mangadex.org/docs/) | — |
| API CEP | [ViaCEP](https://viacep.com.br/) | — |
| Tradução | [MyMemory](https://mymemory.translated.net/) | — |
| Deploy | [Vercel](https://vercel.com/) plano Hobby (zero custo) | — |

---

## 🚀 Rodando local

```bash
# Clonar
git clone https://github.com/lukvilela/manga-store.git
cd manga-store

# Instalar
npm install
npx prisma generate

# Dev server (http://localhost:3000)
npm run dev

# Build de produção
npm run build && npm run start
```

Não precisa de `.env`. Tudo funciona out-of-the-box com APIs públicas + `localStorage`.

---

## 📐 Decisões arquiteturais

Cada escolha tem um tradeoff. Aqui as 5 que mais moldaram o projeto:

| # | Decisão | Tradeoff |
|---|---|---|
| 01 | **Sem backend real** — `localStorage` + Context (Cart, Auth, Estante, Wishlist) | Sem sync cross-device. Roadmap: Neon Postgres. |
| 02 | **Carregamento sequencial** com `sleep(400ms)` para respeitar rate limit Jikan (3 req/s) | TTFB maior na primeira request fria — CDN serve em ms depois. |
| 03 | **`unoptimized: true`** no `<Image>` — capas servidas direto do CDN MAL/MangaDex | Sem AVIF/WebP automático. Em troca: 1k transformações/mês free não estouram. |
| 04 | **Capa por volume via MangaDex** porque Jikan só tem capa principal da série | 2 APIs encadeadas. Cache 24h evita pressão. Coverage ~70%, fallback colorido pro resto. |
| 05 | **Tradução PT-BR via MyMemory** (free) com chunking 500 chars + cache 24h | Qualidade ~80% do DeepL pago. Aceitável pro contexto de catálogo. |

Detalhes completos com problema → solução → tradeoff em **[/sobre](https://mangaverse-zeta.vercel.app/sobre)**.

---

## 🎨 Identidade visual

Inspirada nas **cores abstratas de Otomo Katsuhiro** (AKIRA, 1982).

| Token | Hex | Uso |
|---|---|---|
| `--akira-red` | `#c1121f` | Vermelho Kaneda/estrada |
| `--akira-cyan` | `#00d4e4` | Céu Neo-Tokyo |
| `--akira-pink` | `#ff5a8d` | Personagem |
| `--akira-yellow` | `#ffc949` | Avisos/alertas |
| `--akira-violet` | `#8b5cf6` | Tetsuo/poder |
| `--akira-green` | `#00c896` | Moto Tetsuo |
| `--ink` | `#f3e9d6` | Papel envelhecido |
| `--bg` | `#0e0a0a` | Background warm |

Padrões signature: **halftone dots** · **CRT scanlines** · **bike-streak** animado · **onomatopeias** rotacionadas com `shadow-hard` · **panel-frame** estilo painel de mangá.

---

## 🗺 Roadmap

- [ ] **Backend real** — Postgres (Neon) + migration Prisma
- [ ] **Gateway de pagamento** — Stripe BR / Mercado Pago
- [ ] **Testes E2E** — Playwright cobrindo o fluxo compra
- [ ] **App nativo** — Capacitor (portar do projeto Ritmo)
- [ ] **Recomendação IA** — embeddings + cosine similarity nas sinopses

---

## 👤 Author

**Lucas Vilela** · 18 anos · Barueri/SP · dev fullstack

- GitHub: [@lukvilela](https://github.com/lukvilela) · [@lukasvilela](https://github.com/lukasvilela)
- LinkedIn: [/in/lukasvilela](https://linkedin.com/in/lukasvilela)

> _"Aprende fazendo. Esta loja é um exemplo."_

---

## 📄 License

MIT © Lucas Vilela

<sub>Built with ♥ and 暴力 (violence) · Neo-Tokyo · 2026</sub>
