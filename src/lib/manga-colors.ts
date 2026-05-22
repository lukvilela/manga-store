/**
 * Mapeamento de cor dominante por série de manga.
 *
 * Cor usada pra colorir o background do card no carrossel + accent visual.
 * Mapeada manualmente pros mangás mais famosos (capa icônica reconhecível).
 *
 * Fallback: hash do slug → HSL cyberpunk (vermelho/magenta/cyan/roxo/yellow).
 */

const PRESET_COLORS: Record<string, string> = {
  // Dark masterpieces — pretos com acento
  "berserk": "#1a0a0a",
  "vagabond": "#2d2818",
  "vinland-saga": "#1e3a5f",
  "monster": "#1f2937",
  "20th-century-boys": "#1f2937",
  "homunculus": "#0f0a14",
  "oyasumi-punpun": "#fef3c7",  // exception — cream brilhante

  // Shounen quentes
  "one-piece": "#dc2626",       // vermelho-cinza
  "naruto": "#ea580c",          // laranja
  "bleach": "#1e293b",
  "dragon-ball": "#fb923c",
  "hunter-x-hunter": "#15803d", // verde gon
  "fullmetal-alchemist": "#92400e",
  "my-hero-academia": "#16a34a",
  "demon-slayer": "#166534",    // verde tanjiro
  "kimetsu-no-yaiba": "#166534",

  // Shounen Jump modernos
  "jujutsu-kaisen": "#6b21a8",  // roxo gojo
  "chainsaw-man": "#f47521",    // laranja crunch
  "spy-x-family": "#b91c1c",
  "kagurabachi": "#1e1b4b",

  // Death Note — preto + vermelho
  "death-note": "#1a1a1f",

  // JoJo — cores explosivas
  "jojo-no-kimyou-na-bouken": "#c026d3",     // magenta
  "jojo-no-kimyou-na-bouken-part-7": "#c026d3",
  "steel-ball-run": "#92400e",                // sépia

  // Seinen ação
  "attack-on-titan": "#92400e",  // sépia uniforme
  "shingeki-no-kyojin": "#92400e",
  "tokyo-ghoul": "#1f2937",      // dark grey
  "blame": "#0a0a12",
  "akira": "#c1121f",             // VERMELHO icônico

  // Slice/Romance
  "fruits-basket": "#fb923c",
  "horimiya": "#fda4af",
  "kaguya-sama": "#fde047",
  "fruits-basket-another": "#fb923c",

  // Mecha/Sci-fi
  "gunnm": "#475569",
  "battle-angel-alita": "#475569",
  "appleseed": "#0e7490",

  // Misc populares
  "claymore": "#1e293b",
  "berserk-deluxe-edition": "#1a0a0a",
  "uzumaki": "#7c2d12",
  "tomie": "#7c2d12",
  "junji-ito": "#7c2d12",
};

/**
 * Paleta cyberpunk fallback usada quando manga não tá mapeado.
 * Hash do slug → índice pra dar consistência (mesmo manga = sempre mesma cor).
 */
const CYBERPUNK_FALLBACK = [
  "#c1121f",  // akira red
  "#ff006e",  // pink neon
  "#7c3aed",  // violet plasma
  "#0e7490",  // cyan deep
  "#fbbf24",  // yellow glow
  "#16a34a",  // green matrix
  "#dc2626",  // crimson
  "#a21caf",  // magenta
  "#1e3a8a",  // blue noir
  "#92400e",  // amber sepia
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Retorna a cor dominante pra um manga.
 * - Slug mapeado: usa cor preset
 * - Sem mapeamento: gera cor consistente via hash → cyberpunk palette
 */
export function getMangaColor(slugOrTitle: string): string {
  const normalized = slugOrTitle
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")  // remove acentos (combining marks)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Exact match
  if (PRESET_COLORS[normalized]) return PRESET_COLORS[normalized];

  // Partial match — checa se nome contém uma key conhecida
  for (const key of Object.keys(PRESET_COLORS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return PRESET_COLORS[key];
    }
  }

  // Fallback determinístico
  const idx = hashCode(normalized) % CYBERPUNK_FALLBACK.length;
  return CYBERPUNK_FALLBACK[idx];
}

/**
 * Retorna cor de texto contrastante (claro ou escuro) com base no fundo.
 * Usa fórmula YIQ — funciona bem com hex puro.
 */
export function getContrastText(hex: string): "#ededf2" | "#0a0a0d" {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#0a0a0d" : "#ededf2";
}

/**
 * Versão com opacity pra gradient sutil.
 */
export function getMangaColorAlpha(slugOrTitle: string, alpha = 0.4): string {
  const hex = getMangaColor(slugOrTitle);
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
