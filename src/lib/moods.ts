/**
 * Catalogo de moods — entrada principal de discovery emocional.
 *
 * Cada mood mapeia pra combinacao de generos Jikan + min_score
 * pra evitar entregar lixo (so manga 7.5+ entra na lista).
 *
 * accentColor casa com os tokens Akira do globals.css (red, cyan,
 * yellow, pink, violet, green) — usado pra zona/glow/bar.
 */

export type MoodAccent = "red" | "cyan" | "pink" | "yellow" | "violet" | "green";

export type Mood = {
  slug: string;
  name: string;
  jp: string;
  description: string;
  emoji: string;
  accentColor: MoodAccent;
  genreIds: number[];
  minScore: number;
};

// IDs Jikan:
// 1=Action 2=Adventure 4=Comedy 7=Mystery 8=Drama 10=Fantasy
// 14=Horror 22=Romance 25=Shoujo 36=Slice of Life 37=Supernatural
// 40=Psychological 42=Seinen 63=Iyashikei
export const MOODS: Mood[] = [
  {
    slug: "quero-rir",
    name: "Quero rir",
    jp: "笑いたい",
    description: "Comedias e slice of life pra leveza. Sem peso, so risada.",
    emoji: "😂",
    accentColor: "pink",
    genreIds: [4, 36],
    minScore: 7.5,
  },
  {
    slug: "quero-chorar",
    name: "Quero chorar",
    jp: "泣きたい",
    description: "Drama e romance pra molhar o travesseiro. Cabe lencinho.",
    emoji: "😭",
    accentColor: "violet",
    genreIds: [8, 22],
    minScore: 8,
  },
  {
    slug: "quero-pancadaria",
    name: "Quero pancadaria",
    jp: "戦いたい",
    description: "Acao bruta, aventura e seinen sem freio. Pega o capacete.",
    emoji: "💥",
    accentColor: "red",
    genreIds: [1, 2, 42],
    minScore: 8,
  },
  {
    slug: "quero-pensar",
    name: "Quero pensar",
    jp: "考えたい",
    description: "Misterio, thriller, psicologico. Pra quebrar a cabeca.",
    emoji: "🧠",
    accentColor: "cyan",
    genreIds: [7, 40],
    minScore: 8,
  },
  {
    slug: "quero-relaxar",
    name: "Quero relaxar",
    jp: "癒されたい",
    description: "Iyashikei e slice puro. Banho morno em forma de manga.",
    emoji: "🍵",
    accentColor: "green",
    genreIds: [36, 63],
    minScore: 7,
  },
  {
    slug: "quero-fantasia",
    name: "Quero fantasia",
    jp: "夢を見たい",
    description: "Magia, mundos impossiveis e bestas. Escapismo nivel hard.",
    emoji: "🐉",
    accentColor: "violet",
    genreIds: [10],
    minScore: 8,
  },
  {
    slug: "quero-romance",
    name: "Quero romance",
    jp: "恋したい",
    description: "Shoujo, paixao adolescente, primeira vez. Sem cinismo.",
    emoji: "💌",
    accentColor: "pink",
    genreIds: [22, 25],
    minScore: 7.5,
  },
  {
    slug: "quero-medo",
    name: "Quero medo",
    jp: "怖がりたい",
    description: "Horror e sobrenatural. Nao le antes de dormir.",
    emoji: "👹",
    accentColor: "red",
    genreIds: [14, 37],
    minScore: 7.5,
  },
];

export function getMoodBySlug(slug: string): Mood | null {
  return MOODS.find((m) => m.slug === slug) ?? null;
}

export function getOtherMoods(slug: string, limit = 4): Mood[] {
  return MOODS.filter((m) => m.slug !== slug).slice(0, limit);
}
