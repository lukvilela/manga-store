import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { VolumeCard } from "@/components/VolumeCard";

export const dynamic = "force-dynamic";

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const series = query
    ? await prisma.mangaSeries.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: query } },
            { author: { contains: query } },
            { genre: { contains: query } },
            { publisher: { contains: query } },
          ],
        },
        include: {
          volumes: { where: { isActive: true }, orderBy: { number: "asc" } },
        },
        orderBy: { title: "asc" },
      })
    : await prisma.mangaSeries.findMany({
        where: { isActive: true },
        include: {
          volumes: { where: { isActive: true }, orderBy: { number: "asc" } },
        },
        orderBy: { title: "asc" },
      });

  return (
    <main className="min-h-screen bg-[#f3f4f6]">
      {/* Header */}
      <div className="bg-[#111827] px-4 py-5 md:px-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-black uppercase tracking-wide text-white">
            {query ? `Resultados para "${query}"` : "Catalogo completo"}
          </h1>
          {series.length > 0 && (
            <p className="mt-1 text-sm text-white/60">
              {series.length} serie{series.length !== 1 ? "s" : ""} ·{" "}
              {series.reduce((s, r) => s + r.volumes.length, 0)} volumes
            </p>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="border-b border-gray-200 bg-white px-4 py-4 md:px-6">
        <div className="mx-auto max-w-7xl">
          <form method="get" className="flex gap-2">
            <input
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Buscar mangas, autores, editoras ou generos..."
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-gray-400"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {series.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            Nenhuma serie encontrada para &ldquo;{query}&rdquo;.
          </div>
        ) : (
          <div className="space-y-8">
            {series.map((serie) => (
              <section key={serie.slug} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                <div className="mb-4 flex flex-col gap-2 border-b border-gray-100 pb-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                      {serie.genre}
                      {serie.publisher && ` · ${serie.publisher}`}
                      {serie.author && ` · ${serie.author}`}
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-gray-900">{serie.title}</h2>
                    <p className="text-sm text-gray-500">{serie.volumes.length} volumes</p>
                  </div>
                  <Link
                    href={`/serie/${serie.slug}`}
                    className="rounded-full bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200"
                  >
                    Ver serie completa
                  </Link>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-1 scroll-row">
                  {serie.volumes.map((vol) => (
                    <VolumeCard
                      key={vol.id}
                      volumeId={vol.id}
                      seriesSlug={serie.slug}
                      seriesTitle={serie.title}
                      volumeNumber={vol.number}
                      price={Number(vol.price)}
                      coverImage={vol.coverImage ?? `/covers/${serie.slug}-vol-${vol.number}.svg`}
                      showSeries={false}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
