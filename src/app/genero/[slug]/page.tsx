import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import MangaGrid from "@/components/MangaGrid";
import { getMangaByGenre, toCardData } from "@/lib/manga-api";
import { getGenreBySlug, allGenres } from "@/lib/genre-map";

export const revalidate = 3600;

export async function generateStaticParams() {
  return allGenres().map((g) => ({ slug: g.slug }));
}

const ZONE_CLASS: Record<string, string> = {
  red: "bg-zone-red",
  cyan: "bg-zone-cyan",
  violet: "bg-zone-violet",
  yellow: "bg-zone-yellow",
  pink: "bg-zone-pink",
  warm: "bg-zone-warm",
  green: "bg-zone-green",
};

const ACCENT_TEXT: Record<string, string> = {
  red: "text-akira-red glow-red",
  cyan: "text-akira-cyan glow-cyan",
  violet: "text-akira-violet",
  yellow: "text-akira-yellow glow-yellow",
  pink: "text-akira-pink glow-pink",
  green: "text-akira-green",
};

const ACCENT_BORDER: Record<string, string> = {
  red: "border-akira-red",
  cyan: "border-akira-cyan",
  violet: "border-akira-violet",
  yellow: "border-akira-yellow",
  pink: "border-akira-pink",
  green: "border-akira-green",
};

const ACCENT_BG_DOT: Record<string, string> = {
  red: "bg-akira-red shadow-[0_0_12px_var(--akira-red)]",
  cyan: "bg-akira-cyan shadow-[0_0_12px_var(--akira-cyan)]",
  violet: "bg-akira-violet",
  yellow: "bg-akira-yellow shadow-[0_0_12px_var(--akira-yellow)]",
  pink: "bg-akira-pink shadow-[0_0_12px_var(--akira-pink)]",
  green: "bg-akira-green",
};

type Params = { slug: string };

export default async function GeneroPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const genre = getGenreBySlug(slug);
  if (!genre) notFound();

  const mangas = await getMangaByGenre(genre.id, 25);
  const cards = mangas.map(toCardData);
  const otherGenres = allGenres().filter((g) => g.slug !== genre.slug);

  const zoneCls = ZONE_CLASS[genre.zone] ?? "bg-zone-warm";
  const accentTxt = ACCENT_TEXT[genre.accent] ?? "text-akira-red glow-red";
  const accentBorder = ACCENT_BORDER[genre.accent] ?? "border-akira-red";
  const accentDot = ACCENT_BG_DOT[genre.accent] ?? "bg-akira-red";

  return (
    <>
      <Header />

      {/* HERO */}
      <section className={`relative overflow-hidden border-b border-[var(--line)] ${zoneCls}`}>
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden
        >
          <span
            className={`jp opacity-[0.07] font-black leading-none ${accentTxt}`}
            style={{ fontSize: "clamp(20rem, 48vw, 55rem)" }}
          >
            {genre.jp.slice(0, 2)}
          </span>
        </div>
        <div className="absolute inset-0 halftone-lg opacity-30 pointer-events-none" aria-hidden />
        <div className="bike-streak" style={{ top: "30%" }} />
        <div className="bike-streak" style={{ top: "70%", animationDelay: "2.5s" }} />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
          <nav className="flex items-center gap-2 mb-6 text-xs font-mono uppercase tracking-widest text-ink-muted">
            <Link href="/" className="hover:text-akira-cyan transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/busca" className="hover:text-akira-cyan transition-colors">Catalogo</Link>
            <span>/</span>
            <span className="text-ink">Genero</span>
          </nav>

          <div className="flex items-center gap-3 mb-6">
            <span className={`pulse-neon w-2 h-2 rounded-full ${accentDot}`} />
            <span className={`eyebrow ${accentTxt}`}>GENERO / {genre.jp}</span>
          </div>

          <div className="mb-3">
            <span className={`jp text-3xl md:text-5xl font-black ${accentTxt}`}>{genre.jp}</span>
          </div>

          <h1 className="display text-[clamp(3rem,11vw,9rem)] leading-[0.85]">
            <span className="block">{genre.name.toUpperCase()}</span>
            <span className={`block action-lines pl-2 ${accentTxt}`}>.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg md:text-xl text-ink-soft leading-relaxed">
            <span className={accentTxt}>{genre.tagline}</span>. {genre.nameEn} aglomera{" "}
            <span className="text-akira-yellow">{genre.count}</span> indexadas no Jikan — abaixo, os
            best-rated da categoria.
          </p>

          {/* Stats bar */}
          <div className={`mt-12 pt-6 border-t-2 ${accentBorder} grid grid-cols-2 md:grid-cols-4 gap-4`}>
            <Stat jp="種類" label="Genero" value={genre.name} sub={genre.nameEn} accent={genre.accent} />
            <Stat jp="件数" label="No catalogo" value={genre.count.split(" ")[0]} sub="series indexadas" accent="cyan" />
            <Stat jp="読者層" label="Publico tipico" value={`${genre.demographics.length}`} sub={genre.demographics.join(" · ")} accent="yellow" />
            <Stat jp="表示" label="Mostrando" value={`${cards.length}`} sub="top-rated agora" accent="pink" />
          </div>
        </div>
      </section>

      {/* DID YOU KNOW */}
      <section className="bg-[var(--bg-2)] border-b border-[var(--line)] py-10 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 halftone opacity-10 pointer-events-none" aria-hidden />
        <div className="relative max-w-5xl mx-auto flex items-start gap-5 md:gap-8">
          <div className="hidden md:block shrink-0">
            <span className={`jp text-6xl font-black ${accentTxt}`}>知</span>
          </div>
          <div className="flex-1">
            <p className={`eyebrow mb-2 ${accentTxt}`}>Voce sabia? / 豆知識</p>
            <p className="text-base md:text-lg text-ink leading-relaxed">{genre.fact}</p>
          </div>
        </div>
      </section>

      {/* GRID */}
      <main className="bg-zone-warm py-12 md:py-20 px-4 md:px-8 border-b border-[var(--line)] relative overflow-hidden">
        <div className="absolute inset-0 halftone opacity-20 pointer-events-none" aria-hidden />

        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <p className={`eyebrow mb-2 ${accentTxt}`}>Top {genre.nameEn}</p>
              <h2 className="display text-3xl md:text-5xl text-ink">BEST RATED</h2>
            </div>
            <div className="text-right">
              <p className={`display text-4xl ${accentTxt}`}>{cards.length}</p>
              <p className="eyebrow text-ink-muted">obras</p>
            </div>
          </div>

          <MangaGrid mangas={cards} emptyText={`Nenhum manga de ${genre.name} encontrado.`} />
        </div>
      </main>

      {/* OUTROS GENEROS */}
      <section className="bg-[var(--bg-2)] border-b border-[var(--line)] py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="block w-1.5 h-8 bg-akira-cyan shadow-[3px_3px_0_var(--ink)]" />
            <p className="eyebrow text-akira-cyan glow-cyan">Explore outros / 他の種類</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {otherGenres.map((g) => (
              <Link
                key={g.slug}
                href={`/genero/${g.slug}`}
                className={`px-4 py-3 border-2 ${ACCENT_BORDER[g.accent]} ${ACCENT_TEXT[g.accent]} font-mono text-xs uppercase tracking-widest hover:bg-[var(--bg-3)] transition-all flex items-center gap-2`}
              >
                <span className="jp text-sm font-bold">{g.jp}</span>
                <span>{g.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className={`border-t-2 ${accentBorder} py-8 px-4 md:px-8`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-3 text-xs font-mono text-ink-muted uppercase tracking-widest">
          <p>© 2026 · MangaVerse · {genre.nameEn} curado</p>
          <p><span className={accentTxt}>{genre.jp}</span> Genre Spotlight</p>
        </div>
      </footer>
    </>
  );
}

function Stat({ jp, label, value, sub, accent }: { jp: string; label: string; value: string; sub: string; accent: string }) {
  const colorClass = ACCENT_TEXT[accent] ?? "text-akira-red glow-red";
  return (
    <div>
      <div className="eyebrow mb-1 flex items-center gap-2">
        <span className={`jp text-base ${colorClass}`}>{jp}</span>
        <span>·</span>
        <span>{label}</span>
      </div>
      <div className="display text-2xl md:text-3xl text-ink">{value}</div>
      <div className="text-xs text-ink-muted mt-1 font-mono">{sub}</div>
    </div>
  );
}
