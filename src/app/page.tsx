import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MangaCarousel from "@/components/MangaCarousel";
import MangaSpotlight from "@/components/MangaSpotlight";
import { getTopManga, getMangaByGenre, toCardData } from "@/lib/manga-api";

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

  // Spotlights — top 3 do hall of fame
  const spotlight1 = topMangas[0] ? toCardData(topMangas[0]) : null;
  const spotlight2 = topMangas[1] ? toCardData(topMangas[1]) : null;
  const spotlight3 = horror[0] ? toCardData(horror[0]) : null;

  return (
    <>
      <Header />
      <Hero />

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

      {/* Footer Akira-style */}
      <footer className="relative border-t-4 border-akira-red mt-8 py-16 px-4 md:px-8 overflow-hidden">
        <div className="absolute inset-0 halftone-lg opacity-30 pointer-events-none" aria-hidden />
        <div className="bike-streak" style={{ top: "30%" }} />

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-8">
            <div>
              <p className="jp text-akira-red text-3xl font-black glow-red mb-2">アキラ</p>
              <p className="display text-4xl md:text-5xl">
                MANGA<span className="text-akira-red glow-red">VERSE</span>
                <span className="text-akira-red">.</span>
              </p>
              <p className="jp text-base text-ink-muted mt-2">漫画ヴァース · Neo-Tokyo · 2026</p>
            </div>
            <div className="flex gap-6 eyebrow flex-wrap">
              <span className="text-akira-red glow-red text-xl">DOKI!</span>
              <span className="text-akira-cyan glow-cyan text-xl">ZAP!</span>
              <span className="text-akira-pink glow-pink text-xl">BAM!</span>
              <span className="text-akira-yellow glow-yellow text-xl">KAPOW!</span>
              <span className="text-akira-violet glow-violet text-xl">CRASH!</span>
            </div>
          </div>
          <div className="pt-6 border-t border-[var(--line)] flex flex-col md:flex-row justify-between gap-3 text-xs font-mono text-ink-muted uppercase tracking-widest">
            <p>© 2026 · Powered by Jikan API (MyAnimeList)</p>
            <p>Made in <span className="text-akira-red">Brasil</span> · Inspired by <span className="text-akira-yellow">Otomo Katsuhiro</span></p>
          </div>
        </div>
      </footer>
    </>
  );
}
