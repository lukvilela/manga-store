/**
 * Cliente Jikan API v4 (MyAnimeList unofficial, free, no auth).
 *
 * Docs: https://docs.api.jikan.moe/
 * Rate: 3 req/s, 60 req/min
 *
 * Usado em SSR pra puxar trending/popular/by-genre/search.
 * Next ISR (revalidate) cacheia 1h pra não bater 60/min.
 */

const BASE = "https://api.jikan.moe/v4";

export type JikanManga = {
  mal_id: number;
  url: string;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  type: string;
  chapters: number | null;
  volumes: number | null;
  status: string;
  publishing: boolean;
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  synopsis: string | null;
  background: string | null;
  authors: Array<{ mal_id: number; name: string }>;
  genres: Array<{ mal_id: number; name: string }>;
  demographics: Array<{ mal_id: number; name: string }>;
  themes: Array<{ mal_id: number; name: string }>;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
    webp?: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
};

type JikanResponse<T> = {
  data: T;
  pagination?: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: { count: number; total: number; per_page: number };
  };
};

async function jikan<T>(path: string, revalidate = 3600): Promise<JikanResponse<T>> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Jikan ${res.status}: ${path}`);
  }
  return res.json();
}

/** Top mangás por rank. Type pode filtrar (manga, manhwa, novel etc) */
export async function getTopManga(limit = 20, type = "manga"): Promise<JikanManga[]> {
  try {
    const r = await jikan<JikanManga[]>(`/top/manga?limit=${limit}&type=${type}`);
    return r.data;
  } catch (e) {
    console.error("[jikan] getTopManga failed:", e);
    return [];
  }
}

/** Manga por gênero (1=Action, 22=Romance, 27=Shounen, 42=Seinen, 8=Drama, 10=Fantasy, etc) */
export async function getMangaByGenre(genreId: number, limit = 20): Promise<JikanManga[]> {
  try {
    const r = await jikan<JikanManga[]>(`/manga?genres=${genreId}&order_by=score&sort=desc&limit=${limit}`);
    return r.data;
  } catch (e) {
    console.error("[jikan] getMangaByGenre failed:", e);
    return [];
  }
}

/** Search por nome */
export async function searchManga(query: string, limit = 12): Promise<JikanManga[]> {
  if (!query.trim()) return [];
  try {
    const r = await jikan<JikanManga[]>(`/manga?q=${encodeURIComponent(query)}&limit=${limit}&order_by=popularity`);
    return r.data;
  } catch (e) {
    console.error("[jikan] searchManga failed:", e);
    return [];
  }
}

/** Detalhes de um manga */
export async function getMangaById(id: number): Promise<JikanManga | null> {
  try {
    const r = await jikan<JikanManga>(`/manga/${id}/full`);
    return r.data;
  } catch (e) {
    console.error("[jikan] getMangaById failed:", e);
    return null;
  }
}

/** Recommendations pra um manga específico */
export async function getMangaRecommendations(id: number, limit = 6) {
  try {
    type Rec = { entry: JikanManga };
    const r = await jikan<Rec[]>(`/manga/${id}/recommendations`);
    return r.data.slice(0, limit).map((x) => x.entry);
  } catch (e) {
    console.error("[jikan] getMangaRecommendations failed:", e);
    return [];
  }
}

/** Helper pra normalizar pra um shape compacto usado nos cards */
export type MangaCardData = {
  id: number;
  title: string;
  titleJp: string | null;
  cover: string;
  score: number | null;
  rank: number | null;
  volumes: number | null;
  genres: string[];
  demographic: string | null;
  author: string | null;
  synopsis: string | null;
};

export function toCardData(m: JikanManga): MangaCardData {
  // Defensivo: Jikan as vezes retorna mangás com campos faltando
  const images = m.images || {};
  const jpg = images.jpg || {};
  const webp = images.webp || {};
  const cover = webp.large_image_url || jpg.large_image_url || jpg.image_url || "";

  return {
    id: m.mal_id,
    title: m.title || "Sem título",
    titleJp: m.title_japanese ?? null,
    cover,
    score: m.score ?? null,
    rank: m.rank ?? null,
    volumes: m.volumes ?? null,
    genres: Array.isArray(m.genres) ? m.genres.map((g) => g?.name).filter(Boolean).slice(0, 3) : [],
    demographic: Array.isArray(m.demographics) && m.demographics[0]?.name ? m.demographics[0].name : null,
    author: Array.isArray(m.authors) && m.authors[0]?.name ? m.authors[0].name : null,
    synopsis: m.synopsis ?? null,
  };
}
