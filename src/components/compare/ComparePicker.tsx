"use client";

/**
 * Orquestra os 2 pickers + botao "Comparar". Pure client wrapper.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import MangaPickerInput from "./MangaPickerInput";
import VsDivider from "./VsDivider";

export default function ComparePicker() {
  const router = useRouter();
  const [aId, setAId] = useState<number | null>(null);
  const [bId, setBId] = useState<number | null>(null);
  const [aTitle, setATitle] = useState("");
  const [bTitle, setBTitle] = useState("");

  const canCompare = aId != null && bId != null && aId !== bId;

  const compare = () => {
    if (!canCompare) return;
    router.push(`/comparar?a=${aId}&b=${bId}`);
  };

  return (
    <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="block w-1.5 h-8 bg-akira-yellow shadow-[3px_3px_0_var(--ink)]" />
          <span className="eyebrow text-akira-yellow glow-yellow">VS MODE / 対決</span>
          <span className="block w-1.5 h-8 bg-akira-yellow shadow-[3px_3px_0_var(--ink)]" />
        </div>
        <h1 className="display text-5xl md:text-7xl leading-[0.9] mb-4">
          <span className="block text-akira-red glow-red">COMPARAR</span>
          <span className="block">MANGÁS.</span>
        </h1>
        <p className="text-base md:text-lg text-ink-soft max-w-xl mx-auto">
          Escolha 2 series e veja quem domina nas stats: score, rank, popularidade, volumes e capitulos.
        </p>
      </div>

      {/* Pickers + VS */}
      <div className="flex flex-col md:flex-row items-stretch gap-6 mb-10">
        <MangaPickerInput
          side="a"
          selectedId={aId}
          initialTitle={aTitle}
          onPick={(id, title) => {
            setAId(id);
            setATitle(title);
          }}
        />
        <VsDivider />
        <MangaPickerInput
          side="b"
          selectedId={bId}
          initialTitle={bTitle}
          onPick={(id, title) => {
            setBId(id);
            setBTitle(title);
          }}
        />
      </div>

      {/* CTA */}
      <div className="text-center">
        <button
          type="button"
          onClick={compare}
          disabled={!canCompare}
          className={`px-10 py-5 border-2 border-ink shadow-hard-lg font-bold uppercase tracking-widest text-base transition-all ${
            canCompare
              ? "bg-akira-red text-ink hover:shadow-[12px_12px_0_var(--akira-yellow)] cursor-pointer"
              : "bg-bg-3 text-ink-muted cursor-not-allowed opacity-60"
          }`}
        >
          {canCompare ? "Comparar AGORA →" : "Escolha 2 mangas"}
        </button>
        {aId != null && bId != null && aId === bId && (
          <p className="mt-3 text-xs font-mono text-akira-red">
            Escolha 2 mangás diferentes!
          </p>
        )}
      </div>
    </div>
  );
}
