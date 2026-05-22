import MangaCard from "./MangaCard";
import type { MangaCardData } from "@/lib/manga-api";

type Props = {
  mangas: MangaCardData[];
  emptyText?: string;
};

export default function MangaGrid({ mangas, emptyText = "Nenhum manga encontrado." }: Props) {
  if (mangas.length === 0) {
    return (
      <div className="relative border-2 border-dashed border-[var(--line)] py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 halftone opacity-30" aria-hidden />
        <div className="relative">
          <p className="jp text-akira-red text-7xl font-black glow-red mb-4">空</p>
          <p className="display text-2xl text-ink mb-2">SEM RESULTADOS</p>
          <p className="text-sm text-ink-muted font-mono uppercase tracking-widest">{emptyText}</p>
          <p className="mt-6 text-xs font-mono text-ink-muted">
            Tente outro termo ou filtre por <span className="text-akira-yellow">genero</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-7 justify-items-center">
      {mangas.map((m) => (
        <MangaCard key={m.id} manga={m} size="md" />
      ))}
    </div>
  );
}
