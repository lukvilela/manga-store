"use client";

/**
 * Botoes "Trocar lados" e "Comparar com outro" da tela de comparacao.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = { aId: number; bId: number };

export default function CompareActions({ aId, bId }: Props) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <button
        type="button"
        onClick={() => router.push(`/comparar?a=${bId}&b=${aId}`)}
        className="px-5 py-3 border-2 border-akira-cyan text-akira-cyan hover:bg-akira-cyan hover:text-bg font-mono text-xs uppercase tracking-widest transition-all"
      >
        ⇄ Trocar lados
      </button>
      <Link
        href="/comparar"
        className="px-5 py-3 border-2 border-akira-yellow text-akira-yellow hover:bg-akira-yellow hover:text-bg font-mono text-xs uppercase tracking-widest transition-all"
      >
        Comparar com outro
      </Link>
    </div>
  );
}
