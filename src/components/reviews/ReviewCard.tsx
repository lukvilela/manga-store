"use client";

import { useState } from "react";
import { useReviews, type Review } from "@/lib/reviews-store";
import { useAuth } from "@/context/AuthContext";
import { getMangaColor } from "@/lib/manga-colors";

type Props = {
  review: Review;
  showMangaInfo?: boolean; // se true, mostra capa/título do manga (feed da comunidade)
};

const COLLAPSE_LIMIT = 200;

function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "agora";
  const min = Math.floor(sec / 60);
  if (min < 60) return `ha ${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `ha ${hr}h`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `ha ${days} dia${days > 1 ? "s" : ""}`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `ha ${weeks} sem`;
  const months = Math.floor(days / 30);
  if (months < 12) return `ha ${months} mes${months > 1 ? "es" : ""}`;
  const years = Math.floor(days / 365);
  return `ha ${years} ano${years > 1 ? "s" : ""}`;
}

export default function ReviewCard({ review, showMangaInfo = false }: Props) {
  const { like, remove } = useReviews();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const [localLikes, setLocalLikes] = useState(review.likes);

  const userName = user?.name || "";
  const isOwner = userName && review.userName === userName;

  const avatarColor = getMangaColor(review.userName);
  const initial = review.userName.charAt(0).toUpperCase() || "?";

  const isLong = review.text.length > COLLAPSE_LIMIT;
  const showFullText = expanded || !isLong;
  const visibleText = showFullText
    ? review.text
    : review.text.slice(0, COLLAPSE_LIMIT).trimEnd() + "...";

  const hideContent = review.hasSpoiler && !spoilerRevealed;

  const handleLike = () => {
    setLocalLikes((n) => n + 1);
    like(review.id);
  };

  const handleRemove = () => {
    if (!confirm("Remover esta review?")) return;
    remove(review.id, userName);
  };

  return (
    <article className="relative bg-bg-2 border-2 border-ink shadow-hard p-5 md:p-6 card-lift transition-all">
      <div className="absolute inset-0 halftone opacity-[0.07] pointer-events-none" aria-hidden />

      <div className="relative">
        {/* Header: avatar + nome + data + rating */}
        <header className="flex items-start gap-3 mb-4">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-ink flex items-center justify-center font-bold text-base shadow-[2px_2px_0_var(--ink)]"
            style={{ background: avatarColor, color: "#fff" }}
            aria-hidden
          >
            {initial}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-mono text-sm font-bold text-ink truncate">
              {review.userName}
            </p>
            <p className="text-xs font-mono text-ink-muted uppercase tracking-widest">
              {relativeTime(review.createdAt)}
            </p>
          </div>

          <div className="flex-shrink-0 px-2.5 py-1 border-2 border-akira-yellow text-akira-yellow font-mono text-sm font-bold flex items-center gap-1 bg-black/30 numerals">
            <span>★</span>
            <span>{review.rating}/10</span>
          </div>
        </header>

        {/* Info do manga (feed da comunidade) */}
        {showMangaInfo && (
          <a
            href={`/manga/${review.mangaId}`}
            className="flex items-center gap-3 mb-4 p-2 border border-[var(--line)] hover:border-akira-cyan transition-colors group"
          >
            {review.mangaCover && (
              <img
                src={review.mangaCover}
                alt={review.mangaTitle}
                className="w-10 h-14 object-cover border border-ink flex-shrink-0"
              />
            )}
            <span className="text-xs font-mono uppercase tracking-widest text-ink-soft group-hover:text-akira-cyan transition-colors">
              {review.mangaTitle}
            </span>
          </a>
        )}

        {/* Spoiler badge + texto */}
        {review.hasSpoiler && (
          <div className="mb-3 inline-flex items-center gap-2 px-2 py-1 bg-akira-yellow text-bg border-2 border-ink font-mono text-[10px] font-bold uppercase tracking-widest shadow-[2px_2px_0_var(--ink)]">
            <span>!</span>
            <span>SPOILER / ネタバレ</span>
          </div>
        )}

        <div className="relative">
          <p
            className={`text-sm md:text-base leading-relaxed text-ink-soft whitespace-pre-wrap transition-all ${
              hideContent ? "blur-md select-none" : ""
            }`}
          >
            {visibleText}
          </p>

          {hideContent && (
            <button
              type="button"
              onClick={() => setSpoilerRevealed(true)}
              className="absolute inset-0 flex items-center justify-center bg-bg-2/40 hover:bg-bg-2/20 transition-all"
            >
              <span className="px-4 py-2 bg-akira-red text-ink font-mono text-xs font-bold uppercase tracking-widest border-2 border-ink shadow-hard">
                Revelar spoiler
              </span>
            </button>
          )}
        </div>

        {!hideContent && isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 text-xs font-mono uppercase tracking-widest text-akira-cyan hover:text-akira-pink transition-colors"
          >
            {expanded ? "Ver menos" : "Ver mais"}
          </button>
        )}

        {/* Footer: like + remove */}
        <footer className="mt-5 pt-4 border-t border-[var(--line)] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleLike}
            className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-[var(--line)] hover:border-akira-pink hover:text-akira-pink font-mono text-xs uppercase tracking-widest text-ink-soft transition-all group"
            aria-label="Curtir review"
          >
            <span className="text-base group-hover:scale-125 transition-transform">
              ♥
            </span>
            <span className="numerals">{localLikes}</span>
          </button>

          {isOwner && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs font-mono uppercase tracking-widest text-ink-muted hover:text-akira-red transition-colors"
            >
              Remover
            </button>
          )}
        </footer>
      </div>
    </article>
  );
}
