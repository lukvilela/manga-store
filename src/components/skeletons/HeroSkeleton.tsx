/**
 * Skeleton do Hero. Mantem proporcoes/layout pra evitar layout shift.
 */
export default function HeroSkeleton() {
  return (
    <section
      className="relative overflow-hidden border-b border-[var(--line)] bg-zone-red pulse-neon"
      aria-hidden
      role="status"
      aria-label="Carregando hero"
    >
      <div className="absolute inset-0 halftone-lg opacity-30 pointer-events-none" />
      <div className="bike-streak" style={{ top: "25%" }} />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-28 grid md:grid-cols-2 gap-10 items-center">
        {/* Coluna esquerda: textos */}
        <div className="flex flex-col gap-5">
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <span className="block w-1.5 h-8 bg-akira-red shadow-[3px_3px_0_var(--ink)]" />
            <div className="h-3 w-40 bg-akira-cyan/30 border border-akira-cyan/40" />
          </div>

          {/* Titulo gigante */}
          <div className="space-y-3">
            <div className="h-10 md:h-16 w-3/4 bg-bg-2 border-2 border-ink shadow-hard" />
            <div className="h-10 md:h-16 w-2/3 bg-akira-red/30 border-2 border-ink shadow-hard" />
          </div>

          {/* Subtitulo */}
          <div className="space-y-2 mt-3">
            <div className="h-3 w-full bg-bg-2 rounded-sm" />
            <div className="h-3 w-5/6 bg-bg-2 rounded-sm" />
            <div className="h-3 w-3/4 bg-bg-2 rounded-sm" />
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="h-12 w-48 bg-akira-red/40 border-2 border-ink shadow-hard-lg" />
            <div className="h-12 w-36 bg-bg-2 border-2 border-akira-cyan/40" />
          </div>
        </div>

        {/* Coluna direita: visual */}
        <div className="relative aspect-[3/4] max-w-md mx-auto w-full border-2 border-ink shadow-hard-lg bg-bg-2 overflow-hidden">
          <div className="absolute inset-0 halftone opacity-50" />
          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <div className="h-4 w-2/3 bg-bg-3" />
            <div className="h-3 w-1/2 bg-bg-3" />
          </div>
          <div className="absolute top-4 left-4 w-12 h-6 bg-akira-yellow/40 border border-ink" />
        </div>
      </div>
    </section>
  );
}
