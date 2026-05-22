/**
 * Skeleton da pagina /manga/[id]. Cobre hero + stats + sinopse +
 * volumes. Estilo Akira (pulse-neon + halftone).
 */
export default function MangaDetailSkeleton() {
  return (
    <div
      className="pulse-neon"
      aria-hidden
      role="status"
      aria-label="Carregando detalhes do manga"
    >
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--line)] bg-zone-red">
        <div className="absolute inset-0 halftone-lg opacity-30 pointer-events-none" />
        <div className="bike-streak" style={{ top: "30%" }} />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 grid md:grid-cols-[320px_1fr] gap-8 items-start">
          <div className="aspect-[3/4] w-full bg-bg-2 border-2 border-ink shadow-hard-lg overflow-hidden relative">
            <div className="absolute inset-0 halftone opacity-50" />
          </div>
          <div className="flex flex-col gap-4">
            <div className="h-3 w-40 bg-akira-cyan/30 border border-akira-cyan/40" />
            <div className="h-10 md:h-14 w-3/4 bg-bg-2 border-2 border-ink shadow-hard" />
            <div className="h-6 w-1/2 bg-bg-3" />
            <div className="flex gap-2 mt-2">
              <div className="h-7 w-16 bg-akira-yellow/30 border border-ink" />
              <div className="h-7 w-20 bg-akira-cyan/30 border border-ink" />
              <div className="h-7 w-14 bg-akira-pink/30 border border-ink" />
            </div>
            <div className="space-y-2 mt-4">
              <div className="h-3 w-full bg-bg-2" />
              <div className="h-3 w-11/12 bg-bg-2" />
              <div className="h-3 w-5/6 bg-bg-2" />
            </div>
            <div className="flex gap-3 mt-4">
              <div className="h-12 w-48 bg-akira-red/40 border-2 border-ink shadow-hard-lg" />
              <div className="h-12 w-32 bg-bg-2 border-2 border-akira-cyan/40" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="border-b border-[var(--line)] py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border border-[var(--line)] p-4 space-y-2 bg-bg-2">
              <div className="h-3 w-20 bg-akira-cyan/20" />
              <div className="h-6 w-24 bg-bg-3" />
            </div>
          ))}
        </div>
      </section>

      {/* Sinopse */}
      <section className="py-10 px-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="h-5 w-32 bg-akira-red/40 border border-ink" />
          <div className="h-3 w-full bg-bg-2" />
          <div className="h-3 w-11/12 bg-bg-2" />
          <div className="h-3 w-5/6 bg-bg-2" />
          <div className="h-3 w-3/4 bg-bg-2" />
          <div className="h-3 w-2/3 bg-bg-2" />
        </div>
      </section>

      {/* Volumes row */}
      <section className="py-10 px-4 md:px-8 border-t border-[var(--line)]">
        <div className="max-w-7xl mx-auto">
          <div className="h-5 w-40 bg-akira-yellow/40 border border-ink mb-5" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="w-[140px] flex-shrink-0 aspect-[3/4] bg-bg-2 border-2 border-ink shadow-hard"
              >
                <div className="w-full h-full halftone opacity-40" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
