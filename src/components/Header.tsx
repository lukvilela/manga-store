"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const { count } = useCart();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-[#dc2626] shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[11px] font-black uppercase tracking-widest text-[#dc2626] shadow">
            AK
          </div>
          <span className="text-lg font-black uppercase tracking-widest text-white">
            Akira Mangas
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1.5">
          <Link
            href="/"
            className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-white/80 hover:bg-white/15 hover:text-white"
          >
            Inicio
          </Link>
          <Link
            href="/busca"
            className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-white/80 hover:bg-white/15 hover:text-white"
          >
            Catalogo
          </Link>
          <Link
            href="/carrinho"
            className="relative rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold text-white hover:bg-white/25"
          >
            Carrinho
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-black text-[#dc2626]">
                {count}
              </span>
            )}
          </Link>
          <Link
            href="/checkout"
            className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-[#dc2626] hover:bg-red-50"
          >
            Checkout
          </Link>

          {user ? (
            <button
              onClick={logout}
              className="ml-1 text-xs font-semibold text-white/60 hover:text-white"
            >
              Sair
            </button>
          ) : (
            <Link
              href="/login"
              className="ml-1 text-xs font-semibold text-white/60 hover:text-white"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
