type Props = {
  size?: "sm" | "md" | "lg";
};

const SIZES = {
  sm: { card: "w-[140px]", cover: "h-[200px]" },
  md: { card: "w-[180px]", cover: "h-[260px]" },
  lg: { card: "w-[220px]", cover: "h-[320px]" },
};

/**
 * Skeleton estilo Akira pra MangaCard.
 * Reusa pulse-neon do globals.css + halftone overlay.
 */
export default function MangaCardSkeleton({ size = "md" }: Props) {
  const dims = SIZES[size];

  return (
    <div
      className={`${dims.card} flex-shrink-0 flex flex-col gap-2 pulse-neon`}
      aria-hidden
      role="status"
      aria-label="Carregando manga"
    >
      {/* Capa */}
      <div
        className={`relative ${dims.cover} bg-bg-2 border-2 border-ink shadow-hard overflow-hidden`}
      >
        <div className="absolute inset-0 halftone opacity-40" />
        <div className="absolute inset-x-3 top-3 h-4 bg-bg-3" />
        <div className="absolute inset-x-3 top-9 h-3 w-2/3 bg-bg-3" />
        <div className="absolute bottom-3 right-3 w-10 h-6 bg-akira-red/30 border border-ink" />
        {/* Brilho rank fake */}
        <div className="absolute top-2 right-2 w-8 h-5 bg-akira-yellow/20 border border-akira-yellow/40" />
      </div>

      {/* Titulo */}
      <div className="h-4 bg-bg-2 w-3/4 rounded-sm" />
      <div className="h-3 bg-bg-2 w-1/2 rounded-sm" />

      {/* Score row */}
      <div className="flex items-center gap-2 mt-1">
        <div className="h-3 w-12 bg-akira-cyan/20 border border-akira-cyan/30" />
        <div className="h-3 w-8 bg-bg-2 rounded-sm" />
      </div>
    </div>
  );
}
