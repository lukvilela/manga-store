"use client";

import Link from "next/link";
import { useRef } from "react";
import { VolumeCard } from "./VolumeCard";

type Volume = {
  id: string;
  number: number;
  title: string | null;
  coverImage: string | null;
  price: { toString(): string };
};

type Serie = {
  slug: string;
  title: string;
  themeColor: string | null;
  volumes: Volume[];
};

export function SeriesRow({ serie }: { serie: Serie }) {
  const rowRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    rowRef.current?.scrollBy({ left: dir === "right" ? 700 : -700, behavior: "smooth" });
  }

  const theme = serie.themeColor ?? "#1f2937";

  return (
    <section style={{ backgroundColor: theme }} className="px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black uppercase tracking-wide text-white truncate">
              {serie.title}
            </h2>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/45 mt-0.5">
              {serie.volumes.length} volumes
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => scroll("left")} className="scroll-btn" aria-label="anterior">&#8249;</button>
            <button onClick={() => scroll("right")} className="scroll-btn" aria-label="proximo">&#8250;</button>
            <Link
              href={`/serie/${serie.slug}`}
              className="rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white/80 hover:bg-white/20 hover:text-white ml-1"
            >
              Ver tudo
            </Link>
          </div>
        </div>

        {/* Scroll row */}
        <div ref={rowRef} className="scroll-row">
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
      </div>
    </section>
  );
}
