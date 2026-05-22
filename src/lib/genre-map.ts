/**
 * Mapeamento slug PT-BR -> Jikan genre ID.
 *
 * Slugs usados em /genero/[slug] (ex: /genero/acao, /genero/romance).
 * Cada entry traz: id, nome PT, nome EN, kanji JP, cor/zone tematica,
 * fato curioso pro hero, e demographics tipicamente associados.
 */

export type GenreInfo = {
  id: number;
  slug: string;
  name: string;        // PT
  nameEn: string;
  jp: string;          // kanji curto
  zone: "red" | "cyan" | "violet" | "yellow" | "pink" | "warm" | "green";
  accent: "red" | "cyan" | "violet" | "yellow" | "pink" | "green";
  tagline: string;
  fact: string;
  demographics: string[]; // strings livre, mostradas no hero
  count: string;          // estimativa display ("3.500+ obras")
};

export const GENRES: GenreInfo[] = [
  {
    id: 1,
    slug: "acao",
    name: "Acao",
    nameEn: "Action",
    jp: "アクション",
    zone: "red",
    accent: "red",
    tagline: "Onomatopeias, socos, explosoes",
    fact: "Acao e o genero mais publicado no Weekly Shounen Jump desde 1968 — One Piece, Naruto, Bleach formaram a 'Big 3' que definiu uma geracao.",
    demographics: ["Shounen", "Seinen", "Shoujo"],
    count: "8.200+ series",
  },
  {
    id: 2,
    slug: "aventura",
    name: "Aventura",
    nameEn: "Adventure",
    jp: "冒険",
    zone: "yellow",
    accent: "yellow",
    tagline: "O caminho importa mais que o destino",
    fact: "One Piece — o mais vendido da historia (516+ milhoes de copias) — e classificado primariamente como aventura, nao acao.",
    demographics: ["Shounen", "Seinen"],
    count: "5.400+ series",
  },
  {
    id: 4,
    slug: "comedia",
    name: "Comedia",
    nameEn: "Comedy",
    jp: "コメディ",
    zone: "pink",
    accent: "pink",
    tagline: "Manzai, gag, slice cotidiano",
    fact: "Gag manga japones usa pausas de painel e onomatopeias visuais como recurso comico — KochiKame durou 40 anos e 200 volumes sem furo.",
    demographics: ["Shounen", "Seinen", "Shoujo"],
    count: "7.100+ series",
  },
  {
    id: 8,
    slug: "drama",
    name: "Drama",
    nameEn: "Drama",
    jp: "ドラマ",
    zone: "violet",
    accent: "violet",
    tagline: "Quando o silencio fala mais alto",
    fact: "Oyasumi Punpun de Inio Asano e citado por psicologos japoneses como retrato cru da depressao na geracao Heisei.",
    demographics: ["Seinen", "Josei", "Shoujo"],
    count: "6.800+ series",
  },
  {
    id: 10,
    slug: "fantasia",
    name: "Fantasia",
    nameEn: "Fantasy",
    jp: "幻想",
    zone: "violet",
    accent: "violet",
    tagline: "Espadas, dragoes, isekai infinitos",
    fact: "O boom isekai pos-2010 (Mushoku Tensei, Re:Zero, Konosuba) gerou tantos titulos que algumas revistas baniram protagonistas mortos-renascidos por ano.",
    demographics: ["Shounen", "Seinen"],
    count: "9.300+ series",
  },
  {
    id: 14,
    slug: "horror",
    name: "Horror",
    nameEn: "Horror",
    jp: "恐怖",
    zone: "red",
    accent: "red",
    tagline: "Junji Ito ja viu o que voce sonha",
    fact: "Uzumaki de Junji Ito foi listado pela Library of Congress como uma das 50 obras de quadrinhos mais influentes do seculo XXI.",
    demographics: ["Seinen", "Shounen"],
    count: "2.400+ series",
  },
  {
    id: 22,
    slug: "romance",
    name: "Romance",
    nameEn: "Romance",
    jp: "恋愛",
    zone: "pink",
    accent: "pink",
    tagline: "Doki doki, mao tremendo, confissao no telhado",
    fact: "Shoujo romance criou tropes globais — confissao na arvore de cerejeira, Valentine's chocolate, sempai. Sailor Moon vendeu 35 milhoes so de mangas.",
    demographics: ["Shoujo", "Josei", "Shounen"],
    count: "11.200+ series",
  },
  {
    id: 24,
    slug: "sci-fi",
    name: "Sci-Fi",
    nameEn: "Sci-Fi",
    jp: "SF",
    zone: "cyan",
    accent: "cyan",
    tagline: "Cyberpunk, mecha, distopia neon",
    fact: "Akira (1982) de Otomo influenciou Matrix, Stranger Things e Kanye West — sua estetica neo-Tokyo definiu como o futuro 'parece' no cinema ocidental.",
    demographics: ["Seinen", "Shounen"],
    count: "3.900+ series",
  },
  {
    id: 7,
    slug: "misterio",
    name: "Misterio",
    nameEn: "Mystery",
    jp: "謎",
    zone: "cyan",
    accent: "cyan",
    tagline: "Pistas, viradas, detetives genios",
    fact: "Detective Conan tem 100+ volumes e 1.000+ episodios anime sem nunca terminar — o autor Aoyama Gosho colocou a obra em hiato medico em 2023.",
    demographics: ["Shounen", "Seinen"],
    count: "3.100+ series",
  },
  {
    id: 36,
    slug: "slice-of-life",
    name: "Slice of Life",
    nameEn: "Slice of Life",
    jp: "日常",
    zone: "warm",
    accent: "green",
    tagline: "O extraordinario do dia comum",
    fact: "Yokohama Kaidashi Kikou e considerado o ponto fundador do genero iyashikei (healing) — narrativas calmas sobre o fim do mundo, sem conflito.",
    demographics: ["Seinen", "Shoujo", "Josei"],
    count: "5.600+ series",
  },
];

const BY_SLUG = new Map(GENRES.map((g) => [g.slug, g]));
const BY_ID = new Map(GENRES.map((g) => [g.id, g]));

export function getGenreBySlug(slug: string): GenreInfo | null {
  return BY_SLUG.get(slug.toLowerCase()) ?? null;
}

export function getGenreById(id: number): GenreInfo | null {
  return BY_ID.get(id) ?? null;
}

export function allGenres(): GenreInfo[] {
  return GENRES;
}
