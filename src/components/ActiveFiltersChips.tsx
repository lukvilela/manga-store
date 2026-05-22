"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Filters = {
  q: string | null;
  genre: number | null;
  status: string | null;
  year_from: number | null;
  year_to: number | null;
  score_min: number | null;
  volumes_min: number | null;
  volumes_max: number | null;
  type: string | null;
  order_by: string | null;
  sort: string | null;
};

type Props = { filters: Filters };

const STATUS_LABEL: Record<string, string> = {
  publishing: "publicando",
  finished: "finalizado",
  hiatus: "hiatus",
};

const TYPE_LABEL: Record<string, string> = {
  manga: "Manga",
  manhwa: "Manhwa",
  manhua: "Manhua",
  novel: "Light Novel",
};

const ORDER_LABEL: Record<string, string> = {
  score: "score",
  popularity: "popularidade",
  favorites: "favoritos",
  start_date: "data de inicio",
  chapters: "capitulos",
};

// Pequena lista local pra label de genero (subset). Resto vira "genero #ID".
const GENRE_LABEL: Record<number, string> = {
  1: "Action",
  2: "Adventure",
  4: "Comedy",
  7: "Mystery",
  8: "Drama",
  10: "Fantasy",
  14: "Horror",
  15: "Kids",
  22: "Romance",
  24: "Sci-Fi",
  25: "Shoujo",
  27: "Shounen",
  36: "Slice of Life",
  42: "Seinen",
  43: "Josei",
};

type Chip = {
  key: string;
  label: string;
  color: "red" | "cyan" | "pink" | "yellow" | "violet" | "green";
  // Quais keys remover ao clicar no X (alguns chips agrupam 2 params)
  removeKeys: string[];
};

const CHIP_COLOR: Record<Chip["color"], string> = {
  red: "border-akira-red text-akira-red bg-akira-red/10 hover:bg-akira-red/20",
  cyan: "border-akira-cyan text-akira-cyan bg-akira-cyan/10 hover:bg-akira-cyan/20",
  pink: "border-akira-pink text-akira-pink bg-akira-pink/10 hover:bg-akira-pink/20",
  yellow: "border-akira-yellow text-akira-yellow bg-akira-yellow/10 hover:bg-akira-yellow/20",
  violet: "border-akira-violet text-akira-violet bg-akira-violet/10 hover:bg-akira-violet/20",
  green: "border-akira-green text-akira-green bg-akira-green/10 hover:bg-akira-green/20",
};

export default function ActiveFiltersChips({ filters }: Props) {
  const sp = useSearchParams();

  const chips: Chip[] = [];

  if (filters.q) {
    chips.push({
      key: "q",
      label: `"${filters.q}"`,
      color: "yellow",
      removeKeys: ["q"],
    });
  }
  if (filters.genre != null) {
    chips.push({
      key: "genre",
      label: GENRE_LABEL[filters.genre] ?? `genero #${filters.genre}`,
      color: "pink",
      removeKeys: ["genre"],
    });
  }
  if (filters.status) {
    chips.push({
      key: "status",
      label: STATUS_LABEL[filters.status] ?? filters.status,
      color: "cyan",
      removeKeys: ["status"],
    });
  }
  if (filters.year_from || filters.year_to) {
    const from = filters.year_from ?? "...";
    const to = filters.year_to ?? "...";
    chips.push({
      key: "year",
      label: `${from}—${to}`,
      color: "violet",
      removeKeys: ["year_from", "year_to"],
    });
  }
  if (filters.score_min) {
    chips.push({
      key: "score_min",
      label: `score >= ${filters.score_min}`,
      color: "red",
      removeKeys: ["score_min"],
    });
  }
  if (filters.volumes_min || filters.volumes_max) {
    const min = filters.volumes_min ?? "0";
    const max = filters.volumes_max ?? "∞";
    chips.push({
      key: "volumes",
      label: `${min}—${max} vols`,
      color: "green",
      removeKeys: ["volumes_min", "volumes_max"],
    });
  }
  if (filters.type) {
    chips.push({
      key: "type",
      label: TYPE_LABEL[filters.type] ?? filters.type,
      color: "yellow",
      removeKeys: ["type"],
    });
  }
  if (filters.order_by) {
    chips.push({
      key: "order_by",
      label: `ordem: ${ORDER_LABEL[filters.order_by] ?? filters.order_by}`,
      color: "cyan",
      removeKeys: ["order_by", "sort"],
    });
  }

  if (chips.length === 0) return null;

  const removeChip = (keysToRemove: string[]) => {
    const next = new URLSearchParams(sp.toString());
    keysToRemove.forEach((k) => next.delete(k));
    return `/busca?${next.toString()}`;
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="eyebrow text-ink-muted mr-1">Filtros:</span>
      {chips.map((c) => (
        <span
          key={c.key}
          className={`inline-flex items-center gap-2 px-3 py-1 border-2 font-mono text-xs uppercase tracking-widest ${CHIP_COLOR[c.color]}`}
        >
          <span>{c.label}</span>
          <Link
            href={removeChip(c.removeKeys)}
            className="hover:text-ink transition-colors"
            aria-label={`Remover filtro ${c.label}`}
          >
            ×
          </Link>
        </span>
      ))}
      <Link
        href="/busca"
        className="ml-2 px-3 py-1 border-2 border-[var(--line)] text-ink-muted hover:text-akira-red hover:border-akira-red font-mono text-xs uppercase tracking-widest transition-colors"
      >
        Limpar tudo
      </Link>
    </div>
  );
}
