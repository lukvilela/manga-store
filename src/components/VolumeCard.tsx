"use client";

import Image from "next/image";
import Link from "next/link";

type Props = {
  volumeId: string;
  seriesTitle: string;
  seriesSlug: string;
  volumeNumber: number;
  price: number;
  coverImage: string;
  showSeries?: boolean;
};

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function VolumeCard({
  volumeId,
  seriesTitle,
  volumeNumber,
  price,
  coverImage,
  showSeries = true,
}: Props) {
  const label = `${seriesTitle} Vol. ${String(volumeNumber).padStart(2, "0")}`;

  return (
    <Link
      href={`/volume/${volumeId}`}
      className="group flex w-[152px] flex-shrink-0 flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/10 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:ring-[#dc2626]/30"
    >
      {/* Cover */}
      <div className="relative overflow-hidden bg-gray-100" style={{ width: 152, height: 215 }}>
        <Image
          src={coverImage}
          alt={label}
          fill
          sizes="152px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
          unoptimized
        />
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <p className="line-clamp-2 text-[12.5px] font-bold leading-snug text-gray-900 group-hover:text-[#dc2626]">
          {label}
        </p>
        {showSeries && (
          <p className="mt-0.5 truncate text-[11px] text-gray-400">{seriesTitle}</p>
        )}
        <p className="mt-1.5 text-[13px] font-black text-[#dc2626]">{fmt.format(price)}</p>
      </div>
    </Link>
  );
}
