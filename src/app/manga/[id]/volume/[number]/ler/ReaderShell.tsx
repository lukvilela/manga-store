"use client";

// ReaderShell — client wrapper que gerencia estado de pagina + orientacao
// + dispara gamification +30 XP ao concluir.

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/context/ToastContext";
import { useGamification } from "@/lib/gamification-store";
import { getMangaColor, getMangaColorAlpha } from "@/lib/manga-colors";
import MangaPage from "@/components/reader/MangaPage";
import ReaderControls, { type Orientation } from "@/components/reader/ReaderControls";

type Props = {
  mangaId: number;
  mangaTitle: string;
  mangaTitleJp: string | null;
  volumeNumber: number;
  cover: string | null;
  totalPages: number;
};

export default function ReaderShell({
  mangaId,
  mangaTitle,
  mangaTitleJp,
  volumeNumber,
  cover,
  totalPages,
}: Props) {
  const [page, setPage] = useState(1);
  const [orientation, setOrientation] = useState<Orientation>("vertical");
  const [finished, setFinished] = useState(false);
  const toast = useToast();
  const { addXp } = useGamification();
  const xpFiredRef = useRef(false);

  const color = getMangaColor(mangaTitle);
  const colorSoft = getMangaColorAlpha(mangaTitle, 0.45);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const handleFinish = () => {
    if (xpFiredRef.current) return;
    xpFiredRef.current = true;
    setFinished(true);
    addXp(30, `Concluiu preview do Vol ${volumeNumber} de ${mangaTitle}`);
    toast.show(`Capitulo concluido! +30 XP`, "success", 4000);
  };

  // Auto-trigger no scroll vertical: se atingiu ultima pagina, marca como concluido tambem
  // mas so via swipe horizontal/click "Concluir" pra evitar disparo acidental.

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)]">
      <ReaderControls
        mangaTitle={mangaTitle}
        mangaId={mangaId}
        volumeNumber={volumeNumber}
        cover={cover}
        page={page}
        totalPages={totalPages}
        onPrev={goPrev}
        onNext={goNext}
        orientation={orientation}
        onOrientationChange={setOrientation}
        onFinish={handleFinish}
      />

      <main className="flex-1 py-6 px-3">
        {orientation === "vertical" ? (
          <VerticalReader
            totalPages={totalPages}
            mangaTitle={mangaTitle}
            mangaTitleJp={mangaTitleJp}
            volumeNumber={volumeNumber}
            cover={cover}
            color={color}
            colorSoft={colorSoft}
            currentPage={page}
            onPageInView={setPage}
          />
        ) : (
          <HorizontalReader
            pageIndex={page - 1}
            totalPages={totalPages}
            mangaTitle={mangaTitle}
            mangaTitleJp={mangaTitleJp}
            volumeNumber={volumeNumber}
            cover={cover}
            color={color}
            colorSoft={colorSoft}
          />
        )}

        {finished && (
          <div className="max-w-2xl mx-auto mt-10 panel-frame bg-[var(--bg-2)] p-8 text-center">
            <p className="jp text-7xl text-[var(--akira-green)] glow-green">完</p>
            <p className="display text-2xl text-[var(--ink)] mt-3">PREVIEW CONCLUIDO</p>
            <p className="font-mono text-xs text-[var(--ink-muted)] uppercase tracking-widest mt-2">
              {">"} +30 XP creditados na sua conta
            </p>
            <p className="mt-4 text-sm text-[var(--ink-soft)]">
              Curtiu? Compre o volume oficial e apoie o autor.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

// Vertical: lista todas as paginas em scroll. Usa IntersectionObserver
// pra atualizar o contador "page" ativo no topbar.
function VerticalReader({
  totalPages,
  mangaTitle,
  mangaTitleJp,
  volumeNumber,
  cover,
  color,
  colorSoft,
  currentPage,
  onPageInView,
}: {
  totalPages: number;
  mangaTitle: string;
  mangaTitleJp: string | null;
  volumeNumber: number;
  cover: string | null;
  color: string;
  colorSoft: string;
  currentPage: number;
  onPageInView: (p: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // IO p/ detectar pagina mais visivel
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const idx = Number((visible.target as HTMLElement).dataset.page);
          if (!Number.isNaN(idx)) onPageInView(idx);
        }
      },
      { root: null, threshold: [0.3, 0.6, 0.9] }
    );
    root.querySelectorAll("[data-page]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [onPageInView, totalPages]);

  // Quando currentPage muda via botoes/teclado, scroll suave pra pagina
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const target = root.querySelector(`[data-page="${currentPage}"]`) as HTMLElement | null;
    if (target) {
      const rect = target.getBoundingClientRect();
      // So scroll se estiver fora do viewport
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [currentPage]);

  return (
    <div ref={containerRef} className="space-y-6">
      {Array.from({ length: totalPages }, (_, i) => (
        <div key={i} data-page={i + 1}>
          <MangaPage
            pageIndex={i}
            totalPages={totalPages}
            mangaTitle={mangaTitle}
            mangaTitleJp={mangaTitleJp}
            volumeNumber={volumeNumber}
            cover={cover}
            color={color}
            colorSoft={colorSoft}
          />
        </div>
      ))}
    </div>
  );
}

// Horizontal: 1 pagina por vez, navegacao via botoes/teclas
function HorizontalReader(props: {
  pageIndex: number;
  totalPages: number;
  mangaTitle: string;
  mangaTitleJp: string | null;
  volumeNumber: number;
  cover: string | null;
  color: string;
  colorSoft: string;
}) {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <MangaPage
        pageIndex={props.pageIndex}
        totalPages={props.totalPages}
        mangaTitle={props.mangaTitle}
        mangaTitleJp={props.mangaTitleJp}
        volumeNumber={props.volumeNumber}
        cover={props.cover}
        color={props.color}
        colorSoft={props.colorSoft}
      />
    </div>
  );
}
