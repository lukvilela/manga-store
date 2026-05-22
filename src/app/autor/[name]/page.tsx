import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import MangaGrid from "@/components/MangaGrid";
import { getMangasByAuthorName, toCardData } from "@/lib/manga-api";

export const revalidate = 3600;

type Params = { name: string };

/**
 * Limpa o "about" do Jikan (vem em texto bruto, as vezes com markdown leve).
 * Trunca em ~600 chars pra hero.
 */
function cleanAbout(about: string | null): string {
  if (!about) return "";
  const cleaned = about
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
  return cleaned.length > 600 ? cleaned.slice(0, 600).trimEnd() + "..." : cleaned;
}

export default async function AutorPage({ params }: { params: Promise<Params> }) {
  const { name: rawName } = await params;
  // Aceita 3 separadores: hifen, plus, %20/espaco
  const decoded = decodeURIComponent(rawName).replace(/[-+]/g, " ").trim();
  if (!decoded) notFound();

  const { author, mangas } = await getMangasByAuthorName(decoded, 24);
  if (!author) notFound();

  const cards = mangas.map(toCardData);
  const bio = cleanAbout(author.about);

  // Heuristica: melhor scored / melhor ranked
  const topRated = [...cards].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0] ?? null;
  const fanFav = [...cards].sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity))[0] ?? null;

  return (
    <>
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[var(--line)] bg-zone-violet">
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden
        >
          <span
            className="jp text-akira-violet opacity-[0.08] font-black leading-none"
            style={{ fontSize: "clamp(18rem, 40vw, 48rem)" }}
          >
            作者
          </span>
        </div>
        <div className="absolute inset-0 halftone-lg opacity-30 pointer-events-none" aria-hidden />
        <div className="bike-streak" style={{ top: "40%" }} />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <nav className="flex items-center gap-2 mb-6 text-xs font-mono uppercase tracking-widest text-ink-muted">
            <Link href="/" className="hover:text-akira-cyan transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/busca" className="hover:text-akira-cyan transition-colors">Catalogo</Link>
            <span>/</span>
            <span className="text-ink">Autor</span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            {/* Foto */}
            <div className="md:col-span-3">
              <div className="relative aspect-[3/4] border-2 border-ink shadow-hard-lg overflow-hidden bg-[var(--bg-2)]">
                {author.image ? (
                  <Image
                    src={author.image}
                    alt={author.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="jp text-akira-violet text-9xl font-black opacity-50">作</span>
                  </div>
                )}
                {/* Decorative corner */}
                <div className="absolute top-2 left-2 px-2 py-1 bg-akira-violet text-ink text-[10px] font-mono font-bold uppercase tracking-widest shadow-hard">
                  MANGAKA
                </div>
              </div>

              <div className="mt-4 border-2 border-[var(--line)] p-3 bg-[var(--bg-2)]">
                <p className="eyebrow text-akira-cyan glow-cyan mb-1">MAL ID</p>
                <p className="font-mono text-sm text-ink numerals">#{author.mal_id}</p>
                <p className="eyebrow text-ink-muted mt-3 mb-1">Obras catalogadas</p>
                <p className="font-mono text-sm text-ink numerals">{cards.length}</p>
              </div>
            </div>

            {/* Bio */}
            <div className="md:col-span-9">
              <div className="flex items-center gap-3 mb-6">
                <span className="pulse-neon w-2 h-2 rounded-full bg-akira-violet" />
                <span className="eyebrow text-akira-violet">AUTOR / MANGAKA · 作者</span>
              </div>

              <h1 className="display text-[clamp(2.5rem,8vw,6rem)] leading-[0.9] text-ink">
                {author.name}
              </h1>

              <div className="mt-4 flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-ink-muted">
                <span className="text-akira-yellow">{cards.length} obra{cards.length === 1 ? "" : "s"}</span>
                {topRated?.score && (
                  <>
                    <span>·</span>
                    <span>melhor score: <span className="text-akira-cyan">★ {topRated.score.toFixed(2)}</span></span>
                  </>
                )}
              </div>

              {bio && (
                <p className="mt-8 text-base md:text-lg text-ink-soft leading-relaxed max-w-3xl whitespace-pre-line">
                  {bio}
                </p>
              )}

              {!bio && (
                <p className="mt-8 text-base text-ink-muted font-mono italic max-w-3xl">
                  Bio nao disponivel no MyAnimeList. Mas a obra fala por si — confira abaixo.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS — obra mais aclamada + fan favorito */}
      {(topRated || fanFav) && (
        <section className="bg-[var(--bg-2)] border-b border-[var(--line)] py-10 md:py-14 px-4 md:px-8 relative overflow-hidden">
          <div className="absolute inset-0 halftone opacity-15 pointer-events-none" aria-hidden />
          <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {topRated && (
              <Highlight
                manga={topRated}
                badge="OBRA MAIS ACLAMADA"
                badgeJp="最高評価"
                badgeColor="cyan"
                metric={`★ ${topRated.score?.toFixed(2) ?? "—"}`}
              />
            )}
            {fanFav && fanFav.id !== topRated?.id && (
              <Highlight
                manga={fanFav}
                badge="FAN FAVORITO"
                badgeJp="人気No.1"
                badgeColor="pink"
                metric={fanFav.rank ? `#${fanFav.rank}` : "—"}
              />
            )}
          </div>
        </section>
      )}

      {/* GRID */}
      <main className="bg-zone-warm py-12 md:py-20 px-4 md:px-8 border-b border-[var(--line)] relative overflow-hidden">
        <div className="absolute inset-0 halftone opacity-20 pointer-events-none" aria-hidden />

        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <p className="eyebrow text-akira-violet mb-2">Bibliografia / 作品一覧</p>
              <h2 className="display text-3xl md:text-5xl text-ink">TODAS AS OBRAS</h2>
            </div>
            <div className="text-right">
              <p className="display text-4xl text-akira-violet">{cards.length}</p>
              <p className="eyebrow text-ink-muted">titulos</p>
            </div>
          </div>

          <MangaGrid mangas={cards} emptyText="Nenhuma obra encontrada pra este autor." />
        </div>
      </main>

      <footer className="border-t-2 border-akira-violet py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-3 text-xs font-mono text-ink-muted uppercase tracking-widest">
          <p>© 2026 · Akira Mangás · Bio via MyAnimeList</p>
          <p><span className="text-akira-violet">作</span> Author Spotlight</p>
        </div>
      </footer>
    </>
  );
}

function Highlight({
  manga,
  badge,
  badgeJp,
  badgeColor,
  metric,
}: {
  manga: ReturnType<typeof toCardData>;
  badge: string;
  badgeJp: string;
  badgeColor: "cyan" | "pink";
  metric: string;
}) {
  const badgeBg = badgeColor === "cyan" ? "bg-akira-cyan text-bg" : "bg-akira-pink text-bg";
  const badgeTxt = badgeColor === "cyan" ? "text-akira-cyan glow-cyan" : "text-akira-pink glow-pink";

  return (
    <Link
      href={`/manga/${manga.id}`}
      className="group relative flex items-stretch gap-4 border-2 border-ink bg-[var(--bg)] shadow-hard hover:shadow-hard-lg transition-all card-lift"
    >
      <div className="relative w-32 md:w-40 shrink-0 overflow-hidden border-r-2 border-ink">
        {manga.cover && (
          <Image
            src={manga.cover}
            alt={manga.title}
            fill
            sizes="160px"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            unoptimized
          />
        )}
      </div>
      <div className="flex-1 p-4 md:p-5 flex flex-col justify-between min-w-0">
        <div>
          <div className={`inline-flex items-center gap-2 px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-widest shadow-hard ${badgeBg}`}>
            <span className="jp text-sm">{badgeJp}</span>
            <span>{badge}</span>
          </div>
          <h3 className="display text-xl md:text-2xl text-ink mt-3 leading-tight line-clamp-2">{manga.title}</h3>
          {manga.titleJp && (
            <p className="jp text-sm text-ink-muted mt-1 line-clamp-1">{manga.titleJp}</p>
          )}
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-2">
          <p className={`display text-2xl ${badgeTxt}`}>{metric}</p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-ink-muted truncate">
            {manga.genres.slice(0, 2).join(" · ")}
          </p>
        </div>
      </div>
    </Link>
  );
}
