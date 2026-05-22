import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SeriesRow } from "@/components/SeriesRow";
import { MaisVendidosRow } from "@/components/MaisVendidosRow";

export const dynamic = "force-dynamic";

export default async function Home() {
  const allSeries = await prisma.mangaSeries.findMany({
    where: { isActive: true },
    include: {
      volumes: {
        where: { isActive: true },
        orderBy: { number: "asc" },
      },
    },
    orderBy: { title: "asc" },
  });

  const series = allSeries.filter((s) => s.volumes.length > 0);
  const totalVolumes = series.reduce((s, r) => s + r.volumes.length, 0);

  const maisVendidos = series
    .map((s) => (s.volumes[0] ? { serie: s, volume: s.volumes[0] } : null))
    .filter(Boolean) as {
    serie: (typeof series)[0];
    volume: (typeof series)[0]["volumes"][0];
  }[];

  return (
    <>
      {/* ── HERO ── */}
      <section className="bg-[#dc2626]">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-20">

            {/* Texto principal */}
            <div className="flex-1">
              <span className="inline-block rounded-full border border-white/25 bg-white/10 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-white/70 mb-5">
                Loja para Colecionadores
              </span>
              <h1 className="text-5xl font-black uppercase tracking-tight text-white md:text-7xl">
                Akira<br />
                <span className="text-white/90">Mangas</span>
              </h1>
              <p className="mt-5 max-w-sm text-base text-white/65 leading-relaxed">
                Coleções completas com capas reais por volume. O catálogo definitivo para colecionadores de mangá.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#colecoes"
                  className="rounded-full bg-white px-7 py-3 text-sm font-black uppercase tracking-widest text-[#dc2626] hover:bg-red-50 shadow"
                >
                  Ver Coleções
                </Link>
                <Link
                  href="/busca"
                  className="rounded-full border border-white/30 px-7 py-3 text-sm font-bold uppercase tracking-widest text-white hover:bg-white/15"
                >
                  Catálogo
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 lg:w-64 lg:flex-shrink-0">
              {[
                { n: String(series.length), label: "Séries" },
                { n: `${totalVolumes}+`, label: "Volumes" },
                { n: "100%", label: "Capas reais" },
                { n: "Grátis", label: "Frete acima R$150" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-white/15 bg-white/10 p-4"
                >
                  <span className="block text-2xl font-black text-white">{s.n}</span>
                  <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-wider text-white/55">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIS VENDIDOS ── */}
      <section className="bg-white px-4 py-10 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#dc2626] mb-1">
                Destaques
              </p>
              <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">
                Mais Vendidos
              </h2>
            </div>
            <Link
              href="/busca"
              className="flex-shrink-0 rounded-full border border-[#dc2626] px-5 py-2 text-xs font-bold uppercase tracking-widest text-[#dc2626] hover:bg-[#dc2626] hover:text-white"
            >
              Ver tudo
            </Link>
          </div>
          <MaisVendidosRow
            items={maisVendidos.map((m) => ({
              volumeId: m.volume.id,
              seriesSlug: m.serie.slug,
              seriesTitle: m.serie.title,
              volumeNumber: m.volume.number,
              price: Number(m.volume.price.toString()),
              coverImage:
                m.volume.coverImage ??
                `/covers/${m.serie.slug}-vol-${m.volume.number}.svg`,
            }))}
          />
        </div>
      </section>

      {/* ── BANNER COLEÇÕES ── */}
      <section id="colecoes" className="bg-[#111827] px-4 py-4 md:px-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-4">
            <h2 className="text-xl font-black uppercase tracking-tight text-white">
              Nossas Coleções
            </h2>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
              {series.length} séries · {totalVolumes} volumes
            </span>
          </div>
          <Link
            href="/busca"
            className="flex-shrink-0 rounded-full border border-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white/60 hover:bg-white/10 hover:text-white"
          >
            Ver catálogo
          </Link>
        </div>
      </section>

      {/* ── FILEIRAS POR SÉRIE ── */}
      <div>
        {series.map((serie) => (
          <SeriesRow key={serie.slug} serie={serie} />
        ))}
      </div>

      {/* ── RODAPÉ ── */}
      <footer className="bg-[#111827] px-4 py-10 md:px-6">
        <div className="mx-auto max-w-7xl flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dc2626] text-[10px] font-black uppercase tracking-widest text-white">
              AK
            </div>
            <span className="text-sm font-black uppercase tracking-widest text-white">Akira Mangas</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/30">
            © {new Date().getFullYear()} · Loja para Colecionadores
          </p>
        </div>
      </footer>
    </>
  );
}
