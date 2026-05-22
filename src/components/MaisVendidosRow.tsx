"use client";

import { useRef } from "react";
import { VolumeCard } from "./VolumeCard";

type Item = {
  volumeId: string;
  seriesSlug: string;
  seriesTitle: string;
  volumeNumber: number;
  price: number;
  coverImage: string;
};

export function MaisVendidosRow({ items }: { items: Item[] }) {
  const rowRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    rowRef.current?.scrollBy({ left: dir === "right" ? 700 : -700, behavior: "smooth" });
  }

  return (
    <div>
      <div className="mb-3 flex justify-end gap-2">
        <button onClick={() => scroll("left")} className="scroll-btn-dark" aria-label="anterior">&lt;</button>
        <button onClick={() => scroll("right")} className="scroll-btn-dark" aria-label="proximo">&gt;</button>
      </div>
      <div ref={rowRef} className="scroll-row">
        {items.map((item) => (
          <VolumeCard
            key={item.volumeId}
            volumeId={item.volumeId}
            seriesSlug={item.seriesSlug}
            seriesTitle={item.seriesTitle}
            volumeNumber={item.volumeNumber}
            price={item.price}
            coverImage={item.coverImage}
            showSeries
          />
        ))}
      </div>
    </div>
  );
}
