import { notFound } from "next/navigation";
import Header from "@/components/Header";
import VolumeProductHero from "@/components/VolumeProductHero";
import VolumeDetails from "@/components/VolumeDetails";
import RelatedVolumes from "@/components/RelatedVolumes";
import MangaCarousel from "@/components/MangaCarousel";
import {
  getMangaById,
  getMangaRecommendations,
  toCardData,
} from "@/lib/manga-api";
import { productSchema, breadcrumbSchema, jsonLdScript } from "@/lib/structured-data";

export const revalidate = 3600;

type Params = { id: string; number: string };

// Preco mock determinstico — mesma regra usada em MangaVolumes
function priceFor(vol: number): number {
  const base = 29.9;
  const variant = vol % 3 === 0 ? 5 : 0;
  return base + variant;
}

const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id, number } = await params;
  const mangaId = parseInt(id);
  const volNum = parseInt(number);

  if (isNaN(mangaId) || isNaN(volNum)) {
    return { title: "Volume nao encontrado — Akira Mangás" };
  }

  const manga = await getMangaById(mangaId);
  if (!manga) return { title: "Volume nao encontrado — Akira Mangás" };

  const volStr = String(volNum).padStart(2, "0");
  const title = `${manga.title} — Volume ${volStr} | Akira Mangás`;
  const description = `Compre o Volume ${volStr} de ${manga.title} por ${fmtBRL(
    priceFor(volNum)
  )}. Entrega em 3-5 dias. Frete gratis acima de R$150.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: manga.images?.jpg?.large_image_url
        ? [manga.images.jpg.large_image_url]
        : [],
    },
  };
}

export default async function VolumeDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id, number } = await params;

  const mangaId = parseInt(id);
  const volNum = parseInt(number);

  if (isNaN(mangaId) || isNaN(volNum) || volNum < 1) notFound();

  const manga = await getMangaById(mangaId);
  if (!manga) notFound();

  // Se a serie ja terminou e o volume excede o total — 404.
  // Se publishing, aceita ate +5 alem do registrado (volumes recentes podem nao estar no Jikan ainda).
  const maxAllowed = manga.volumes
    ? manga.publishing
      ? manga.volumes + 5
      : manga.volumes
    : 999;
  if (volNum > maxAllowed) notFound();

  const totalVolumes = manga.volumes ?? volNum;
  const price = priceFor(volNum);

  const heroData = {
    ...toCardData(manga),
    status: manga.status,
    chapters: manga.chapters,
    publishing: manga.publishing,
    titleEnglish: manga.title_english,
  };

  const recommendations = await getMangaRecommendations(mangaId, 8);

  // Structured data: Product do volume + Breadcrumb completo
  const volStr = String(volNum).padStart(2, "0");
  const productJson = productSchema(manga, { volumeNumber: volNum });
  const breadcrumbJson = breadcrumbSchema([
    { name: "Inicio", url: "/" },
    { name: "Catalogo", url: "/busca" },
    { name: manga.title, url: `/manga/${mangaId}` },
    { name: `Volume ${volStr}`, url: `/manga/${mangaId}/volume/${volNum}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(productJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJson) }}
      />
      <Header />

      <VolumeProductHero
        manga={heroData}
        volumeNumber={volNum}
        totalVolumes={totalVolumes}
        price={price}
      />

      <VolumeDetails
        mangaTitle={manga.title}
        mangaId={mangaId}
        volumeNumber={volNum}
        totalVolumes={totalVolumes}
        isPublishing={manga.publishing}
        synopsis={manga.synopsis}
      />

      <RelatedVolumes
        mangaId={mangaId}
        mangaTitle={manga.title}
        totalVolumes={totalVolumes}
        currentVolume={volNum}
      />

      {recommendations.length > 0 && (
        <MangaCarousel
          title="Comprou junto · voce pode gostar"
          subtitle="Recomendados"
          jpTitle="関連商品"
          mangas={recommendations.slice(0, 4).map(toCardData)}
          accent="pink"
          size="md"
        />
      )}

      <footer className="relative border-t-4 border-akira-red py-12 px-4 md:px-8 overflow-hidden">
        <div
          className="absolute inset-0 halftone-lg opacity-25 pointer-events-none"
          aria-hidden
        />
        <div className="bike-streak" style={{ top: "40%" }} />
        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-3 text-xs font-mono text-ink-muted uppercase tracking-widest">
          <p>© 2026 · Akira Mangás · Dados via Jikan API (MyAnimeList)</p>
          <p>
            <span className="text-akira-red glow-red">DOKI!</span> Made in Brasil
          </p>
        </div>
      </footer>
    </>
  );
}
