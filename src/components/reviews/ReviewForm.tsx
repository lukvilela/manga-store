"use client";

import { useState } from "react";
import { useReviews } from "@/lib/reviews-store";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

type Props = {
  mangaId: string;
  mangaTitle: string;
  mangaCover: string;
};

const MAX_TEXT = 500;
const MIN_TEXT = 10;

export default function ReviewForm({ mangaId, mangaTitle, mangaCover }: Props) {
  const { add } = useReviews();
  const { user } = useAuth();
  const { show } = useToast();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [hasSpoiler, setHasSpoiler] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const userName = user?.name || "Anônimo";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (rating < 1) {
      show("Escolha uma nota de 1 a 10", "warning");
      return;
    }
    if (text.trim().length < MIN_TEXT) {
      show(`Escreva ao menos ${MIN_TEXT} caracteres`, "warning");
      return;
    }
    if (text.length > MAX_TEXT) {
      show(`Maximo ${MAX_TEXT} caracteres`, "warning");
      return;
    }

    setSubmitting(true);
    try {
      add({
        mangaId,
        mangaTitle,
        mangaCover,
        userName,
        rating,
        text: text.trim(),
        hasSpoiler,
      });
      show("Review publicada!", "success");
      setRating(0);
      setHoverRating(0);
      setText("");
      setHasSpoiler(false);
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <form
      onSubmit={handleSubmit}
      className="relative bg-bg-2 border-2 border-ink shadow-hard p-6 md:p-8"
    >
      <div className="absolute inset-0 halftone opacity-10 pointer-events-none" aria-hidden />

      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <span className="block w-1.5 h-6 bg-akira-red shadow-[3px_3px_0_var(--ink)]" />
          <p className="eyebrow text-akira-red glow-red">
            Sua opiniao / 君の評価
          </p>
        </div>

        {/* Identidade do usuário */}
        <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-4">
          Publicando como{" "}
          <span className="text-akira-cyan">{userName}</span>
        </p>

        {/* Star rating 1-10 interativo */}
        <div className="mb-6">
          <label className="block eyebrow text-ink-muted mb-3">
            Nota{" "}
            {displayRating > 0 && (
              <span className="text-akira-yellow glow-yellow ml-2 numerals">
                {displayRating}/10
              </span>
            )}
          </label>
          <div
            className="flex gap-1"
            onMouseLeave={() => setHoverRating(0)}
            role="radiogroup"
            aria-label="Nota de 1 a 10"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
              const active = n <= displayRating;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  className={`flex-1 max-w-10 aspect-square border-2 font-mono text-sm font-bold transition-all ${
                    active
                      ? "bg-akira-yellow border-ink text-bg shadow-[2px_2px_0_var(--ink)]"
                      : "border-[var(--line)] text-ink-muted hover:border-akira-yellow hover:text-akira-yellow"
                  }`}
                  aria-label={`Dar nota ${n}`}
                  aria-checked={rating === n}
                  role="radio"
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>

        {/* Texto */}
        <div className="mb-4">
          <label
            htmlFor="review-text"
            className="block eyebrow text-ink-muted mb-2"
          >
            Comentario
          </label>
          <textarea
            id="review-text"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
            placeholder="O que voce achou? Sem medo de polemicar..."
            rows={5}
            className="w-full bg-bg border-2 border-[var(--line)] focus:border-akira-red focus:shadow-[0_0_0_3px_rgba(193,18,31,0.25)] outline-none px-4 py-3 text-ink-soft text-sm leading-relaxed font-mono transition-all resize-none"
          />
          <div className="flex justify-between mt-2 text-xs font-mono">
            <span
              className={`${
                text.length < MIN_TEXT
                  ? "text-ink-muted"
                  : "text-akira-cyan"
              }`}
            >
              {text.length < MIN_TEXT
                ? `Faltam ${MIN_TEXT - text.length} caracteres`
                : "OK"}
            </span>
            <span
              className={`numerals ${
                text.length >= MAX_TEXT * 0.9
                  ? "text-akira-red"
                  : "text-ink-muted"
              }`}
            >
              {text.length}/{MAX_TEXT}
            </span>
          </div>
        </div>

        {/* Spoiler checkbox */}
        <label className="flex items-center gap-3 mb-6 cursor-pointer group">
          <input
            type="checkbox"
            checked={hasSpoiler}
            onChange={(e) => setHasSpoiler(e.target.checked)}
            className="sr-only peer"
          />
          <span className="w-5 h-5 border-2 border-[var(--line)] peer-checked:bg-akira-yellow peer-checked:border-ink flex items-center justify-center text-bg font-bold text-xs shadow-[2px_2px_0_var(--ink)] transition-all">
            {hasSpoiler && "X"}
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-ink-soft group-hover:text-akira-yellow transition-colors">
            Contem spoiler / ネタバレ含む
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="shimmer inline-flex items-center gap-3 px-6 py-3 bg-akira-red text-ink font-bold uppercase tracking-widest text-sm border-2 border-ink shadow-hard hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_var(--ink)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{submitting ? "Enviando..." : "Publicar review"}</span>
          <span className="text-lg">→</span>
        </button>
      </div>
    </form>
  );
}
