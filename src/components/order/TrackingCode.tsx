"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";

type Props = {
  code: string;
  available: boolean;
};

export default function TrackingCode({ code, available }: Props) {
  const { show } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (navigator as any).clipboard?.writeText(code);
      setCopied(true);
      show("Codigo copiado!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      show("Nao foi possivel copiar", "error");
    }
  };

  return (
    <div
      className={`relative overflow-hidden border-[2px] p-5 ${
        available
          ? "border-[var(--akira-cyan)] bg-[var(--bg-2)]"
          : "border-dashed border-[var(--line)] bg-[var(--bg-2)] opacity-70"
      }`}
    >
      <div className="absolute inset-0 halftone opacity-10 pointer-events-none" aria-hidden />
      <div className="relative">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="eyebrow !text-[var(--akira-cyan)]">Codigo de rastreio</span>
          <span className="jp text-xs text-[var(--ink-muted)]">追跡番号</span>
        </div>
        {available ? (
          <>
            <p className="font-mono text-xl md:text-2xl font-bold text-[var(--ink)] tracking-widest mb-3 select-all">
              {code}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 border-[2px] border-[var(--akira-cyan)] bg-transparent px-3 py-1.5 text-xs font-mono uppercase tracking-widest text-[var(--akira-cyan)] hover:bg-[var(--akira-cyan)] hover:text-[var(--bg)] transition"
              >
                {copied ? "✓ Copiado" : "Copiar codigo"}
              </button>
              <a
                href={`https://rastreamento.correios.com.br/app/index.php?objeto=${code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border-[2px] border-[var(--line)] bg-transparent px-3 py-1.5 text-xs font-mono uppercase tracking-widest text-[var(--ink-soft)] hover:border-[var(--akira-cyan)] hover:text-[var(--akira-cyan)] transition"
              >
                Rastrear nos Correios →
              </a>
            </div>
            <p className="mt-2 font-mono text-[10px] text-[var(--ink-muted)]">
              {">"} link real dos Correios — codigo mock pode nao ter dados
            </p>
          </>
        ) : (
          <>
            <p className="font-mono text-base text-[var(--ink-muted)] mb-2">
              Disponivel apos o despacho
            </p>
            <p className="font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest">
              {">"} aguarde a etapa &quot;Despachado&quot; pra liberar o rastreio
            </p>
          </>
        )}
      </div>
    </div>
  );
}
