import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AddToCartButton } from "@/components/AddToCartButton";
import { VolumeCard } from "@/components/VolumeCard";

export const dynamic = "force-dynamic";

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function VolumePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const volume = await prisma.volume.findUnique({
    where: { id },
    include: { series: true },
  });

  if (!volume || !volume.isActive) notFound();

  const outros = await prisma.volume.findMany({
    where: { seriesId: volume.seriesId, isActive: true, id: { not: id } },
    orderBy: { number: "asc" },
  });

  const coverImage =
    volume.coverImage ?? `/covers/${volume.series.slug}-vol-${volume.number}.svg`;

  return (
    <main className="bg-[#f3f4f6] min-h-screen">
      {/* Nav */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 md:px-6">
        <div className="mx-auto max-w-5xl flex gap-2">
          <Link
            href={`/serie/${volume.series.slug}`}
            className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Voltar
          </Link>
          <Link
            href={`/serie/${volume.series.slug}`}
            className="rounded-full bg-[#eab308] px-4 py-1.5 text-sm font-semibold text-black hover:bg-[#ca9a07]"
          >
            Colecao completa
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        {/* Volume detail */}
        <div className="grid gap-8 md:grid-cols-[380px_1fr]">
          {/* Capa */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5">
            <Image
              src={coverImage}
              alt={volume.title ?? `${volume.series.title} Vol. ${volume.number}`}
              width={600}
              height={820}
              className="h-auto w-full"
              unoptimized
              priority
            />
          </div>

          {/* Info */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <p className="text-sm text-gray-400">{volume.series.title}</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              {volume.title ?? `${volume.series.title} Vol. ${String(volume.number).padStart(2, "0")}`}
            </h1>

            {volume.description && (
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{volume.description}</p>
            )}

            <p className="mt-3 text-xs text-gray-400">Fontes: AniList + Jikan + MangaDex</p>
            <p className="text-xs text-gray-400">Capa real por volume quando disponivel.</p>

            <p className="mt-6 text-4xl font-bold text-gray-900">
              {fmt.format(Number(volume.price))}
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <AddToCartButton
                volumeId={volume.id}
                seriesSlug={volume.series.slug}
                seriesTitle={volume.series.title}
                volumeNumber={volume.number}
                price={Number(volume.price)}
                coverImage={coverImage}
                stock={volume.stock}
              />
              <Link
                href="/carrinho"
                className="block rounded-xl bg-[#dc2626] px-4 py-3 text-center text-sm font-black uppercase tracking-wider text-white hover:bg-[#b91c1c]"
              >
                Ir para o carrinho
              </Link>
            </div>
          </div>
        </div>

        {/* Outros volumes */}
        {outros.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-5 text-xl font-black uppercase tracking-wide text-gray-800">
              Outros volumes de {volume.series.title}
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scroll-row">
              {outros.map((v) => (
                <VolumeCard
                  key={v.id}
                  volumeId={v.id}
                  seriesTitle={volume.series.title}
                  seriesSlug={volume.series.slug}
                  volumeNumber={v.number}
                  price={Number(v.price.toString())}
                  coverImage={v.coverImage ?? `/covers/${volume.series.slug}-vol-${v.number}.svg`}
                  showSeries={false}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
