"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { EstanteItem, EstanteStatus } from "@/lib/estante-store";
import { useSharedLists, type SharedList } from "@/lib/share-store";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

type Props = {
  items: EstanteItem[];
  status: EstanteStatus;
  onClose: () => void;
};

const STATUS_META: Record<EstanteStatus, { label: string; jp: string; color: string }> = {
  reading: { label: "Lendo", jp: "読書中", color: "var(--akira-yellow)" },
  owned: { label: "Tenho", jp: "所有", color: "var(--akira-green)" },
  wishlist: { label: "Wishlist", jp: "欲しい", color: "var(--akira-pink)" },
};

export default function ShareListModal({ items, status, onClose }: Props) {
  const { user } = useAuth();
  const { show } = useToast();
  const { hydrated, createShare, revokeShare, myShares } = useSharedLists();

  const [userName, setUserName] = useState(user?.name ?? "Otaku Anonimo");
  const [generated, setGenerated] = useState<{ id: string; url: string } | null>(null);
  const meta = STATUS_META[status];

  // Atualiza nome quando user carregar
  useEffect(() => {
    if (user?.name) setUserName(user.name);
  }, [user]);

  const mine: SharedList[] = useMemo(() => (hydrated ? myShares() : []), [hydrated, myShares]);

  const handleGenerate = () => {
    if (items.length === 0) {
      show("Nada pra compartilhar nessa lista", "warning");
      return;
    }
    const result = createShare(items, userName, status);
    setGenerated(result);
    show("Link gerado!", "success");
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      show("Link copiado!", "success");
    } catch {
      show("Nao consegui copiar — copia manual", "error");
    }
  };

  const handleRevoke = (id: string) => {
    revokeShare(id);
    if (generated?.id === id) setGenerated(null);
    show("Link revogado", "info");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="panel-frame bg-[var(--bg-2)] w-full max-w-2xl max-h-[88vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b-2 border-[var(--line)] p-5 flex items-baseline justify-between gap-3">
          <div>
            <p className="eyebrow" style={{ color: meta.color }}>
              Compartilhar // 共有
            </p>
            <p className="display text-2xl text-[var(--ink)] mt-1">
              LISTA{" "}
              <span className="jp text-xl" style={{ color: meta.color }}>
                {meta.jp}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-xs text-[var(--ink-muted)] hover:text-[var(--akira-red)] uppercase"
          >
            [ X ] fechar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Preview */}
          <section>
            <p className="eyebrow !text-[var(--ink-muted)]">Preview // {items.length} item(s)</p>
            {items.length === 0 ? (
              <div className="mt-2 border-2 border-dashed border-[var(--line)] p-6 text-center">
                <p className="jp text-4xl text-[var(--ink-muted)]/40">空</p>
                <p className="font-mono text-xs text-[var(--ink-muted)] uppercase mt-2">
                  {">"} essa lista esta vazia
                </p>
              </div>
            ) : (
              <ul className="mt-2 flex gap-2 overflow-x-auto pb-2">
                {items.slice(0, 12).map((it) => (
                  <li
                    key={it.id}
                    className="relative h-24 w-16 flex-shrink-0 border-2 border-[var(--ink)] overflow-hidden shadow-hard"
                  >
                    {it.cover ? (
                      <Image
                        src={it.cover}
                        alt={it.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-3)]">
                        <span className="jp text-2xl text-[var(--akira-red)]/40">本</span>
                      </div>
                    )}
                  </li>
                ))}
                {items.length > 12 && (
                  <li className="flex h-24 w-16 flex-shrink-0 items-center justify-center border-2 border-dashed border-[var(--line)] font-mono text-[10px] text-[var(--ink-muted)]">
                    +{items.length - 12}
                  </li>
                )}
              </ul>
            )}
          </section>

          {/* Form */}
          <section className="space-y-3">
            <label className="block">
              <span className="eyebrow !text-[var(--akira-cyan)]">Seu nome</span>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Otaku Anonimo"
                maxLength={40}
                className="mt-1 w-full border-[2px] border-[var(--line)] bg-[var(--bg-3)] px-4 py-3 font-mono text-sm text-[var(--ink)] focus:border-[var(--akira-cyan)] outline-none"
              />
            </label>

            <button
              onClick={handleGenerate}
              disabled={items.length === 0}
              className="shimmer w-full inline-flex items-center justify-center gap-3 border-[3px] border-[var(--ink)] bg-[var(--akira-red)] text-[var(--ink)] px-5 py-3 shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="display text-sm uppercase tracking-wider">+ Gerar link</span>
              <span className="jp text-sm">生成</span>
            </button>
          </section>

          {/* Result */}
          {generated && (
            <section className="border-2 border-[var(--akira-cyan)] bg-[var(--bg-3)] p-4 space-y-2 stagger">
              <p className="eyebrow !text-[var(--akira-cyan)]">Link pronto // {generated.id}</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={generated.url}
                  onFocus={(e) => e.currentTarget.select()}
                  className="flex-1 border-[2px] border-[var(--line)] bg-[var(--bg)] px-3 py-2 font-mono text-xs text-[var(--akira-cyan)] truncate"
                />
                <button
                  onClick={() => handleCopy(generated.url)}
                  className="border-[2px] border-[var(--ink)] bg-[var(--akira-cyan)] text-[var(--bg)] px-4 py-2 shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                  <span className="display text-xs uppercase">Copiar</span>
                </button>
              </div>
            </section>
          )}

          {/* Meus shares */}
          <section>
            <p className="eyebrow !text-[var(--ink-muted)]">Meus links // {mine.length}</p>
            {mine.length === 0 ? (
              <p className="mt-2 font-mono text-xs text-[var(--ink-muted)] uppercase">
                {">"} nenhum link gerado ainda
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {mine.map((sh) => {
                  const m = STATUS_META[sh.status];
                  const url =
                    typeof window !== "undefined" ? `${window.location.origin}/lista/${sh.id}` : `/lista/${sh.id}`;
                  return (
                    <li
                      key={sh.id}
                      className="flex items-center gap-3 border border-[var(--line)] bg-[var(--bg-3)] p-2"
                    >
                      <div
                        className="jp text-2xl px-2"
                        style={{ color: m.color }}
                        title={m.label}
                      >
                        {m.jp}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="display text-sm text-[var(--ink)] truncate">{sh.userName}</p>
                        <p className="font-mono text-[10px] text-[var(--ink-muted)] truncate">
                          /lista/{sh.id} • {sh.items.length} item(s)
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopy(url)}
                        className="border border-[var(--line)] px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-soft)] hover:border-[var(--akira-cyan)] hover:text-[var(--akira-cyan)]"
                      >
                        copiar
                      </button>
                      <button
                        onClick={() => handleRevoke(sh.id)}
                        className="border border-[var(--line)] px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-soft)] hover:border-[var(--akira-red)] hover:text-[var(--akira-red)]"
                      >
                        revogar
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
