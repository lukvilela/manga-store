import type { MetadataRoute } from "next";

/**
 * robots.txt gerado server-side pelo Next.
 * Allow geral; bloqueia rotas internas (API, conta pessoal, area de pedido).
 * Sitemap apontando pra URL absoluta — Google exige absoluto.
 */

const SITE_URL = "https://mangaverse-zeta.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/conta/",
          "/pedido/",
          "/checkout/",
          "/carrinho/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
