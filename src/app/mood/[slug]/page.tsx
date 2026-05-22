import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MangaGrid from "@/components/MangaGrid";
import { getMangaByMood, toCardData } from "@/lib/manga-api";
import { getMoodBySlug, getOtherMoods, MOODS, type MoodAccent } from "@/lib/moods";

export const revalidate = 3600;

type Params = { slug: string };

const ACCENT_BG: Record<MoodAccent, string> = {
  red: "bg-zone-red",
  cyan: "bg-zone-cyan",
  pink: "bg-zone-pink",
  yellow: "bg-zone-yellow",
  violet: "bg-zone-violet",
  green: "bg-zone-green",
};

const ACCENT_TEXT: Record<MoodAccent, string> = {
  red: "text-akira-red glow-red",
  cyan: "text-akira-cyan glow-cyan",
  pink: "text-akira-pink glow-pink",
  yellow: "text-akira-yellow glow-yellow",
  violet: "text-akira-violet glow-violet",
  green: "text-akira-green glow-green",
};

const ACCENT_BAR: Record<MoodAccent, string> = {
  red: "bg-akira-red",
  cyan: "bg-akira-cyan",
  pink: "bg-akira-pink",
  yellow: "bg-akira-yellow",
  violet: "bg-akira-violet",
  green: "bg-akira-green",
};

export function generateStaticParams() {
  return MOODS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const mood = getMoodBySlug(slug);
  if (!mood) return { title: "Mood — MangaVerse" };
  return {
    title: `${mood.name} — Mood — MangaVerse`,
    description: mood.description,
  };
}

export default async function MoodResultsPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const mood = getMoodBySlug(slug);
  if (!mood) notFound();

  const raw = await getMangaByMood(mood.genreIds, mood.minScore, 25);
  const mangas = raw.map(toCardData);
  const others = getOtherMoods(mood.slug, 4);

  return (
    <>
      <Header />

      {/* Hero — mood selecionado */}
      <section
        className={`relative px-4 md:px-8 py-16 md:py-24 border-b border-[var(--line)] overflow-hidden ${ACCENT_BG[mood.accentColor]}`}
      >
        <div className="absolute inset-0 halftone-lg opacity-30 pointer-events-none" aria-hidden />
        <div className="bike-streak" style={{ top: "45%" }} />

        <div className="relative max-w-7xl mx-auto">
          <Link
            href="/mood"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-ink-muted hover:text-akira-yellow transition-colors mb-6"
          >
            ← Todos os moods
          </Link>

          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className={`block w-1.5 h-8 shadow-[3px_3px_0_var(--ink)] ${ACCENT_BAR[mood.accentColor]}`} />
                <p className={`eyebrow ${ACCENT_TEXT[mood.accentColor]}`}>Mood selecionado</p>
                <span className={`jp text-base ${ACCENT_TEXT[mood.accentColor]}`}>{mood.jp}</span>
              </div>
              <h1 className="display text-4xl md:text-7xl text-ink leading-[0.95]">
                Voce quer{" "}
                <span className={ACCENT_TEXT[mood.accentColor]}>{mood.name.toLowerCase()}</span>
              </h1>
              <p className="mt-6 max-w-2xl text-ink-soft font-mono text-sm md:text-base leading-relaxed">
                {mood.description}
              </p>
              <p className="mt-4 text-[11px] font-mono uppercase tracking-widest text-ink-muted">
                Filtros aplicados: nota minima{" "}
                <span className="text-akira-cyan numerals">{mood.minScore.toFixed(1)}</span> ·{" "}
                {raw.length} mangas encontrados
              </p>
            </div>
            <div className="text-8xl md:text-9xl leading-none" aria-hidden>
              {mood.emoji}
            </div>
          </div>
        </div>
      </section>

      {/* Resultados */}
      <section className="px-4 md:px-8 py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <MangaGrid
            mangas={mangas}
            emptyText="Tente outro mood — esse veio vazio do MyAnimeList."
          />
        </div>
      </section>

      {/* Outros moods */}
      <section className="relative px-4 md:px-8 py-16 border-t border-[var(--line)] bg-zone-warm overflow-hidden">
        <div className="absolute inset-0 halftone opacity-25 pointer-events-none" aria-hidden />
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <span className="block w-1.5 h-8 bg-akira-yellow shadow-[3px_3px_0_var(--ink)]" />
            <p className="eyebrow text-akira-yellow glow-yellow">Outros moods</p>
            <span className="jp text-base text-akira-yellow glow-yellow">他の気分</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
            {others.map((m) => (
              <Link
                key={m.slug}
                href={`/mood/${m.slug}`}
                className={`group relative card-lift border-2 border-ink shadow-hard hover:shadow-hard-lg p-5 overflow-hidden ${ACCENT_BG[m.accentColor]}`}
              >
                <div className="absolute inset-0 halftone opacity-30 pointer-events-none" aria-hidden />
                <div className="relative flex items-center gap-3">
                  <span className="text-4xl group-hover:scale-125 transition-transform" aria-hidden>
                    {m.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className={`eyebrow ${ACCENT_TEXT[m.accentColor]}`}>{m.name}</p>
                    <p className={`jp text-xs mt-0.5 ${ACCENT_TEXT[m.accentColor]}`}>{m.jp}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
