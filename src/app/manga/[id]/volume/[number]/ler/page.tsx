// Reader page (server component)
// Busca manga via Jikan + capa real do volume via MangaDex.
// Renderiza client wrapper ReaderShell.

import { notFound } from "next/navigation";
import { getMangaById } from "@/lib/manga-api";
import { getVolumeCoverByTitleAndNumber } from "@/lib/mangadex-api";
import ReaderShell from "./ReaderShell";

export const revalidate = 3600;

type Params = { id: string; number: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id, number } = await params;
  const mangaId = parseInt(id);
  const volNum = parseInt(number);
  if (isNaN(mangaId) || isNaN(volNum)) {
    return { title: "Leitor — Akira Mangas" };
  }
  const manga = await getMangaById(mangaId);
  if (!manga) return { title: "Leitor — Akira Mangas" };
  return {
    title: `Lendo ${manga.title} — Vol ${String(volNum).padStart(2, "0")} | Akira Mangas`,
    description: `Preview visual do volume ${volNum} de ${manga.title}.`,
  };
}

export default async function ReaderPage({ params }: { params: Promise<Params> }) {
  const { id, number } = await params;
  const mangaId = parseInt(id);
  const volNum = parseInt(number);

  if (isNaN(mangaId) || isNaN(volNum) || volNum < 1) notFound();

  const manga = await getMangaById(mangaId);
  if (!manga) notFound();

  // Mesma logica do /volume/[number]/page.tsx pra coerencia
  const maxAllowed = manga.volumes
    ? manga.publishing
      ? manga.volumes + 5
      : manga.volumes
    : 999;
  if (volNum > maxAllowed) notFound();

  const volumeCover = await getVolumeCoverByTitleAndNumber(manga.title, volNum);
  const cover = volumeCover ?? manga.images?.jpg?.large_image_url ?? null;

  // Total de paginas mock: determ baseado no mangaId+volume (entre 8 e 12)
  const totalPages = 8 + ((mangaId + volNum * 3) % 5);

  return (
    <ReaderShell
      mangaId={mangaId}
      mangaTitle={manga.title}
      mangaTitleJp={manga.title_japanese}
      volumeNumber={volNum}
      cover={cover}
      totalPages={totalPages}
    />
  );
}
