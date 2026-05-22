import Header from "@/components/Header";
import SearchHero from "@/components/SearchHero";
import GenreFilters from "@/components/GenreFilters";
import MangaGrid from "@/components/MangaGrid";
import { searchManga, getMangaByGenre, getTopManga, toCardData } from "@/lib/manga-api";

export const revalidate = 300;

type SP = { q?: string; genre?: string };

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const { q, genre } = await searchParams;
  const query = q?.trim() ?? "";
  const genreId = genre ? parseInt(genre) : null;

  let mangas;
  if (query) {
    mangas = await searchManga(query, 25);
  } else if (genreId !== null && !isNaN(genreId)) {
    mangas = await getMangaByGenre(genreId, 25);
  } else {
    mangas = await getTopManga(25, "manga");
  }

  const cards = mangas.map(toCardData);

  return (
    <>
      <Header />
      <SearchHero initialQuery={query} resultsCount={cards.length} />

      <main className="bg-zone-warm py-12 md:py-20 px-4 md:px-8 border-b border-[var(--line)] relative overflow-hidden">
        <div className="absolute inset-0 halftone opacity-20 pointer-events-none" aria-hidden />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          <aside className="md:col-span-3">
            <div className="md:sticky md:top-24">
              <GenreFilters />
            </div>
          </aside>

          <section className="md:col-span-9">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <p className="eyebrow text-akira-yellow glow-yellow mb-2">
                  {query ? "Search Results" : genreId ? "Filtered" : "Top Catalog"}
                </p>
                <h2 className="display text-3xl md:text-5xl text-ink">
                  {query ? `"${query}"` : genreId ? "Genero selecionado" : "Top Mangas"}
                </h2>
              </div>
              <div className="text-right">
                <p className="display text-4xl text-akira-red glow-red">{cards.length}</p>
                <p className="eyebrow text-ink-muted">resultados</p>
              </div>
            </div>

            <MangaGrid mangas={cards} />

            {cards.length > 0 && cards.length === 25 && (
              <div className="mt-12 text-center">
                <p className="eyebrow text-ink-muted">
                  Mostrando os 25 mais relevantes. Refine sua busca pra mais resultados.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="border-t-2 border-akira-red py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-3 text-xs font-mono text-ink-muted uppercase tracking-widest">
          <p>© 2026 · MangaVerse · Powered by Jikan API</p>
          <p>
            <span className="text-akira-red">DOKI!</span> Made in Brasil
          </p>
        </div>
      </footer>
    </>
  );
}
