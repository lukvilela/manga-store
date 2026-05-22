"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";
import { useEstante, type EstanteStatus } from "@/lib/estante-store";
import { getSharedListById, type SharedList } from "@/lib/share-store";

const STATUS_META: Record<EstanteStatus, { label: string; jp: string; color: string; kanji: string }> = {
  reading: { label: "Lendo", jp: "読書中", color: "var(--akira-yellow)", kanji: "本" },
  owned: { label: "Tenho", jp: "所有", color: "var(--akira-green)", kanji: "棚" },
  wishlist: { label: "Wishlist", jp: "欲しい", color: "var(--akira-pink)", kanji: "夢" },
};

type Params = Promise<{ id: string }>;

export default function ListaPublicaPage({ params }: { params: Params }) {
  // Next 16 — params e Promise
  const { id } = use(params);
  const { show } = useToast();
  const estante = useEstante();

  const [list, setList] = useState<SharedList | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setList(getSharedListById(id));
    setHydrated(true);

    // sync se a outra aba mexer (revogou, por ex)
    const sync = () => setList(getSharedListById(id));
    window.addEventListener("shared-lists:change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("shared-lists:change", sync);
      window.removeEventListener("storage", sync);
    };
  }, [id]);

  // Loading inicial pre-hidratacao
  if (!hydrated) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-16">
        <div className="panel-frame bg-[var(--bg-2)] p-10 text-center">
          <p className="display text-2xl text-[var(--akira-red)] glow-red pulse-neon">
            CARREGANDO LISTA
          </p>
          <p className="jp text-sm text-[var(--ink-muted)] mt-2">読み込み中</p>
        </div>
      </div>
    );
  }

  // Nao achou no localStorage local — provavelmente outro device
  if (!list) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-16">
        <div className="panel-frame bg-[var(--bg-2)] p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 halftone opacity-10 pointer-events-none" aria-hidden />
          <div className="relative">
            <p className="jp text-[140px] leading-none text-[var(--akira-red)]/30">謎</p>
            <p className="eyebrow !text-[var(--akira-red)] mt-2">404 // Lista nao encontrada</p>
            <h1 className="display text-4xl md:text-5xl text-[var(--ink)] mt-3">
              LISTA INACESSIVEL
            </h1>
            <p className="jp text-lg text-[var(--ink-muted)] mt-2">{id}</p>

            <div className="mt-6 border-2 border-dashed border-[var(--line)] p-5 text-left max-w-md mx-auto">
              <p className="font-mono text-xs text-[var(--ink-soft)] uppercase tracking-wider">
                {">"} essa lista foi compartilhada de outro dispositivo.
              </p>
              <p className="font-mono text-xs text-[var(--ink-muted)] uppercase tracking-wider mt-2">
                {">"} em breve: backend real pra abrir em qualquer device.
              </p>
            </div>

            <div className="mt-6 flex gap-3 justify-center flex-wrap">
              <Link
                href="/conta/estante"
                className="shimmer inline-flex items-center gap-2 border-[3px] border-[var(--ink)] bg-[var(--akira-red)] text-[var(--ink)] px-5 py-3 shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                <span className="display text-sm uppercase tracking-wider">Criar minha lista</span>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 border-[3px] border-[var(--ink)] bg-[var(--bg-3)] text-[var(--ink)] px-5 py-3 shadow-hard hover:bg-[var(--akira-cyan)] hover:text-[var(--bg)] transition-all"
              >
                <span className="display text-sm uppercase tracking-wider">Ir pra home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const meta = STATUS_META[list.status];
  const createdLabel = new Date(list.createdAt).toLocaleDateString("pt-BR");

  const handleCopyAll = () => {
    let added = 0;
    list.items.forEach((item) => {
      // Adiciona como wishlist por padrao no copy — usuario decide depois
      estante.add(
        {
          id: item.id,
          title: item.title,
          titleJp: item.titleJp,
          cover: item.cover,
          series: item.series,
        },
        "wishlist",
      );
      added++;
    });
    show(`${added} manga(s) copiados pra sua wishlist!`, "success");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 space-y-10">
      {/* Hero */}
      <header className="relative panel-frame bg-[var(--bg-2)] p-8 overflow-hidden">
        <div className="absolute inset-0 halftone opacity-10 pointer-events-none" aria-hidden />
        <div
          className="absolute -right-6 -top-6 jp text-[180px] leading-none opacity-15 select-none"
          style={{ color: meta.color }}
          aria-hidden
        >
          リスト
        </div>
        <div className="relative space-y-3">
          <p className="eyebrow" style={{ color: meta.color }}>
            Lista publica // 公開
          </p>
          <h1 className="display text-4xl md:text-6xl text-[var(--ink)] leading-none">
            LISTA DE{" "}
            <span style={{ color: meta.color }}>{list.userName.toUpperCase()}</span>
          </h1>
          <div className="flex items-center gap-3 flex-wrap mt-2">
            <span
              className="inline-flex items-center gap-2 border-2 px-3 py-1 font-mono text-xs uppercase tracking-widest"
              style={{ borderColor: meta.color, color: meta.color }}
            >
              <span className="jp text-base">{meta.kanji}</span>
              {meta.label}
            </span>
            <span className="font-mono text-xs text-[var(--ink-muted)] uppercase">
              {list.items.length} item(s)
            </span>
            <span className="font-mono text-xs text-[var(--ink-muted)] uppercase">
              criada {createdLabel}
            </span>
            <span className="font-mono text-xs text-[var(--ink-muted)] uppercase">
              ID {list.id}
            </span>
          </div>

          <div className="flex gap-3 flex-wrap pt-3">
            <button
              onClick={handleCopyAll}
              disabled={list.items.length === 0}
              className="shimmer inline-flex items-center gap-2 border-[3px] border-[var(--ink)] bg-[var(--akira-red)] text-[var(--ink)] px-5 py-3 shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="display text-sm uppercase tracking-wider">
                + Copiar pra minha estante
              </span>
              <span className="jp text-sm">追加</span>
            </button>
            <Link
              href="/conta/estante"
              className="inline-flex items-center gap-2 border-[3px] border-[var(--ink)] bg-[var(--bg-3)] text-[var(--ink)] px-5 py-3 shadow-hard hover:bg-[var(--akira-cyan)] hover:text-[var(--bg)] transition-all"
            >
              <span className="display text-sm uppercase tracking-wider">Criar minha lista</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Grid */}
      {list.items.length === 0 ? (
        <div className="panel-frame bg-[var(--bg-2)] p-14 text-center">
          <p className="jp text-[120px] leading-none text-[var(--ink-muted)]/30">空</p>
          <p className="display text-3xl text-[var(--ink)] mt-2">LISTA VAZIA</p>
          <p className="font-mono text-xs text-[var(--ink-muted)] uppercase mt-3">
            {">"} essa pessoa nao adicionou nada ainda
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {list.items.map((item) => (
            <li key={item.id} className="card-lift group">
              <div className="border-[2px] border-[var(--ink)] bg-[var(--bg-2)] shadow-hard">
                <Link
                  href={`/manga/${item.id}`}
                  className="block relative aspect-[2/3] overflow-hidden"
                >
                  {item.cover ? (
                    <Image
                      src={item.cover}
                      alt={item.title}
                      fill
                      sizes="(max-width:768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-3)]">
                      <span className="jp text-5xl text-[var(--akira-red)]/40">本</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/95 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-2">
                    <p className="display text-sm text-white line-clamp-2 leading-tight drop-shadow">
                      {item.title}
                    </p>
                    {item.titleJp && (
                      <p className="jp text-[10px] text-white/70 mt-0.5 line-clamp-1">
                        {item.titleJp}
                      </p>
                    )}
                  </div>
                </Link>

                <div className="border-t-2 border-[var(--line)] p-2">
                  <button
                    onClick={() => {
                      estante.add(
                        {
                          id: item.id,
                          title: item.title,
                          titleJp: item.titleJp,
                          cover: item.cover,
                          series: item.series,
                        },
                        "wishlist",
                      );
                      show(`"${item.title}" na sua wishlist`, "success");
                    }}
                    className="w-full border border-[var(--line)] py-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-soft)] hover:border-[var(--akira-pink)] hover:text-[var(--akira-pink)] transition-all"
                  >
                    + minha wishlist
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
