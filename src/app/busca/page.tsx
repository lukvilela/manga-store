import Header from "@/components/Header";
import SearchHero from "@/components/SearchHero";
import GenreFilters from "@/components/GenreFilters";
import MangaGrid from "@/components/MangaGrid";
import ActiveFiltersChips from "@/components/ActiveFiltersChips";
import {
  searchMangaAdvanced,
  getTopManga,
  toCardData,
  type AdvancedFilters,
} from "@/lib/manga-api";

export const revalidate = 300;

type SP = {
  q?: string;
  genre?: string;
  status?: string;
  year_from?: string;
  year_to?: string;
  score_min?: string;
  volumes_min?: string;
  volumes_max?: string;
  type?: string;
  order_by?: string;
  sort?: string;
};

function parseIntOrNull(v?: string): number | null {
  if (!v) return null;
  const n = parseInt(v);
  return isNaN(n) ? null : n;
}

function parseFloatOrNull(v?: string): number | null {
  if (!v) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

const ALLOWED_STATUS = ["publishing", "finished", "hiatus"] as const;
const ALLOWED_TYPES = ["manga", "manhwa", "manhua", "novel"] as const;
const ALLOWED_ORDER = ["score", "popularity", "favorites", "start_date", "chapters"] as const;

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const query = sp.q?.trim() ?? "";

  const filters: AdvancedFilters = {
    q: query || undefined,
    genre: parseIntOrNull(sp.genre),
    status: (ALLOWED_STATUS as readonly string[]).includes(sp.status ?? "")
      ? (sp.status as AdvancedFilters["status"])
      : null,
    year_from: parseIntOrNull(sp.year_from),
    year_to: parseIntOrNull(sp.year_to),
    score_min: parseFloatOrNull(sp.score_min),
    volumes_min: parseIntOrNull(sp.volumes_min),
    volumes_max: parseIntOrNull(sp.volumes_max),
    type: (ALLOWED_TYPES as readonly string[]).includes(sp.type ?? "")
      ? (sp.type as AdvancedFilters["type"])
      : null,
    order_by: (ALLOWED_ORDER as readonly string[]).includes(sp.order_by ?? "")
      ? (sp.order_by as AdvancedFilters["order_by"])
      : null,
    sort: sp.sort === "asc" ? "asc" : sp.sort === "desc" ? "desc" : null,
    limit: 25,
  };

  // Conta filtros ativos (excluindo q vazio)
  const hasAnyFilter = !!(
    filters.q ||
    filters.genre != null ||
    filters.status ||
    filters.year_from ||
    filters.year_to ||
    filters.score_min ||
    filters.volumes_min ||
    filters.volumes_max ||
    filters.type ||
    filters.order_by
  );

  let mangas;
  if (hasAnyFilter) {
    mangas = await searchMangaAdvanced(filters);
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
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <p className="eyebrow text-akira-yellow glow-yellow mb-2">
                  {query
                    ? "Search Results"
                    : filters.genre
                      ? "Filtered"
                      : hasAnyFilter
                        ? "Filtered"
                        : "Top Catalog"}
                </p>
                <h2 className="display text-3xl md:text-5xl text-ink">
                  {query
                    ? `"${query}"`
                    : filters.genre
                      ? "Genero selecionado"
                      : hasAnyFilter
                        ? "Resultados"
                        : "Top Mangas"}
                </h2>
              </div>
              <div className="text-right">
                <p className="display text-4xl text-akira-red glow-red">{cards.length}</p>
                <p className="eyebrow text-ink-muted">resultados</p>
              </div>
            </div>

            {/* Chips de filtros ativos */}
            <ActiveFiltersChips
              filters={{
                q: filters.q ?? null,
                genre: filters.genre ?? null,
                status: filters.status ?? null,
                year_from: filters.year_from ?? null,
                year_to: filters.year_to ?? null,
                score_min: filters.score_min ?? null,
                volumes_min: filters.volumes_min ?? null,
                volumes_max: filters.volumes_max ?? null,
                type: filters.type ?? null,
                order_by: filters.order_by ?? null,
                sort: filters.sort ?? null,
              }}
            />

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
          <p>© 2026 · Akira Mangás · Powered by Jikan API</p>
          <p>
            <span className="text-akira-red">DOKI!</span> Made in Brasil
          </p>
        </div>
      </footer>
    </>
  );
}
