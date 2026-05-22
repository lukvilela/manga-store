import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MangaCarousel from "@/components/MangaCarousel";
import MangaSpotlight from "@/components/MangaSpotlight";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import TodayDrop from "@/components/discovery/TodayDrop";
import { getTopManga, getMangaByGenre, getNovidadesManga, toCardData } from "@/lib/manga-api";
import { breadcrumbSchema, jsonLdScript } from "@/lib/structured-data";

// Jikan genre IDs:
// 1=Action 2=Adventure 4=Comedy 8=Drama 10=Fantasy
// 22=Romance 24=Sci-Fi 27=Shounen 42=Seinen 25=Shoujo
// 36=Slice 7=Mystery 14=Horror

export const revalidate = 3600;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export default async function Home() {
  // Sequencial — Jikan rate limit 3/sec
  const topMangas = await getTopManga(20, "manga");
  await sleep(400);
  const shonen = await getMangaByGenre(27, 16);
  await sleep(400);
  const seinen = await getMangaByGenre(42, 16);
  await sleep(400);
  const fantasy = await getMangaByGenre(10, 16);
  await sleep(400);
  const horror = await getMangaByGenre(14, 12);
  await sleep(400);
  const novidades = await getNovidadesManga(12);

  // Spotlights — top 3 do hall of fame
  const spotlight1 = topMangas[0] ? toCardData(topMangas[0]) : null;
  const spotlight2 = topMangas[1] ? toCardData(topMangas[1]) : null;
  const spotlight3 = horror[0] ? toCardData(horror[0]) : null;

  // Today Drop — pick determinístico baseado em dia do mes pra trocar o destaque diariamente
  const dayIdx = new Date().getUTCDate();
  const pickAt = <T,>(arr: T[], offset: number): T | null =>
    arr.length ? arr[(dayIdx + offset) % arr.length] : null;
  const todayNovo = pickAt(novidades, 0);
  const todayTop = pickAt(topMangas, 1);
  const joiaPool = topMangas.filter((m) => (m.score ?? 0) >= 8.5 && (m.rank ?? 0) > 100);
  const todayJoia = pickAt(joiaPool.length ? joiaPool : topMangas, 7);

  // Breadcrumb da home (so 1 nivel, mas valida pro Google ja registrar a tree)
  const homeBreadcrumb = breadcrumbSchema([{ name: "Inicio", url: "/" }]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(homeBreadcrumb) }}
      />
      <Header />
      <Hero />

      {/* Drop do dia — novidade + mais vendido + joia */}
      <TodayDrop
        novo={todayNovo ? toCardData(todayNovo) : null}
        maisVendido={todayTop ? toCardData(todayTop) : null}
        joia={todayJoia ? toCardData(todayJoia) : null}
      />

      {/* Spotlight #1 — Top do mês */}
      {spotlight1 && (
        <MangaSpotlight
          manga={spotlight1}
          label="Pick of the Month"
          jpLabel="今月の一押し"
        />
      )}

      <MangaCarousel
        title="Hall of Fame"
        subtitle="Top Mangas"
        jpTitle="殿堂入り"
        mangas={topMangas.map(toCardData)}
        accent="red"
        size="md"
      />

      {/* Spotlight #2 — Outro destaque */}
      {spotlight2 && (
        <MangaSpotlight
          manga={spotlight2}
          label="Editor's Choice"
          jpLabel="編集者選"
          reverse
        />
      )}

      <MangaCarousel
        title="Shounen — Acao e Aventura"
        subtitle="Shounen Battle"
        jpTitle="少年バトル"
        mangas={shonen.map(toCardData)}
        accent="yellow"
        size="md"
      />

      <MangaCarousel
        title="Seinen — Maduro e Profundo"
        subtitle="Seinen Dark"
        jpTitle="青年ダーク"
        mangas={seinen.map(toCardData)}
        accent="cyan"
        size="md"
      />

      <MangaCarousel
        title="Mundos Fantasticos"
        subtitle="Fantasy World"
        jpTitle="幻想世界"
        mangas={fantasy.map(toCardData)}
        accent="violet"
        size="md"
      />

      {/* Spotlight #3 — Dark/horror */}
      {spotlight3 && (
        <MangaSpotlight
          manga={spotlight3}
          label="Beware The Dark"
          jpLabel="闇の警告"
        />
      )}

      <MangaCarousel
        title="Terror & Horror"
        subtitle="Horror Show"
        jpTitle="恐怖"
        mangas={horror.map(toCardData)}
        accent="pink"
        size="md"
      />

      {/* Newsletter — captacao antes do footer */}
      <section className="px-4 md:px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <Newsletter variant="full" />
        </div>
      </section>

      <Footer />
    </>
  );
}
