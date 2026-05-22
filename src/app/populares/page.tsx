import Link from "next/link";
import Header from "@/components/Header";
import MangaGrid from "@/components/MangaGrid";
import { getTopMangaPaged, toCardData } from "@/lib/manga-api";

export const revalidate = 3600;

type SP = { page?: string };

const DEMOGRAPHIC_LINKS = [
  { id: 27, name: "Shounen", jp: "少年" },
  { id: 42, name: "Seinen",  jp: "青年" },
  { id: 25, name: "Shoujo",  jp: "少女" },
  { id: 43, name: "Josei",   jp: "女性" },
];

export default async function PopularesPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const { page: pageStr } = await searchParams;
  const rawPage = pageStr ? parseInt(pageStr, 10) : 1;
  const page = Math.min(Math.max(isNaN(rawPage) ? 1 : rawPage, 1), 3);

  const { data, hasNext, lastPage } = await getTopMangaPaged(page, 25, "manga");
  const cards = data.map(toCardData);
  const totalPages = Math.min(lastPage, 3);
  const startRank = (page - 1) * 25 + 1;
  const endRank = startRank + cards.length - 1;

  return (
    <>
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[var(--line)] bg-zone-red">
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden
        >
          <span
            className="jp text-akira-red opacity-[0.07] font-black leading-none"
            style={{ fontSize: "clamp(18rem, 42vw, 50rem)" }}
          >
            人気
          </span>
        </div>
        <div className="absolute inset-0 halftone-lg opacity-30 pointer-events-none" aria-hidden />
        <div className="bike-streak" style={{ top: "25%" }} />
        <div className="bike-streak" style={{ top: "65%", animationDelay: "2.5s" }} />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
          <div className="flex items-center gap-3 mb-6">
            <span className="pulse-neon w-2 h-2 rounded-full bg-akira-red shadow-[0_0_12px_var(--akira-red)]" />
            <span className="eyebrow text-akira-cyan glow-cyan">RANKING / 人気作品</span>
            <span className="hidden md:inline eyebrow text-ink-muted">·</span>
            <span className="hidden md:inline eyebrow text-akira-yellow glow-yellow">CACHE 1H</span>
          </div>

          <div className="mb-3">
            <span className="jp text-akira-red text-3xl md:text-5xl font-black glow-red">人気漫画</span>
          </div>

          <h1 className="display text-[clamp(3rem,11vw,9rem)] leading-[0.85]">
            <span className="block">TOP</span>
            <span className="block text-akira-red glow-red action-lines pl-2">50.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg md:text-xl text-ink-soft leading-relaxed">
            Os mais aclamados de todos os tempos segundo{" "}
            <span className="text-akira-cyan glow-cyan">MyAnimeList</span>. Curadoria global,
            ordenacao por <span className="text-akira-yellow">rank oficial</span>. Berserk, One Piece,
            Vagabond, Vinland Saga e mais.
          </p>

          {/* Stats bar */}
          <div className="mt-12 pt-6 border-t-2 border-akira-red grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat jp="順位" label="Mostrando" value={`#${startRank}-${endRank}`} sub={`pagina ${page}/${totalPages}`} accent="red" />
            <Stat jp="件数" label="Total catalogo" value="50" sub="top historico" accent="cyan" />
            <Stat jp="平均" label="Score medio" value="8.7+" sub="acima da curva" accent="yellow" />
            <Stat jp="出版" label="Status" value="Mixed" sub="ongoing + finished" accent="pink" />
          </div>

          {/* Demographic shortcuts */}
          <div className="mt-10 flex flex-wrap items-center gap-2">
            <span className="eyebrow text-ink-muted mr-2">Filtrar por publico:</span>
            {DEMOGRAPHIC_LINKS.map((d) => (
              <Link
                key={d.id}
                href={`/busca?genre=${d.id}`}
                className="px-3 py-2 border-2 border-akira-cyan text-akira-cyan font-mono text-xs uppercase tracking-widest hover:bg-akira-cyan hover:text-bg transition-all flex items-center gap-2"
              >
                <span className="jp text-sm font-bold">{d.jp}</span>
                <span>{d.name}</span>
              </Link>
            ))}
          </div>

          {/* Onomatopeia */}
          <div className="absolute top-12 right-6 md:right-12">
            <span className="onomatopeia text-3xl md:text-5xl">DOKAN!</span>
          </div>
        </div>
      </section>

      {/* GRID */}
      <main className="bg-zone-warm py-12 md:py-20 px-4 md:px-8 border-b border-[var(--line)] relative overflow-hidden">
        <div className="absolute inset-0 halftone opacity-20 pointer-events-none" aria-hidden />

        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <p className="eyebrow text-akira-yellow glow-yellow mb-2">Pagina {page} / {totalPages}</p>
              <h2 className="display text-3xl md:text-5xl text-ink">RANK #{startRank} - #{endRank}</h2>
            </div>
            <div className="text-right">
              <p className="display text-4xl text-akira-red glow-red">{cards.length}</p>
              <p className="eyebrow text-ink-muted">obras</p>
            </div>
          </div>

          <MangaGrid mangas={cards} emptyText="Jikan API ficou em silencio. Tente outra pagina." />

          {/* Pagination */}
          <nav className="mt-16 flex items-center justify-center gap-3" aria-label="Paginacao">
            {page > 1 && (
              <Link
                href={`/populares?page=${page - 1}`}
                className="px-5 py-3 border-2 border-akira-cyan text-akira-cyan font-mono text-xs uppercase tracking-widest hover:bg-akira-cyan hover:text-bg transition-all"
              >
                ← Anterior
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/populares?page=${p}`}
                className={`w-12 h-12 flex items-center justify-center border-2 font-mono text-sm font-bold transition-all ${
                  p === page
                    ? "bg-akira-red border-akira-red text-ink shadow-hard"
                    : "border-[var(--line)] text-ink-soft hover:border-akira-red hover:text-akira-red"
                }`}
              >
                {p}
              </Link>
            ))}
            {hasNext && page < totalPages && (
              <Link
                href={`/populares?page=${page + 1}`}
                className="px-5 py-3 border-2 border-akira-red text-akira-red font-mono text-xs uppercase tracking-widest hover:bg-akira-red hover:text-ink transition-all"
              >
                Proxima →
              </Link>
            )}
          </nav>
        </div>
      </main>

      <footer className="border-t-2 border-akira-red py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-3 text-xs font-mono text-ink-muted uppercase tracking-widest">
          <p>© 2026 · Akira Mangás · Powered by Jikan API</p>
          <p><span className="text-akira-red">DOKAN!</span> Top 50 atualizado mensalmente</p>
        </div>
      </footer>
    </>
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
      <div className="display text-2xl md:text-3xl text-ink">{value}</div>
      <div className="text-xs text-ink-muted mt-1 font-mono">{sub}</div>
    </div>
  );
}
