import type { MetadataRoute } from "next";
import { getTopMangaPaged } from "@/lib/manga-api";
import { MOODS } from "@/lib/moods";
import { allGenres } from "@/lib/genre-map";

/**
 * sitemap.xml gerado server-side. Composto por:
 *  - rotas estaticas (home, listings, comunidade)
 *  - 8 moods e ~10 generos
 *  - top 100 mangas via Jikan (page 1 e 2 paginadas)
 *  - rotas de volumes do top 10 (amostra controlada pro Google nao timeout)
 *
 * Frequencias:
 *  - daily: home + listings + busca
 *  - weekly: details de manga
 *  - monthly: pages secundarias (autor, volumes individuais)
 *
 * Priority:
 *  - 1.0 home
 *  - 0.8 listings principais
 *  - 0.7 mood/genero
 *  - 0.6 details de manga
 *  - 0.4 volumes individuais
 */

const SITE_URL = "https://mangaverse-zeta.vercel.app";
const now = new Date();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,           lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${SITE_URL}/busca`,      lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${SITE_URL}/populares`,  lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${SITE_URL}/trending`,   lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${SITE_URL}/novidades`,  lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${SITE_URL}/comunidade`, lastModified: now, changeFrequency: "weekly",  priority: 0.6 },
    { url: `${SITE_URL}/mood`,       lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
  ];

  const moodRoutes: MetadataRoute.Sitemap = MOODS.map((m) => ({
    url: `${SITE_URL}/mood/${m.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const genreRoutes: MetadataRoute.Sitemap = allGenres().map((g) => ({
    url: `${SITE_URL}/genero/${g.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Top 100 mangas via Jikan — 2 paginas de 50 (Jikan limita 25/page; usa 4 calls)
  // Sequencial pra respeitar rate-limit 3 req/s
  const mangaRoutes: MetadataRoute.Sitemap = [];
  try {
    for (let page = 1; page <= 4; page++) {
      const { data } = await getTopMangaPaged(page, 25);
      for (const m of data) {
        mangaRoutes.push({
          url: `${SITE_URL}/manga/${m.mal_id}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
      // espaca pra nao tomar 429
      if (page < 4) await sleep(400);
    }
  } catch (e) {
    console.error("[sitemap] failed top manga fetch:", e);
  }

  return [...staticRoutes, ...moodRoutes, ...genreRoutes, ...mangaRoutes];
}
