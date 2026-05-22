"use client";

// MangaPage — renderiza uma "pagina mock" de manga determ baseada no indice.
// Sem imagens externas, tudo CSS/SVG.
// Variantes: capa, painel-grande, dois-paineis, quatro-grid.

import Image from "next/image";

const ONOMATOPEIAS = [
  "BAM!",
  "DOKI!",
  "KAPOW!",
  "ZAP!",
  "BOOM!",
  "WHOOSH",
  "CRASH",
  "FWOOSH",
  "KRAKK",
  "VROOM",
  "DESH!",
  "GUOOOH",
];

const KANJI_FX = ["怒", "閃", "破", "斬", "雷", "炎", "響", "走", "舞", "瞬", "影", "夢"];

type Props = {
  pageIndex: number;          // 0-based
  totalPages: number;
  mangaTitle: string;
  mangaTitleJp?: string | null;
  volumeNumber: number;
  cover?: string | null;
  color: string;
  colorSoft: string;
};

type Variant = "cover" | "single" | "double" | "quad" | "splash";

function pickVariant(i: number): Variant {
  // deterministico baseado no indice
  if (i === 0) return "cover";
  const seq: Variant[] = ["single", "splash", "double", "single", "quad", "double", "splash", "single", "quad"];
  return seq[(i - 1) % seq.length];
}

function pickOnoma(i: number): string {
  return ONOMATOPEIAS[i % ONOMATOPEIAS.length];
}
function pickKanji(i: number): string {
  return KANJI_FX[i % KANJI_FX.length];
}

export default function MangaPage({
  pageIndex,
  totalPages,
  mangaTitle,
  mangaTitleJp,
  volumeNumber,
  cover,
  color,
  colorSoft,
}: Props) {
  const variant = pickVariant(pageIndex);
  const ono = pickOnoma(pageIndex);
  const kanji = pickKanji(pageIndex);

  return (
    <article
      className="relative w-full max-w-3xl mx-auto border-[3px] border-[var(--ink)] shadow-[8px_8px_0_var(--akira-red)] overflow-hidden"
      style={{
        background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${colorSoft} 0%, var(--bg-2) 70%), var(--bg)`,
        aspectRatio: "5 / 7",
      }}
      aria-label={`Pagina ${pageIndex + 1} de ${totalPages}`}
    >
      {/* Halftone overlay */}
      <div className="absolute inset-0 halftone opacity-30 pointer-events-none" aria-hidden />

      {/* Page number canto sup direito */}
      <span className="absolute top-3 right-3 z-30 font-mono text-[10px] uppercase text-[var(--ink-muted)] tracking-widest bg-black/40 px-2 py-1 border border-[var(--line)] numerals">
        {String(pageIndex + 1).padStart(3, "0")} / {String(totalPages).padStart(3, "0")}
      </span>

      {variant === "cover" && (
        <CoverVariant
          mangaTitle={mangaTitle}
          mangaTitleJp={mangaTitleJp}
          volumeNumber={volumeNumber}
          cover={cover}
          color={color}
        />
      )}

      {variant === "single" && (
        <SinglePanel ono={ono} kanji={kanji} color={color} />
      )}

      {variant === "splash" && (
        <SplashPanel ono={ono} kanji={kanji} color={color} />
      )}

      {variant === "double" && (
        <DoublePanel ono={ono} kanji={kanji} color={color} index={pageIndex} />
      )}

      {variant === "quad" && (
        <QuadPanel index={pageIndex} color={color} />
      )}
    </article>
  );
}

// ===== VARIANTES =====

function CoverVariant({
  mangaTitle,
  mangaTitleJp,
  volumeNumber,
  cover,
  color,
}: {
  mangaTitle: string;
  mangaTitleJp?: string | null;
  volumeNumber: number;
  cover?: string | null;
  color: string;
}) {
  return (
    <div
      className="absolute inset-3 border-[3px] border-[var(--ink)] overflow-hidden"
      style={{ background: color }}
    >
      {cover && (
        <Image
          src={cover}
          alt={mangaTitle}
          fill
          sizes="(max-width: 768px) 90vw, 600px"
          className="object-cover opacity-90"
          unoptimized
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
      <div className="absolute inset-x-0 bottom-0 p-6 text-center">
        <p className="eyebrow !text-[var(--akira-yellow)] glow-yellow">Vol {String(volumeNumber).padStart(2, "0")} · CAPA</p>
        <h1
          className="display text-3xl md:text-5xl text-white mt-3 leading-none"
          style={{ textShadow: "3px 3px 0 #000, 0 0 18px rgba(0,0,0,0.8)" }}
        >
          {mangaTitle}
        </h1>
        {mangaTitleJp && (
          <p
            className="jp text-xl md:text-2xl text-white/90 mt-2"
            style={{ textShadow: "2px 2px 0 #000" }}
          >
            {mangaTitleJp}
          </p>
        )}
      </div>
      <div className="absolute top-3 left-3 panel-frame !shadow-[3px_3px_0_var(--akira-red)] !border-2 bg-black/70 px-3 py-2">
        <p className="font-mono text-[10px] text-white uppercase tracking-widest">AKIRA MANGAS</p>
        <p className="jp text-xs text-[var(--akira-cyan)]">公式版</p>
      </div>
    </div>
  );
}

function SinglePanel({ ono, kanji, color }: { ono: string; kanji: string; color: string }) {
  return (
    <div className="absolute inset-3 border-[3px] border-[var(--ink)] flex items-center justify-center overflow-hidden bg-[var(--bg-3)]">
      {/* speed lines radiais */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `repeating-conic-gradient(from 0deg at 50% 50%, ${color} 0deg, transparent 4deg, transparent 8deg)`,
        }}
      />
      <span
        className="jp font-bold leading-none select-none"
        style={{
          fontSize: "min(50vw, 280px)",
          color,
          textShadow: `6px 6px 0 var(--ink), 0 0 60px ${color}`,
        }}
      >
        {kanji}
      </span>
      <span className="onomatopeia absolute top-12 right-10 !text-4xl md:!text-6xl rotate-[-8deg]">
        {ono}
      </span>
    </div>
  );
}

function SplashPanel({ ono, kanji, color }: { ono: string; kanji: string; color: string }) {
  return (
    <div className="absolute inset-3 border-[3px] border-[var(--ink)] overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, ${color} 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, var(--akira-yellow) 0%, transparent 40%),
            var(--bg-warm)
          `,
        }}
      />
      {/* explosao concentrica */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] aspect-square"
        style={{
          background: `repeating-radial-gradient(circle, transparent 0px, transparent 14px, rgba(0,0,0,0.5) 14px, rgba(0,0,0,0.5) 18px)`,
          mask: "radial-gradient(circle, black 0%, transparent 75%)",
        }}
      />
      <span
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 jp font-bold select-none"
        style={{
          fontSize: "min(40vw, 220px)",
          color: "var(--ink)",
          textShadow: `8px 8px 0 ${color}, -2px -2px 0 var(--akira-cyan)`,
        }}
      >
        {kanji}
      </span>
      <span
        className="absolute bottom-10 left-1/2 -translate-x-1/2 onomatopeia !text-5xl md:!text-7xl !px-6 !py-3"
        style={{ transform: "translateX(-50%) rotate(-4deg)" }}
      >
        {ono}
      </span>
    </div>
  );
}

function DoublePanel({
  ono,
  kanji,
  color,
  index,
}: {
  ono: string;
  kanji: string;
  color: string;
  index: number;
}) {
  const flip = index % 2 === 0;
  return (
    <div className="absolute inset-3 border-[3px] border-[var(--ink)] grid grid-rows-2 gap-1 overflow-hidden bg-[var(--bg-3)]">
      <div
        className="relative border-b-[3px] border-[var(--ink)] overflow-hidden"
        style={{ background: flip ? color : "var(--bg-warm)" }}
      >
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background: `repeating-linear-gradient(${flip ? "45deg" : "-45deg"}, transparent 0 22px, rgba(0,0,0,0.4) 22px 24px)`,
          }}
        />
        <span
          className="absolute inset-0 flex items-center justify-center jp font-bold"
          style={{
            fontSize: "min(28vw, 160px)",
            color: "var(--ink)",
            textShadow: `4px 4px 0 ${flip ? "var(--ink)" : color}`,
          }}
        >
          {kanji}
        </span>
        <span className="onomatopeia absolute top-3 right-3 !text-2xl md:!text-3xl">{ono}</span>
      </div>
      <div className="relative overflow-hidden" style={{ background: flip ? "var(--bg-warm)" : color }}>
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${flip ? "70% 30%" : "30% 70%"}, rgba(255,255,255,0.18) 0%, transparent 50%)`,
          }}
        />
        <span
          className="absolute inset-0 flex items-center justify-center jp font-bold opacity-90"
          style={{
            fontSize: "min(22vw, 110px)",
            color: flip ? color : "var(--ink)",
            textShadow: "2px 2px 0 #000",
          }}
        >
          {kanji === "怒" ? "閃" : "響"}
        </span>
        <span className="absolute bottom-3 left-3 font-mono text-[10px] text-white/80 uppercase tracking-widest">
          {">"} silencio.
        </span>
      </div>
    </div>
  );
}

function QuadPanel({ index, color }: { index: number; color: string }) {
  const palette = [color, "var(--akira-yellow)", "var(--akira-pink)", "var(--akira-cyan)"];
  const kanjis = ["走", "閃", "怒", "響"];
  return (
    <div className="absolute inset-3 border-[3px] border-[var(--ink)] grid grid-cols-2 grid-rows-2 gap-1 overflow-hidden bg-[var(--ink)]">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="relative overflow-hidden"
          style={{ background: palette[(i + index) % 4] }}
        >
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: `repeating-linear-gradient(${i % 2 === 0 ? "45deg" : "135deg"}, transparent 0 14px, rgba(0,0,0,0.3) 14px 16px)`,
            }}
          />
          <span
            className="absolute inset-0 flex items-center justify-center jp font-bold"
            style={{
              fontSize: "min(18vw, 90px)",
              color: "var(--bg)",
              textShadow: "3px 3px 0 var(--ink)",
            }}
          >
            {kanjis[(i + index) % 4]}
          </span>
          <span className="absolute top-1 left-1 font-mono text-[8px] text-black/60 uppercase numerals">
            #{i + 1}
          </span>
        </div>
      ))}
    </div>
  );
}
