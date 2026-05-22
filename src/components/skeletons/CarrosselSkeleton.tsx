import MangaCardSkeleton from "./MangaCardSkeleton";

type Props = {
  count?: number;
  size?: "sm" | "md" | "lg";
  showHeader?: boolean;
};

/**
 * Skeleton dum MangaCarousel inteiro — header + row de cards.
 * Combina com MangaCardSkeleton pra manter consistencia visual.
 */
export default function CarrosselSkeleton({
  count = 8,
  size = "md",
  showHeader = true,
}: Props) {
  return (
    <section
      className="py-10 px-4 md:px-8 border-t border-[var(--line)] pulse-neon"
      aria-hidden
      role="status"
      aria-label="Carregando lista de mangas"
    >
      <div className="max-w-7xl mx-auto">
        {showHeader && (
          <div className="flex items-end justify-between mb-6 gap-4">
            <div className="flex flex-col gap-2">
              <div className="h-3 w-32 bg-akira-cyan/30 border border-akira-cyan/40" />
              <div className="h-7 w-56 bg-bg-2 border-2 border-ink shadow-hard" />
              <div className="h-4 w-24 bg-akira-yellow/30 mt-1" />
            </div>
            <div className="hidden md:flex gap-2">
              <div className="w-9 h-9 bg-bg-2 border border-ink" />
              <div className="w-9 h-9 bg-bg-2 border border-ink" />
            </div>
          </div>
        )}

        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: count }).map((_, i) => (
            <MangaCardSkeleton key={i} size={size} />
          ))}
        </div>
      </div>
    </section>
  );
}
