/**
 * Helpers de Schema.org JSON-LD pro SEO rico.
 *
 * Cada funcao retorna um objeto pronto pra serializar como JSON-LD
 * num <script type="application/ld+json"> no head/body de uma pagina.
 *
 * Schemas cobertos:
 *  - organizationSchema()  Organization principal Akira Mangás
 *  - websiteSchema()       WebSite com SearchAction (sitelinks search box)
 *  - productSchema(...)    Product (serie completa OU volume avulso)
 *  - breadcrumbSchema(...) BreadcrumbList pra trilha de navegacao
 */

import type { JikanManga } from "./manga-api";

export const SITE_URL = "https://mangaverse-zeta.vercel.app";
export const SITE_NAME = "Akira Mangás";

type JsonLd = Record<string, unknown>;

export function organizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: "Akira Manga Store",
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    description:
      "Loja de mangas Neo-Tokyo. Catalogo via MyAnimeList, capas em alta, vibracao cyberpunk Akira.",
    sameAs: [
      "https://twitter.com/akiramangas",
      "https://instagram.com/akiramangas",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      areaServed: "BR",
      availableLanguage: ["Portuguese"],
    },
  };
}

export function websiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "pt-BR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/busca?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Preco mock — espelha priceFor() de /manga/[id]/volume/[number]/page.tsx */
function priceForVolume(vol: number): number {
  const base = 29.9;
  return base + (vol % 3 === 0 ? 5 : 0);
}

type ProductOpts = {
  /** Se passar volumeNumber, gera Product do volume; senao Product da serie completa */
  volumeNumber?: number;
};

export function productSchema(manga: JikanManga, opts: ProductOpts = {}): JsonLd {
  const { volumeNumber } = opts;
  const cover =
    manga.images?.webp?.large_image_url ||
    manga.images?.jpg?.large_image_url ||
    manga.images?.jpg?.image_url ||
    "";

  const authorName =
    Array.isArray(manga.authors) && manga.authors[0]?.name
      ? manga.authors[0].name
      : "Desconhecido";

  const genres = Array.isArray(manga.genres)
    ? manga.genres.map((g) => g?.name).filter(Boolean)
    : [];

  const isVolume = typeof volumeNumber === "number";
  const volStr = isVolume ? String(volumeNumber).padStart(2, "0") : null;
  const url = isVolume
    ? `${SITE_URL}/manga/${manga.mal_id}/volume/${volumeNumber}`
    : `${SITE_URL}/manga/${manga.mal_id}`;
  const name = isVolume
    ? `${manga.title} — Volume ${volStr}`
    : manga.title;
  const description = isVolume
    ? `Volume ${volStr} de ${manga.title}. Por ${authorName}. Entrega 3-5 dias uteis.`
    : manga.synopsis?.slice(0, 280) || `Manga ${manga.title} por ${authorName}.`;
  const price = isVolume ? priceForVolume(volumeNumber!) : null;

  const base: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: cover ? [cover] : undefined,
    url,
    sku: isVolume
      ? `AKM-${manga.mal_id}-V${volStr}`
      : `AKM-${manga.mal_id}`,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    category: ["Livros", "HQs e Mangas", ...genres.slice(0, 3)].join(" > "),
  };

  if (manga.authors?.length) {
    base.author = manga.authors.map((a) => ({
      "@type": "Person",
      name: a.name,
    }));
  }

  if (price != null) {
    base.offers = {
      "@type": "Offer",
      url,
      priceCurrency: "BRL",
      price: price.toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
      priceValidUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90)
        .toISOString()
        .slice(0, 10),
    };
  } else if (manga.volumes && manga.volumes > 0) {
    // Faixa de preco da colecao completa
    const total = manga.volumes * 29.9;
    base.offers = {
      "@type": "AggregateOffer",
      url,
      priceCurrency: "BRL",
      lowPrice: "29.90",
      highPrice: total.toFixed(2),
      offerCount: manga.volumes,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    };
  }

  if (manga.score && manga.scored_by) {
    base.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: manga.score.toFixed(2),
      bestRating: "10",
      worstRating: "1",
      ratingCount: manga.scored_by,
    };
  }

  return base;
}

export type BreadcrumbItem = { name: string; url: string };

export function breadcrumbSchema(items: BreadcrumbItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/** Helper pra renderizar inline o JSON-LD num componente sem riscos de XSS */
export function jsonLdScript(schema: JsonLd): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
