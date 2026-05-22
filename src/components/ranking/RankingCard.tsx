import { getMangaColor, getContrastText } from "@/lib/manga-colors";
import {
  CATEGORY_META,
  getMetricValue,
  type LeaderboardCategory,
  type LeaderboardEntry,
} from "@/lib/leaderboard";

type Props = {
  entry: LeaderboardEntry;
  position: number;
  category: LeaderboardCategory;
  variant?: "podium" | "row";
};

const PODIUM_META: Record<number, { trophy: string; color: string; glow: string; label: string }> = {
  1: {
    trophy: "🏆",
    color: "var(--akira-yellow)",
    glow: "glow-yellow",
    label: "OURO",
  },
  2: {
    trophy: "🥈",
    color: "var(--ink-soft)",
    glow: "",
    label: "PRATA",
  },
  3: {
    trophy: "🥉",
    color: "#c084fc",
    glow: "glow-pink",
    label: "BRONZE",
  },
};

/**
 * Card de posicao. Server component — recebe entry ja calculada.
 *
 * Variants:
 * - podium: top 3 grandes com trofeu e glow
 * - row: posicao compacta pra lista 4-20
 */
export default function RankingCard({ entry, position, category, variant = "row" }: Props) {
  const meta = CATEGORY_META[category];
  const value = getMetricValue(entry, category);
  const avatarBg = getMangaColor(entry.userName);
  const avatarFg = getContrastText(avatarBg);
  const initial = entry.userName.charAt(0).toUpperCase();
  const isPodium = variant === "podium";
  const podium = PODIUM_META[position];

  if (isPodium && podium) {
    return (
      <article
        className={`relative panel-frame bg-[var(--bg-2)] p-5 overflow-hidden ${
          entry.isCurrentUser ? "ring-4 ring-[var(--akira-red)]" : ""
        }`}
      >
        <div className="absolute inset-0 halftone opacity-10 pointer-events-none" aria-hidden />
        <div className="absolute -right-3 -top-3 text-6xl select-none" aria-hidden>
          {podium.trophy}
        </div>

        <div className="relative space-y-3">
          <p
            className={`display text-7xl leading-none ${podium.glow}`}
            style={{ color: podium.color }}
          >
            #{position}
          </p>
          <p className="eyebrow !text-[var(--ink-muted)]">{podium.label}</p>

          <div className="flex items-center gap-3">
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center border-2 border-[var(--ink)] shadow-hard"
              style={{ background: avatarBg, color: avatarFg }}
            >
              <span className="display text-2xl">{initial}</span>
            </div>
            <div className="min-w-0">
              <p className="display text-xl text-[var(--ink)] truncate">{entry.userName}</p>
              <p className="jp text-xs text-[var(--ink-muted)]">LVL {entry.level}</p>
            </div>
          </div>

          {entry.isCurrentUser && (
            <span className="inline-block border-2 border-[var(--akira-red)] bg-[var(--akira-red)] text-[var(--ink)] px-2 py-1 font-mono text-[10px] uppercase tracking-widest shadow-hard">
              VOCE
            </span>
          )}

          <div className="border-t-2 border-[var(--line)] pt-3">
            <p
              className="display text-3xl numerals leading-none"
              style={{ color: meta.color }}
            >
              {value.toLocaleString("pt-BR")}{" "}
              <span className="text-xs text-[var(--ink-muted)]">{meta.metricLabel}</span>
            </p>
            <MiniStats entry={entry} highlight={category} />
          </div>
        </div>
      </article>
    );
  }

  // Variant row
  return (
    <article
      className={`group flex items-center gap-3 border-2 px-3 py-2 transition-all ${
        entry.isCurrentUser
          ? "border-[var(--akira-red)] bg-[var(--akira-red)]/15"
          : "border-[var(--line)] bg-[var(--bg-2)] hover:border-[var(--ink-soft)]"
      }`}
    >
      <span
        className="display text-2xl numerals w-12 text-right"
        style={{ color: meta.color }}
      >
        #{position}
      </span>

      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center border-2 border-[var(--ink)]"
        style={{ background: avatarBg, color: avatarFg }}
      >
        <span className="display text-base">{initial}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="display text-sm text-[var(--ink)] truncate">{entry.userName}</p>
          {entry.isCurrentUser && (
            <span className="border border-[var(--akira-red)] bg-[var(--akira-red)] text-[var(--ink)] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest">
              VOCE
            </span>
          )}
        </div>
        <MiniStats entry={entry} highlight={category} />
      </div>

      <p
        className="display text-xl numerals"
        style={{ color: meta.color }}
        title={`${value.toLocaleString("pt-BR")} ${meta.metricLabel}`}
      >
        {value.toLocaleString("pt-BR")}
      </p>
    </article>
  );
}

function MiniStats({
  entry,
  highlight,
}: {
  entry: LeaderboardEntry;
  highlight: LeaderboardCategory;
}) {
  const items: { cat: LeaderboardCategory; value: number }[] = [
    { cat: "xp", value: entry.xp },
    { cat: "badges", value: entry.badges },
    { cat: "streak", value: entry.streak },
    { cat: "estante", value: entry.estante },
  ];
  return (
    <div className="flex gap-2 mt-0.5 flex-wrap">
      {items.map((it) => {
        const m = CATEGORY_META[it.cat];
        const isHi = it.cat === highlight;
        return (
          <span
            key={it.cat}
            className={`font-mono text-[10px] numerals ${isHi ? "font-bold" : "text-[var(--ink-muted)]"}`}
            style={isHi ? { color: m.color } : undefined}
            title={m.label}
          >
            {m.icon} {it.value.toLocaleString("pt-BR")}
          </span>
        );
      })}
    </div>
  );
}
