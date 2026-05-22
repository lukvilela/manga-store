import type { JikanManga } from "@/lib/manga-api";

type Props = { manga: JikanManga };

export default function MangaSynopsis({ manga }: Props) {
  if (!manga.synopsis && !manga.background) return null;

  return (
    <section className="relative bg-zone-warm py-16 md:py-24 px-4 md:px-8 border-b border-[var(--line)] overflow-hidden">
      <div className="absolute inset-0 halftone opacity-15 pointer-events-none" aria-hidden />

      <div className="relative max-w-4xl mx-auto">
        {/* Sinopse */}
        {manga.synopsis && (
          <article className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="block w-1.5 h-8 bg-akira-red shadow-[3px_3px_0_var(--ink)]" />
              <p className="eyebrow text-akira-red glow-red">Sinopse / 概要</p>
            </div>
            <h2 className="display text-3xl md:text-4xl mb-6">A historia</h2>
            <div className="prose prose-invert max-w-none">
              {manga.synopsis.split("\n\n").map((para, i) => (
                <p key={i} className="text-base md:text-lg leading-relaxed text-ink-soft mb-4">
                  {para}
                </p>
              ))}
            </div>
          </article>
        )}

        {/* Background — historia do mangá */}
        {manga.background && (
          <article className="mt-12 pt-12 border-t border-[var(--line)]">
            <div className="flex items-center gap-3 mb-6">
              <span className="block w-1.5 h-8 bg-akira-cyan shadow-[3px_3px_0_var(--ink)]" />
              <p className="eyebrow text-akira-cyan glow-cyan">Background / 背景</p>
            </div>
            <h2 className="display text-3xl md:text-4xl mb-6">Por tras das paginas</h2>
            <div className="prose prose-invert max-w-none">
              {manga.background.split("\n\n").map((para, i) => (
                <p key={i} className="text-base md:text-lg leading-relaxed text-ink-muted mb-4">
                  {para}
                </p>
              ))}
            </div>
          </article>
        )}

        {/* Meta info detalhada */}
        <div className="mt-16 pt-12 border-t border-[var(--line)] grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
          <Field label="Autores" jp="作者" value={manga.authors.map((a) => a.name).join(", ") || "—"} />
          <Field label="Status" jp="状態" value={manga.status || "—"} />
          <Field label="Volumes" jp="巻数" value={manga.volumes ? `${manga.volumes}` : "Em andamento"} />
          <Field label="Capitulos" jp="話数" value={manga.chapters ? `${manga.chapters}` : "—"} />
          {manga.themes.length > 0 && (
            <Field
              label="Temas"
              jp="テーマ"
              value={manga.themes.map((t) => t.name).join(" · ")}
            />
          )}
          {manga.demographics.length > 0 && (
            <Field
              label="Demographic"
              jp="読者層"
              value={manga.demographics.map((d) => d.name).join(", ")}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function Field({ label, jp, value }: { label: string; jp: string; value: string }) {
  return (
    <div>
      <p className="eyebrow text-ink-muted mb-1 flex items-center gap-2">
        <span className="jp text-sm text-akira-yellow">{jp}</span>
        <span>·</span>
        <span>{label}</span>
      </p>
      <p className="text-sm md:text-base text-ink-soft leading-snug">{value}</p>
    </div>
  );
}
