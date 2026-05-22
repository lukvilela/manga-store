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

/** Top mangás por rank com paginacao (page=1..N, 25 itens por pagina) */
export async function getTopMangaPaged(
  page = 1,
  limit = 25,
  type = "manga"
): Promise<{ data: JikanManga[]; lastPage: number; hasNext: boolean }> {
  try {
    const r = await jikan<JikanManga[]>(`/top/manga?limit=${limit}&type=${type}&page=${page}`);
    return {
      data: r.data,
      lastPage: r.pagination?.last_visible_page ?? 1,
      hasNext: r.pagination?.has_next_page ?? false,
    };
  } catch (e) {
    console.error("[jikan] getTopMangaPaged failed:", e);
    return { data: [], lastPage: 1, hasNext: false };
  }
}

/** Trending — atualmente publicando + ordenado por score desc */
export async function getTrendingManga(limit = 25): Promise<JikanManga[]> {
  try {
    const r = await jikan<JikanManga[]>(
      `/manga?status=publishing&order_by=score&sort=desc&limit=${limit}&min_score=7`
    );
    return r.data;
  } catch (e) {
    console.error("[jikan] getTrendingManga failed:", e);
    return [];
  }
}

/** Novidades — recem comecados (status publishing, ordenado por start_date desc) */
export async function getNovidadesManga(limit = 25): Promise<JikanManga[]> {
  try {
    const r = await jikan<JikanManga[]>(
      `/manga?status=publishing&order_by=start_date&sort=desc&limit=${limit}`
    );
    return r.data;
  } catch (e) {
    console.error("[jikan] getNovidadesManga failed:", e);
    return [];
  }
}

/** Busca mangas por nome do autor (Jikan nao tem filtro author direto no /manga, usa /people search). */
export async function getMangasByAuthorName(
  name: string,
  limit = 20
): Promise<{ author: { mal_id: number; name: string; about: string | null; image: string | null } | null; mangas: JikanManga[] }> {
  if (!name.trim()) return { author: null, mangas: [] };
  try {
    type Person = {
      mal_id: number;
      name: string;
      about: string | null;
      images?: { jpg?: { image_url?: string } };
      manga?: Array<{ position: string; manga: JikanManga }>;
    };
    // 1) Acha pessoa por nome
    const people = await jikan<Person[]>(`/people?q=${encodeURIComponent(name)}&limit=3&order_by=favorites&sort=desc`);
    const person = people.data?.[0];
    if (!person) return { author: null, mangas: [] };

    // 2) Pega /people/:id/full pra ter a lista completa de obras
    const full = await jikan<Person>(`/people/${person.mal_id}/full`);
    const works = full.data.manga ?? [];
    const mangas = works
      .map((w) => w.manga)
      .filter((m): m is JikanManga => !!m)
      .slice(0, limit);

    return {
      author: {
        mal_id: full.data.mal_id,
        name: full.data.name,
        about: full.data.about ?? null,
        image: full.data.images?.jpg?.image_url ?? null,
      },
      mangas,
    };
  } catch (e) {
    console.error("[jikan] getMangasByAuthorName failed:", e);
    return { author: null, mangas: [] };
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
  type ImgVariant = { image_url?: string; small_image_url?: string; large_image_url?: string };
  const images = (m.images || {}) as { jpg?: ImgVariant; webp?: ImgVariant };
  const jpg: ImgVariant = images.jpg || {};
  const webp: ImgVariant = images.webp || {};
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
