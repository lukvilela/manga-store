import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MOODS, type MoodAccent } from "@/lib/moods";

export const metadata = {
  title: "Mood — encontre manga pelo seu humor — Akira Mangás",
  description:
    "Descubra mangas pelo seu estado de espirito: rir, chorar, pancadaria, pensar, relaxar, fantasiar, romance e medo.",
};

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

export default function MoodIndexPage() {
  return (
    <>
      <Header />

      <section className="relative px-4 md:px-8 py-16 md:py-24 border-b border-[var(--line)] overflow-hidden">
        <div className="absolute inset-0 halftone-lg opacity-25 pointer-events-none" aria-hidden />
        <div className="bike-streak" style={{ top: "40%" }} />

        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-1.5 h-8 bg-akira-pink shadow-[3px_3px_0_var(--ink)]" />
            <p className="eyebrow text-akira-pink glow-pink">Discovery por mood</p>
            <span className="jp text-base text-akira-pink glow-pink">気分で選ぶ</span>
          </div>
          <h1 className="display text-5xl md:text-7xl text-ink leading-[0.95]">
            O que voce <span className="text-akira-red glow-red">SENTE</span> hoje?
          </h1>
          <p className="mt-6 max-w-2xl text-ink-soft text-sm md:text-base font-mono leading-relaxed">
            Escolha seu humor e a gente entrega uma playlist de manga sob medida —
            tudo com nota minima 7+ no MyAnimeList. Sem mid, sem perda de tempo.
          </p>
        </div>
      </section>

      <section className="px-4 md:px-8 py-16 md:py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7 stagger">
          {MOODS.map((mood) => (
            <Link
              key={mood.slug}
              href={`/mood/${mood.slug}`}
              className={`group relative card-lift border-2 border-ink shadow-hard hover:shadow-hard-lg transition-all overflow-hidden ${ACCENT_BG[mood.accentColor]}`}
            >
              <div className="absolute inset-0 halftone opacity-30 pointer-events-none" aria-hidden />

              <div className="relative p-6 md:p-7 min-h-[280px] flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <span className={`block w-1.5 h-8 shadow-[3px_3px_0_var(--ink)] ${ACCENT_BAR[mood.accentColor]}`} />
                  <span
                    className="text-5xl md:text-6xl leading-none transition-transform duration-500 group-hover:scale-125 group-hover:rotate-6"
                    aria-hidden
                  >
                    {mood.emoji}
                  </span>
                </div>

                <p className={`eyebrow ${ACCENT_TEXT[mood.accentColor]}`}>{mood.name}</p>
                <h3 className={`display text-3xl md:text-4xl mt-2 leading-tight ${ACCENT_TEXT[mood.accentColor]}`}>
                  {mood.name.split(" ").slice(1).join(" ") || mood.name}
                </h3>
                <p className={`jp text-sm mt-1 ${ACCENT_TEXT[mood.accentColor]}`}>{mood.jp}</p>

                <p className="mt-4 text-xs text-ink-soft font-mono leading-relaxed flex-1">
                  {mood.description}
                </p>

                <p className="mt-5 inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-ink group-hover:text-ink transition-colors">
                  <span className={`group-hover:translate-x-1 transition-transform`}>→</span>
                  Ver playlist
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
