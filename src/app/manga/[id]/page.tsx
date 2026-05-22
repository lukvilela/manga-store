import { notFound } from "next/navigation";
import Header from "@/components/Header";
import MangaDetailHero from "@/components/MangaDetailHero";
import MangaStats from "@/components/MangaStats";
import MangaSynopsis from "@/components/MangaSynopsis";
import MangaVolumes from "@/components/MangaVolumes";
import MangaCarousel from "@/components/MangaCarousel";
import { getMangaById, getMangaRecommendations, toCardData } from "@/lib/manga-api";

export const revalidate = 3600;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const manga = await getMangaById(parseInt(id));
  if (!manga) return { title: "Manga não encontrado — MangaVerse" };
  return {
    title: `${manga.title} — MangaVerse`,
    description: manga.synopsis?.slice(0, 160) || `Detalhes do manga ${manga.title} em MangaVerse.`,
    openGraph: {
      title: `${manga.title} — MangaVerse`,
      description: manga.synopsis?.slice(0, 160),
      images: manga.images?.jpg?.large_image_url ? [manga.images.jpg.large_image_url] : [],
    },
  };
}

export default async function MangaDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const mangaId = parseInt(id);
  if (isNaN(mangaId)) notFound();

  const manga = await getMangaById(mangaId);
  if (!manga) notFound();

  await sleep(400);
  const recommendations = await getMangaRecommendations(mangaId, 12);

  const heroData = {
    ...toCardData(manga),
    status: manga.status,
    chapters: manga.chapters,
    publishing: manga.publishing,
    titleEnglish: manga.title_english,
  };

  return (
    <>
      <Header />
      <MangaDetailHero manga={heroData} />
      <MangaStats manga={manga} />
      <MangaSynopsis manga={manga} />
      <MangaVolumes
        title={manga.title}
        totalVolumes={manga.volumes}
        isPublishing={manga.publishing}
      />

      {recommendations.length > 0 && (
        <MangaCarousel
          title="Se voce gostou disso..."
          subtitle="Recomendacoes"
          jpTitle="おすすめ"
          mangas={recommendations.map(toCardData)}
          accent="violet"
          size="md"
        />
      )}

      <footer className="relative border-t-4 border-akira-red py-12 px-4 md:px-8 overflow-hidden">
        <div className="absolute inset-0 halftone-lg opacity-25 pointer-events-none" aria-hidden />
        <div className="bike-streak" style={{ top: "40%" }} />
        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-3 text-xs font-mono text-ink-muted uppercase tracking-widest">
          <p>© 2026 · MangaVerse · Dados via Jikan API (MyAnimeList)</p>
          <p>
            <span className="text-akira-red glow-red">DOKI!</span> Made in Brasil
          </p>
        </div>
      </footer>
    </>
  );
}
