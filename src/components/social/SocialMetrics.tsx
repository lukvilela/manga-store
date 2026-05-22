import {
  getReadingNow,
  getCompletedCount,
  getTrendingScore,
  formatCompact,
} from "@/lib/social-mock";

type Props = { mangaId: string | number };

/**
 * Tres cards horizontais de metricas sociais.
 * Server component — mock deterministico, sem useState.
 */
export default function SocialMetrics({ mangaId }: Props) {
  const reading = getReadingNow(mangaId);
  const completed = getCompletedCount(mangaId);
  const trending = getTrendingScore(mangaId);

  // Cor da barra de trending — escala vermelho conforme score
  const trendingColor =
    trending >= 80
      ? "bg-akira-red"
      : trending >= 50
      ? "bg-akira-yellow"
      : "bg-akira-cyan";

  return (
    <section className="relative bg-bg py-10 px-4 md:px-8 border-y border-[var(--line)] overflow-hidden">
      <div className="absolute inset-0 halftone opacity-10 pointer-events-none" aria-hidden />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Lendo agora */}
        <MetricCard
          jp="読書中"
          label="Lendo agora"
          value={formatCompact(reading)}
          icon="O"
          iconClass="text-akira-red glow-red"
          accent="red"
          pulse
        />

        {/* Completaram */}
        <MetricCard
          jp="読了"
          label="Completaram"
          value={formatCompact(completed)}
          icon="V"
          iconClass="text-akira-cyan glow-cyan"
          accent="cyan"
        />

        {/* Trending score */}
        <div className="relative bg-bg-2 border-2 border-ink shadow-hard p-5 overflow-hidden">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="eyebrow text-ink-muted flex items-center gap-2 mb-1">
                <span className="jp text-base text-akira-pink glow-pink">
                  人気急上昇
                </span>
                <span>·</span>
                <span>Trending</span>
              </p>
              <p className="display text-3xl text-akira-pink glow-pink numerals">
                {trending}
                <span className="text-base text-ink-muted ml-1">/100</span>
              </p>
            </div>
            <span className="text-2xl text-akira-pink glow-pink" aria-hidden>
              #
            </span>
          </div>
          <div
            className="h-2 bg-bg border border-[var(--line)] relative overflow-hidden"
            role="progressbar"
            aria-valuenow={trending}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`h-full ${trendingColor} shadow-[2px_0_0_var(--ink)] transition-all`}
              style={{ width: `${trending}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  jp,
  label,
  value,
  icon,
  iconClass,
  accent,
  pulse,
}: {
  jp: string;
  label: string;
  value: string;
  icon: string;
  iconClass: string;
  accent: "red" | "cyan";
  pulse?: boolean;
}) {
  const accentColor = {
    red: "text-akira-red glow-red",
    cyan: "text-akira-cyan glow-cyan",
  }[accent];

  return (
    <div className="relative bg-bg-2 border-2 border-ink shadow-hard p-5 flex items-center gap-4">
      <div className="relative flex-shrink-0 w-12 h-12 border-2 border-ink flex items-center justify-center font-mono text-xl font-bold bg-bg shadow-[2px_2px_0_var(--ink)]">
        <span className={iconClass}>{icon}</span>
        {pulse && (
          <span className="pulse-neon absolute -top-1 -right-1 w-2 h-2 rounded-full bg-akira-red shadow-[0_0_8px_var(--akira-red)]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="eyebrow text-ink-muted flex items-center gap-2 mb-1">
          <span className={`jp text-base ${accentColor}`}>{jp}</span>
          <span>·</span>
          <span>{label}</span>
        </p>
        <p className={`display text-3xl ${accentColor} numerals leading-none`}>
          {value}
        </p>
      </div>
    </div>
  );
}
