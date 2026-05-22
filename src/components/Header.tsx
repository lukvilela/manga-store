"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import MiniCart from "@/components/MiniCart";
import GlobalSearch from "@/components/GlobalSearch";
import StreakBadge from "@/components/gamification/StreakBadge";
import PointsBadge from "@/components/gamification/PointsBadge";
import SfxToggle from "@/components/SfxToggle";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg)]/85 backdrop-blur-md border-b border-[var(--line)]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-3 flex-shrink-0 vt-logo">
          <span className="jp text-akira-red text-2xl font-black glow-red">アキラ</span>
          <span className="display text-2xl md:text-3xl text-ink tracking-tight">
            Akira<span className="text-akira-red glow-red"> Mangás</span>
          </span>
        </Link>

        {/* Busca global — desktop inline, mobile icon */}
        <GlobalSearch />

        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-xs xl:text-sm font-mono uppercase tracking-widest text-ink-soft">
          <Link href="/populares" className="hover:text-akira-red transition-colors">Populares</Link>
          <Link href="/trending" className="hover:text-akira-red transition-colors flex items-center gap-1.5">
            <span>Trending</span>
            <span className="pulse-neon w-1.5 h-1.5 rounded-full bg-akira-red shadow-[0_0_8px_var(--akira-red)]" />
          </Link>
          <Link href="/novidades" className="hover:text-akira-cyan transition-colors">Novidades</Link>
          <Link href="/mood" className="hover:text-akira-pink transition-colors flex items-center gap-1.5">
            <span>Mood</span>
            <span aria-hidden className="text-sm">🎭</span>
          </Link>
          <Link href="/genero/acao" className="hover:text-akira-yellow transition-colors">Generos</Link>
          <Link href="/busca" className="hover:text-akira-pink transition-colors">Catalogo</Link>
          <Link href="/comparar" className="hover:text-akira-yellow transition-colors flex items-center gap-1.5">
            <span>Comparar</span>
            <span className="jp text-akira-yellow text-[10px]">対決</span>
          </Link>
          <Link href="/comunidade" className="hover:text-akira-pink transition-colors flex items-center gap-1.5">
            <span>Comunidade</span>
            <span className="jp text-akira-pink text-[10px]">コミュ</span>
          </Link>
          <Link href="/ranking" className="hover:text-akira-yellow transition-colors flex items-center gap-1.5">
            <span>Ranking</span>
            <span className="jp text-akira-yellow text-[10px]">順位</span>
          </Link>
        </nav>

        <div className="flex items-center gap-3 md:gap-4 text-sm">
          {user ? (
            <>
              <StreakBadge />
              <Link
                href="/conta"
                className="hidden lg:inline-block text-ink-soft hover:text-akira-cyan transition-colors text-xs font-mono uppercase tracking-widest"
              >
                Minha Conta
              </Link>
              <Link
                href="/conta"
                className="hidden md:inline text-ink-muted hover:text-akira-yellow font-mono text-xs uppercase tracking-widest transition-colors"
                title="Ir para minha conta"
              >
                {user.name}
              </Link>
              <button
                onClick={logout}
                className="hidden md:inline-block text-ink-muted hover:text-akira-red transition-colors text-xs font-mono uppercase tracking-widest"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-ink-soft hover:text-akira-cyan transition-colors text-xs font-mono uppercase tracking-widest">
                Entrar
              </Link>
              <Link href="/cadastro" className="hidden md:inline-block text-ink hover:text-akira-pink transition-colors text-xs font-mono uppercase tracking-widest">
                Registrar
              </Link>
            </>
          )}
          <SfxToggle />
          <PointsBadge />
          <MiniCart />
        </div>
      </div>
    </header>
  );
}
