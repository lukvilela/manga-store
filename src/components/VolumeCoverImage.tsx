import Image from "next/image";
import { getMangaColor, getMangaColorAlpha } from "@/lib/manga-colors";

type Props = {
  /** URL ja resolvida da capa real (MangaDex). Se null/undefined, cai no fallback colorido. */
  coverUrl?: string | null;
  /** Titulo da serie — usado pro gradiente fallback determinstico. */
  seriesTitle: string;
  /** Numero do volume — exibido no fallback gigante. */
  volumeNumber: number;
  /** Tamanho do numero do fallback. Default md (7xl/8xl). */
  fallbackSize?: "sm" | "md" | "lg";
  /** Mostra badge "Capa oficial" quando coverUrl existe. Default true. */
  showOfficialBadge?: boolean;
  /** Atributo sizes do next/image. */
  sizes?: string;
  /** Prioridade pro LCP. */
  priority?: boolean;
};

/**
 * Renderiza a capa de UM volume com fallback graceful.
 *
 * Se temos `coverUrl` (MangaDex) -> next/image com badge "Capa oficial".
 * Senao -> gradiente determinstico + numero gigante (visual original do mock).
 *
 * Server component — sem state, so layout. Reusado em MangaVolumes,
 * RelatedVolumes e VolumeProductHero pra padronizar fallback.
 *
 * Importante: NAO renderiza container/borda/hover — fica por conta do parent
 * (pra preservar layout existente sem regressao).
 */
export default function VolumeCoverImage({
  coverUrl,
  seriesTitle,
  volumeNumber,
  fallbackSize = "md",
  showOfficialBadge = true,
  sizes = "(max-width: 768px) 50vw, 16vw",
  priority = false,
}: Props) {
  const color = getMangaColor(seriesTitle);
  const colorSoft = getMangaColorAlpha(seriesTitle, 0.6);
  const volStr = String(volumeNumber).padStart(2, "0");

  if (coverUrl) {
    return (
      <>
        <Image
          src={coverUrl}
          alt={`${seriesTitle} Volume ${volStr}`}
          fill
          sizes={sizes}
          className="object-cover"
          priority={priority}
        />

        {/* Vol label top-left */}
        <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-akira-yellow text-[9px] font-mono font-bold uppercase tracking-widest border border-akira-yellow z-10">
          VOL {volStr}
        </span>

        {showOfficialBadge && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500 text-bg text-[9px] font-mono font-bold uppercase tracking-widest border border-ink shadow-hard z-10">
            Capa oficial
          </span>
        )}
      </>
    );
  }

  // Fallback colorido (visual original do mock)
  const numberClass =
    fallbackSize === "sm"
      ? "text-5xl md:text-6xl"
      : fallbackSize === "lg"
        ? "text-8xl md:text-9xl"
        : "text-7xl md:text-8xl";

  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${color} 0%, ${colorSoft} 100%)`,
        }}
        aria-hidden
      />
      <div className="absolute inset-0 halftone opacity-40" aria-hidden />

      <span
        className={`relative display ${numberClass} text-ink glow-red leading-none drop-shadow-[0_3px_6px_rgba(0,0,0,0.7)]`}
      >
        {volStr}
      </span>

      <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-akira-yellow text-[9px] font-mono font-bold uppercase tracking-widest border border-akira-yellow z-10">
        VOL
      </span>
    </>
  );
}
