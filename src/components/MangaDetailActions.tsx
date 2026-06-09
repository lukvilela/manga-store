"use client";

import { useEstante } from "@/lib/estante-store";
import { useToast } from "@/context/ToastContext";

type Props = {
  manga: { id: number; title: string; titleJp: string | null; cover: string };
  text: string;
  isDark: boolean;
};

// CTAs interativos do hero de detalhe. Antes eram <button> sem onClick (mortos):
// "Comprar coleção" agora leva à lista de volumes (onde o add-to-cart real vive)
// e "Adicionar à estante" persiste na estante (wishlist) com feedback via toast.
export default function MangaDetailActions({ manga, text, isDark }: Props) {
  const { add } = useEstante();
  const { show } = useToast();

  const scrollToVolumes = () => {
    const el = document.getElementById("volumes");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.hash = "volumes";
    }
  };

  const addToEstante = () => {
    add(
      {
        id: String(manga.id),
        title: manga.title,
        titleJp: manga.titleJp ?? undefined,
        cover: manga.cover,
      },
      "wishlist"
    );
    show(`"${manga.title}" salvo na sua estante`, "success");
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mt-8">
      <button
        type="button"
        onClick={scrollToVolumes}
        className="shimmer inline-flex items-center gap-3 px-8 py-4 bg-akira-red text-ink font-bold uppercase tracking-widest text-sm border-2 border-ink shadow-hard-lg hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[12px_12px_0_var(--ink)] transition-all"
      >
        <span>Comprar colecao</span>
        <span className="text-lg">→</span>
      </button>
      <button
        type="button"
        onClick={addToEstante}
        className="inline-flex items-center gap-3 px-6 py-4 font-bold uppercase tracking-widest text-sm border-2 hover:bg-ink transition-all"
        style={{ borderColor: text, color: text }}
      >
        <span>+</span>
        <span>Adicionar a estante</span>
      </button>
      <button
        type="button"
        onClick={addToEstante}
        className="inline-flex items-center gap-2 px-4 py-4 border-2 hover:bg-akira-pink hover:text-bg transition-all"
        style={{
          borderColor: isDark ? "var(--akira-pink)" : "rgba(0,0,0,0.7)",
          color: isDark ? "var(--akira-pink)" : "rgba(0,0,0,0.85)",
        }}
        aria-label="Adicionar à wishlist"
      >
        <span>♥</span>
      </button>
    </div>
  );
}
