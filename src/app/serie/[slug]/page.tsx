import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { VolumeCard } from "@/components/VolumeCard";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function SeriePage({ params }: Props) {
  const { slug } = await params;

  const serie = await prisma.mangaSeries.findUnique({
    where: { slug },
    include: {
      volumes: {
        where: { isActive: true },
        orderBy: { number: "asc" },
      },
    },
  });

  if (!serie) notFound();

  const theme = serie.themeColor ?? "#1f2937";
  const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const prices = serie.volumes.map((v) => Number(v.price.toString()));
  const minPrice = prices.length ? Math.min(...prices) : 0;

  return (
    <>
      {/* Header da série */}
      <section style={{ backgroundColor: theme }} className="px-4 py-10 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/60">
                {serie.genre} &middot; {serie.publisher}
              </p>
              <h1 className="text-4xl font-black uppercase leading-none tracking-tight text-white md:text-5xl">
                {serie.title}
              </h1>
              <p className="mt-2 text-sm text-white/70">{serie.author}</p>
              {serie.description && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80">
                  {serie.description}
                </p>
              )}
              <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-white/50">
                {serie.volumes.length} volumes nesta fileira
                {minPrice > 0 && (
                  <span className="ml-2">&middot; a partir de {fmt.format(minPrice)}</span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/"
                className="rounded-full border border-white/25 bg-black/30 px-4 py-2 text-sm font-semibold text-white hover:bg-black/50"
              >
                Voltar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de volumes */}
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {serie.volumes.map((vol) => (
            <VolumeCard
              key={vol.id}
              volumeId={vol.id}
              seriesTitle={serie.title}
              seriesSlug={serie.slug}
              volumeNumber={vol.number}
              price={Number(vol.price.toString())}
              coverImage={vol.coverImage ?? `/covers/${serie.slug}-vol-${vol.number}.svg`}
              showSeries={false}
            />
          ))}
        </div>
      </main>
    </>
  );
}
