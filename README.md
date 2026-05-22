# MANGAVERSE — Neo-Tokyo Manga Store

> A loja de mangás cyberpunk inspirada na estética de **AKIRA** (Otomo Katsuhiro, 1982).
> Catálogo curado de 55.000+ séries via MyAnimeList, capas reais por volume via MangaDex, navegação por gênero/demographic/autor, carrinho persistente, checkout multi-step.

![MangaVerse](https://img.shields.io/badge/MANGA-VERSE-c1121f?style=for-the-badge&labelColor=0a0a0d)
![Next.js](https://img.shields.io/badge/Next.js-16-000?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)

---

## 🎨 Identidade Visual — Akira

Inspirado nas **cores abstratas de Otomo Katsuhiro**:

| Cor | Hex | Uso |
|---|---|---|
| Akira Red | `#c1121f` | Vermelho icônico Kaneda/estrada |
| Cinema Red Glow | `#ff1f3f` | Brilho neon |
| Cyan Neon | `#00d4e4` | Céu Neo-Tokyo |
| Pink Magenta | `#ff5a8d` | Personagem |
| Yellow Alert | `#ffc949` | Avisos/alertas |
| Violet Plasma | `#7c3aed` | Tetsuo/poder |
| Green Bike | `#00c896` | Moto Tetsuo |
| Paper Cream | `#f3e9d6` | Texto principal (papel envelhecido) |
| Ink Black | `#0e0a0a` | Background warm |

**Tipografia:**
- **Bagel Fat One** (display chunky — vibe título de manga)
- **Plus Jakarta Sans** (body legível)
- **Noto Serif JP** (japonês — katakana/kanji decorativos)
- **JetBrains Mono** (labels técnicos, eyebrows)

**Padrões visuais signature:**
- 🌀 **Halftone dots** (assinatura Otomo print)
- 📺 **CRT scanlines** overlay full-page
- 🎬 **Bike trail** vermelho animado (referência cena moto Kaneda)
- 🎨 **Action lines** (linhas de velocidade)
- 💥 **Onomatopeias** (DOKI!, BAM!, KAPOW!) em hovers e backgrounds
- 🖼 **Shadow-hard** (sombras duras estilo painel manga)
- 🇯🇵 **Abstract color blocking** por zona/seção

---

## 🚀 Features

### 🏠 Home
- Hero com "アキラ" gigante no fundo
- 3 **MangaSpotlights** (mangás em destaque com bg cor própria)
- 5 carrosséis temáticos coloridos: Hall of Fame, Shounen, Seinen, Fantasy, Horror

### 🔍 Catálogo & Busca
- **Search global** no header (debounce 350ms, autocomplete live)
- Atalho `/` pra focar busca
- `/busca` com hero + filtros lateral por gênero/demographic
- `/populares` — Top 50 com paginação
- `/trending` — em alta (publishing + score ≥ 7)
- `/novidades` — recém-publicados
- `/genero/[slug]` — 10 gêneros pré-gerados (acao, romance, horror, sci-fi…)
- `/autor/[name]` — bibliografia completa + bio

### 📖 Detalhe do Manga
- Hero cinematográfico com capa GIGANTE + cor de fundo do mangá
- Stats dashboard: rank/順位, score/評価, popularity/人気度, status/状態
- Sinopse completa + background
- **Grid de volumes com capas REAIS via MangaDex API**
- Box set deal (-15% off)
- Carrossel de recomendações Jikan

### 🛒 Volume / Produto
- `/manga/[id]/volume/[number]` — página individual por volume
- Capa REAL do volume (MangaDex) com fallback colorido
- Quantity selector, "Adicionar ao carrinho", "Comprar agora"
- Ficha técnica: editora, ISBN, páginas, peso, dimensões
- Volumes adjacentes (Anterior/Próximo)

### 🛍 Carrinho
- Items com qty +/- via CartContext (persistido localStorage)
- Sidebar sticky: subtotal, frete, cupom (OTAKU10 -10%, BAKA -5%), total
- Progress bar frete grátis (R$150)
- Empty state Akira (空 vermelho gigante)
- Cards "Pra você começar"

### 💳 Checkout Multi-Step (4 passos)
1. Identificação (logged/guest)
2. Endereço (auto-fill ViaCEP)
3. Frete (PAC/SEDEX/Retirada) + Pagamento (PIX -5% / Cartão / Boleto -3%)
4. Confirmação com revisão
- Sidebar mini-resumo em todos os passos
- Página `/pedido/[id]` com confirmação + próximos passos

### 👤 Conta do Usuário
- `/conta` — dashboard com stats
- `/conta/pedidos` — histórico (lê sessionStorage)
- `/conta/estante` — Estante Virtual (Lendo/Tenho/Wishlist)
- `/conta/enderecos` — múltiplos endereços (max 5, ViaCEP)
- Hooks: `useEstante`, `useAddresses` (localStorage + custom events sync)

### 🎯 UX Profissional
- **Mini-cart** dropdown no header
- **Toast notifications** (success/info/error/warning)
- **404 Akira** com glitch effect CRT
- **Loading skeletons** estilo Akira
- **Footer** reutilizável 4 colunas
- Animações: `reveal`, `stagger`, `shimmer`, `bike-streak`, `glitch`, `pulse-neon`

---

## 🛠 Stack Técnica

| Layer | Tech |
|---|---|
| Framework | **Next.js 16** (App Router + Server Components + ISR) |
| Linguagem | **TypeScript 5** strict |
| Styling | **Tailwind CSS 4** (design tokens via `@theme inline`) |
| Fonts | next/font (Bagel Fat One, Plus Jakarta, Noto Serif JP, JetBrains Mono) |
| Auth | JWT (jose) + bcryptjs + cookies httpOnly |
| DB Local | SQLite + **Prisma 6** (rotas legadas) |
| APIs Externas | **Jikan API v4** (MyAnimeList) + **MangaDex API** |
| State Cliente | React Context (Auth, Cart, Toast) + localStorage |
| Deploy | Vercel-ready |

---

## 🌐 APIs Externas Integradas

### Jikan API v4 (MyAnimeList unofficial)
- Base: `https://api.jikan.moe/v4` — Rate: 3 req/s, sem auth — Cache: ISR 1h
- Funções em `src/lib/manga-api.ts`:
  - `getTopManga`, `getTopMangaPaged`, `getTrendingManga`, `getNovidadesManga`
  - `getMangaByGenre`, `getMangasByAuthorName`, `searchManga`
  - `getMangaById`, `getMangaRecommendations`

### MangaDex API
- Base: `https://api.mangadex.org` — Rate: 5 req/s, sem auth — Cache: ISR 24h
- Funções em `src/lib/mangadex-api.ts`:
  - `searchMangaMdx`, `getCoversByMangaId`
  - `getVolumeCoversByTitle`, `getVolumeCoverByTitleAndNumber`

---

## 📦 Setup Local

```bash
npm install
npx prisma generate
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## 🗺 Mapa de Rotas

| Categoria | Rota | Descrição |
|---|---|---|
| **Home** | `/` | Hero + spotlights + carrosséis temáticos |
| **Catálogo** | `/busca` | Catálogo com busca + filtros |
| | `/populares` | Top 50 paginado |
| | `/trending` | Em alta |
| | `/novidades` | Recém-lançados |
| | `/genero/[slug]` | Landing por gênero |
| | `/autor/[name]` | Bibliografia do autor |
| **Produto** | `/manga/[id]` | Detalhe da série |
| | `/manga/[id]/volume/[number]` | Volume individual |
| **Auth** | `/login`, `/cadastro` | Auth |
| **Carrinho** | `/carrinho` | Items + resumo |
| | `/checkout` | Multi-step |
| | `/pedido/[id]` | Confirmação |
| **Conta** | `/conta` | Dashboard |
| | `/conta/pedidos` | Histórico |
| | `/conta/estante` | Estante Virtual |
| | `/conta/enderecos` | Endereços |
| **API** | `/api/manga/search` | Search Jikan (autocomplete) |
| | `/api/manga/[id]/volumes` | Capas por volume (MangaDex) |

---

## 🎬 Inspirações

**Visual:** Katsuhiro Otomo (AKIRA), Crunchyroll, VIZ Media, Shueisha Manga Plus, painéis manga clássicos.

**UX:** Crunchyroll spotlights, Letterboxd (estante), MyAnimeList (tags), Amazon (multi-step checkout).

**Pesquisa visual de Akira:**
- [Abstract Colour in Otomo's Akira — Jake Hicks Photography](https://jakehicksphotography.com/latest-techniques/2020/5/28/colour-in-cinema-abstract-colour-in-katsuhiro-otomos-akira)
- [Colouring the Akira Comics — Steve Oliff / Olyoptics](http://www.akira2019.com/colouring-the-akira-manga.htm)

---

## 📌 Limites & Disclaimers

- **Comércio simulado**: sem gateway real. Checkout salva em `sessionStorage`.
- **Dados de mangá**: 100% via APIs públicas (Jikan/MangaDex). Capas e infos são propriedade dos respectivos editores.
- **Preços**: 100% mock (R$29,90 base com variação determinística).
- **Estoque**: simulado.

---

## 🔮 Roadmap

- [ ] Páginas autor com timeline visual
- [ ] Integração pagamento real (Stripe BR / Mercado Pago)
- [ ] Reviews estilo MAL com nota + comentário
- [ ] Sistema de gamificação (XP, badges, achievements)
- [ ] Mood-based discovery
- [ ] Loot box semanal
- [ ] Recomendação IA vetorial via embeddings
- [ ] PWA + push notifications
- [ ] Backend real (PostgreSQL + tRPC)

---

<p align="center">
  <strong>漫画ヴァース · MANGAVERSE</strong><br>
  <em>Built in Neo-Tokyo · Inspired by Otomo Katsuhiro · Powered by Jikan + MangaDex</em>
</p>
