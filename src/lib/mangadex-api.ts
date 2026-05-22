/**
 * Cliente MangaDex API.
 *
 * Por que usar (alem do Jikan):
 * - MangaDex tem CAPAS POR VOLUME (Jikan/MAL so tem capa principal)
 * - Tem traducoes oficiais e nomes alternativos
 * - Free, sem auth pra read
 *
 * Docs: https://api.mangadex.org/docs/
 *
 * Limites: 5 req/sec global. Usa ISR pra cachear.
 */

const BASE = "https://api.mangadex.org";
const COVERS_BASE = "https://uploads.mangadex.org/covers";

type MdxAttributes = {
  title?: Record<string, string>;
  altTitles?: Array<Record<string, string>>;
  description?: Record<string, string>;
  year?: number | null;
  status?: string;
  lastVolume?: string | null;
};

export type MdxManga = {
  id: string;
  type: "manga";
  attributes: MdxAttributes;
  relationships?: Array<{ id: string; type: string; attributes?: any }>;
};

export type MdxCover = {
  id: string;
  attributes: {
    volume: string | null;
    fileName: string;
    description?: string;
    locale?: string;
  };
  relationships?: Array<{ id: string; type: string }>;
};

export type VolumeCoverData = {
  volumeNumber: string;       // "1", "2", "10", etc
  coverUrl: string;           // URL alta resolucao
  coverUrlSmall: string;      // URL thumbnail
  locale: string | null;
};

async function mdx<T>(path: string, revalidate = 3600): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`MangaDex ${res.status}: ${path}`);
  return res.json();
}

/** Search manga por título. Retorna primeiros resultados (limit). */
export async function searchMangaMdx(title: string, limit = 5): Promise<MdxManga[]> {
  if (!title.trim()) return [];
  try {
    const params = new URLSearchParams({
      title,
      limit: String(limit),
      "order[relevance]": "desc",
      "includes[]": "cover_art",
    });
    const r = await mdx<{ data: MdxManga[] }>(`/manga?${params}`);
    return r.data || [];
  } catch (e) {
    console.error("[mangadex] searchManga failed:", e);
    return [];
  }
}

/**
 * Lista todas as capas (uma por volume) de um manga MangaDex.
 * Retorna ordenado por número de volume (asc).
 */
export async function getCoversByMangaId(mangaId: string, locale?: string): Promise<VolumeCoverData[]> {
  if (!mangaId) return [];
  try {
    const params = new URLSearchParams({
      "manga[]": mangaId,
      "order[volume]": "asc",
      limit: "100",
    });
    if (locale) params.append("locales[]", locale);

    const r = await mdx<{ data: MdxCover[] }>(`/cover?${params}`);
    return (r.data || [])
      .filter((c) => c.attributes.volume) // só com volume definido
      .map((c) => ({
        volumeNumber: c.attributes.volume!,
        coverUrl: `${COVERS_BASE}/${mangaId}/${c.attributes.fileName}`,
        coverUrlSmall: `${COVERS_BASE}/${mangaId}/${c.attributes.fileName}.256.jpg`,
        locale: c.attributes.locale ?? null,
      }));
  } catch (e) {
    console.error("[mangadex] getCovers failed:", e);
    return [];
  }
}

/**
 * Helper de alto nível: busca o melhor match no MangaDex pelo título do Jikan
 * + retorna todas as capas por volume.
 *
 * Cache 24h porque dados de capa raramente mudam.
 */
export async function getVolumeCoversByTitle(title: string): Promise<VolumeCoverData[]> {
  const matches = await searchMangaMdx(title, 3);
  if (matches.length === 0) return [];

  // Match exato preferencial, senão usa primeiro
  const exactMatch = matches.find((m) => {
    const titles = [
      ...Object.values(m.attributes.title || {}),
      ...(m.attributes.altTitles || []).flatMap((a) => Object.values(a)),
    ];
    return titles.some((t) => t.toLowerCase() === title.toLowerCase());
  });

  const chosen = exactMatch || matches[0];
  return getCoversByMangaId(chosen.id);
}

/**
 * Helper: dado um título + número de volume desejado, tenta retornar a capa específica.
 * Se não achar, retorna null (chamador deve fallback pra capa da série).
 */
export async function getVolumeCoverByTitleAndNumber(
  title: string,
  volumeNumber: number | string,
): Promise<string | null> {
  const covers = await getVolumeCoversByTitle(title);
  if (covers.length === 0) return null;

  const volStr = String(volumeNumber);
  const match = covers.find((c) => c.volumeNumber === volStr);
  return match?.coverUrl ?? null;
}
