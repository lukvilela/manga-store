import { Suspense } from "react";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import MangaDetailHero from "@/components/MangaDetailHero";
import MangaStats from "@/components/MangaStats";
import MangaSynopsis from "@/components/MangaSynopsis";
import MangaVolumes from "@/components/MangaVolumes";
import MangaCarousel from "@/components/MangaCarousel";
import SocialMetrics from "@/components/social/SocialMetrics";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import PreorderBanner from "@/components/discovery/PreorderBanner";
import BoxSetCard from "@/components/discovery/BoxSetCard";
import CarrosselSkeleton from "@/components/skeletons/CarrosselSkeleton";
import { getMangaById, getMangaRecommendations, toCardData } from "@/lib/manga-api";
import { getPreorder } from "@/lib/preorders-mock";
import { getBoxSet } from "@/lib/box-sets";

// Bloco isolado pra streaming via Suspense: hero/stats/sinopse aparecem
// imediatamente e o carrossel de recomendacoes chega depois com skeleton.
async function Recommendations({ mangaId }: { mangaId: number }) {
  const recommendations = await getMangaRecommendations(mangaId, 12);
  if (recommendations.length === 0) return null;
  return (
    <MangaCarousel
      title="Se voce gostou disso..."
      subtitle="Recomendacoes"
      jpTitle="おすすめ"
      mangas={recommendations.map(toCardData)}
      accent="violet"
      size="md"
    />
  );
}

export const revalidate = 3600;

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
      {manga.publishing && (
        <PreorderBanner
          preorder={getPreorder(manga.mal_id, manga.title, manga.volumes)}
        />
      )}
      <MangaStats manga={manga} />
      <SocialMetrics mangaId={String(manga.mal_id)} />
      <MangaSynopsis manga={manga} />
      <MangaVolumes
        mangaId={manga.mal_id}
        title={manga.title}
        totalVolumes={manga.volumes}
        isPublishing={manga.publishing}
      />

      {manga.volumes && manga.volumes > 1 && (
        <section className="px-4 md:px-8 py-12 border-b border-[var(--line)]">
          <div className="max-w-7xl mx-auto">
            <BoxSetCard
              boxSet={getBoxSet(manga.mal_id, manga.title, manga.volumes)}
              coverUrl={manga.images?.jpg?.large_image_url ?? manga.images?.jpg?.image_url ?? null}
            />
          </div>
        </section>
      )}

      <ReviewsSection
        mangaId={String(manga.mal_id)}
        mangaTitle={manga.title}
        mangaCover={manga.images?.jpg?.image_url || ""}
      />

      <Suspense fallback={<CarrosselSkeleton count={6} showHeader />}>
        <Recommendations mangaId={mangaId} />
      </Suspense>

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
