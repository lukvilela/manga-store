"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg)]/85 backdrop-blur-md border-b border-[var(--line)]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-3">
          <span className="jp text-akira-red text-2xl font-black glow-red">アキラ</span>
          <span className="display text-2xl md:text-3xl text-ink tracking-tight">
            MANGA<span className="text-akira-red glow-red">VERSE</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-mono uppercase tracking-widest text-ink-soft">
          <Link href="/" className="hover:text-akira-cyan transition-colors">Inicio</Link>
          <Link href="/busca" className="hover:text-akira-cyan transition-colors">Catalogo</Link>
          <Link href="/busca?genre=27" className="hover:text-akira-cyan transition-colors">Shounen</Link>
          <Link href="/busca?genre=42" className="hover:text-akira-cyan transition-colors">Seinen</Link>
        </nav>

        <div className="flex items-center gap-3 md:gap-4 text-sm">
          {user ? (
            <>
              <span className="hidden md:inline text-ink-muted font-mono text-xs uppercase tracking-widest">
                {user.name}
              </span>
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
          <Link
            href="/carrinho"
            className="relative inline-flex items-center justify-center w-10 h-10 rounded border border-akira-red bg-[var(--bg-2)] hover:bg-akira-red hover:text-ink transition-all"
            title="Carrinho"
          >
            <span className="text-lg">🛒</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-akira-pink text-ink text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center font-mono">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
