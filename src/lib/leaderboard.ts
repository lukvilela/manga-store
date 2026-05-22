/**
 * Leaderboard mock deterministico.
 *
 * 50 users gerados via hash do nome (mesmo nome = mesmas stats sempre).
 * O user real e injetado misturando useGamification + useEstante.
 *
 * Categorias: xp, badges, streak, estante (size da colecao)
 */

export type LeaderboardCategory = "xp" | "badges" | "streak" | "estante";

export type LeaderboardEntry = {
  userName: string;
  xp: number;
  level: number;
  badges: number;
  streak: number;
  estante: number;
  isCurrentUser: boolean;
};

// Pool de nomes JP + BR comuns
const NAME_POOL = [
  "Akira", "Tetsuo", "Kaneda", "Otomo", "Kaori", "Shotaro",
  "Yuki", "Haruto", "Sora", "Ren", "Aiko", "Hiro", "Daichi",
  "Mei", "Sakura", "Riku", "Kai", "Yui", "Aoi", "Ichiro",
  "Yamato", "Hana", "Mizuki", "Ayumi", "Kenji",
  // BR comuns
  "Lucas", "Felipe", "Bruno", "Mariana", "Camila", "Rafael",
  "Gabriel", "Beatriz", "Vinicius", "Larissa", "Pedro", "Julia",
  "Matheus", "Carolina", "Gustavo", "Amanda", "Thiago", "Leticia",
  "Diego", "Patricia", "Eduardo", "Fernanda", "Rodrigo", "Aline",
  "Caio",
];

// Hash deterministico
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Pseudo-random determinístico baseado em seed
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function computeLevel(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 100)) + 1);
}

/**
 * Gera stats de um user mock dado o nome.
 * Mesmo nome = mesmas stats (consistencia entre tabs/categorias).
 */
function mockUserStats(userName: string, salt = 0): Omit<LeaderboardEntry, "isCurrentUser"> {
  const seed = hashCode(userName) + salt;
  // XP entre 100 e 25000 — distribuicao puxada pra baixo
  const xpRoll = seededRandom(seed);
  const xp = Math.floor(100 + Math.pow(xpRoll, 1.6) * 24900);
  const level = computeLevel(xp);
  // Badges 0-30
  const badges = Math.floor(seededRandom(seed + 1) * 30);
  // Streak 0-180
  const streak = Math.floor(Math.pow(seededRandom(seed + 2), 1.4) * 180);
  // Estante 0-200
  const estante = Math.floor(Math.pow(seededRandom(seed + 3), 1.2) * 200);

  return { userName, xp, level, badges, streak, estante };
}

// Build pool uma vez por modulo (50 users)
let MOCK_POOL: Omit<LeaderboardEntry, "isCurrentUser">[] | null = null;

function getMockPool(): Omit<LeaderboardEntry, "isCurrentUser">[] {
  if (MOCK_POOL) return MOCK_POOL;
  const pool: Omit<LeaderboardEntry, "isCurrentUser">[] = [];
  // 50 nomes — se o pool tem menos, repete com salt diferente
  for (let i = 0; i < 50; i++) {
    const baseName = NAME_POOL[i % NAME_POOL.length];
    const salt = Math.floor(i / NAME_POOL.length);
    const displayName = salt > 0 ? `${baseName}${salt + 1}` : baseName;
    pool.push(mockUserStats(displayName, salt));
  }
  MOCK_POOL = pool;
  return pool;
}

// Dados do user real (vem de useGamification + useEstante via caller)
export type CurrentUserStats = {
  userName: string;
  xp: number;
  badges: number;
  streak: number;
  estante: number;
};

function sortByCategory(
  entries: LeaderboardEntry[],
  category: LeaderboardCategory,
): LeaderboardEntry[] {
  const key: keyof LeaderboardEntry =
    category === "xp" ? "xp"
      : category === "badges" ? "badges"
      : category === "streak" ? "streak"
      : "estante";
  return [...entries].sort((a, b) => (b[key] as number) - (a[key] as number));
}

/**
 * Retorna leaderboard ordenado pela categoria, com user real injetado.
 */
export function getLeaderboard(
  category: LeaderboardCategory,
  currentUser: CurrentUserStats | null = null,
  limit = 20,
): LeaderboardEntry[] {
  const pool = getMockPool();
  const entries: LeaderboardEntry[] = pool.map((p) => ({
    ...p,
    isCurrentUser: false,
  }));

  if (currentUser) {
    entries.push({
      userName: currentUser.userName || "Voce",
      xp: currentUser.xp,
      level: computeLevel(currentUser.xp),
      badges: currentUser.badges,
      streak: currentUser.streak,
      estante: currentUser.estante,
      isCurrentUser: true,
    });
  }

  return sortByCategory(entries, category).slice(0, limit);
}

/**
 * Retorna posicao do user real (1-indexed) na categoria. 0 se nao incluido.
 */
export function getUserRanking(
  currentUser: CurrentUserStats,
  category: LeaderboardCategory,
): { position: number; total: number; entry: LeaderboardEntry } {
  const full = getLeaderboard(category, currentUser, 999);
  const idx = full.findIndex((e) => e.isCurrentUser);
  return {
    position: idx + 1,
    total: full.length,
    entry: full[idx],
  };
}

/**
 * Alias semantico — top N pra categoria.
 */
export function getTopForCategory(
  category: LeaderboardCategory,
  currentUser: CurrentUserStats | null = null,
  limit = 20,
): LeaderboardEntry[] {
  return getLeaderboard(category, currentUser, limit);
}

/**
 * Helper pra labels visuais
 */
export const CATEGORY_META: Record<
  LeaderboardCategory,
  { label: string; jp: string; metricLabel: string; color: string; icon: string }
> = {
  xp: {
    label: "XP",
    jp: "経験値",
    metricLabel: "XP",
    color: "var(--akira-cyan)",
    icon: "✦",
  },
  badges: {
    label: "Badges",
    jp: "勲章",
    metricLabel: "badges",
    color: "var(--akira-pink)",
    icon: "◆",
  },
  streak: {
    label: "Streak",
    jp: "連続",
    metricLabel: "dias",
    color: "var(--akira-yellow)",
    icon: "▲",
  },
  estante: {
    label: "Colecao",
    jp: "本棚",
    metricLabel: "mangas",
    color: "var(--akira-green)",
    icon: "■",
  },
};

export function getMetricValue(entry: LeaderboardEntry, category: LeaderboardCategory): number {
  switch (category) {
    case "xp": return entry.xp;
    case "badges": return entry.badges;
    case "streak": return entry.streak;
    case "estante": return entry.estante;
  }
}
