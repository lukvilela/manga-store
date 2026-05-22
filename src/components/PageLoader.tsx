"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Barra de progresso fininha no topo durante navegacao.
 *
 * Next 16 nao expoe eventos de roteamento publicos (router.events foi removido
 * na App Router). Estrategia: detectar click em <a href> interno via capture
 * listener, ligar a barra, e desligar quando pathname/searchParams mudarem
 * (= rota nova ja renderizou). Cobre 99% dos casos de SPA navigation.
 *
 * useSearchParams precisa estar dentro de Suspense pra prerender funcionar.
 */
function PageLoaderInner() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const search = useSearchParams();

  // Desliga sempre que rota terminar (pathname/search mudam).
  // Microtask defer pra evitar setState sincrono no effect (React 19 lint).
  useEffect(() => {
    queueMicrotask(() => setLoading(false));
  }, [pathname, search]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function isInternalLink(target: EventTarget | null): HTMLAnchorElement | null {
      if (!(target instanceof Element)) return null;
      const a = target.closest("a");
      if (!a) return null;
      const href = a.getAttribute("href");
      if (!href) return null;
      if (
        href.startsWith("http") ||
        href.startsWith("//") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        a.target === "_blank" ||
        a.hasAttribute("download")
      ) {
        return null;
      }
      return a;
    }

    function onClick(e: MouseEvent) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const a = isInternalLink(e.target);
      if (!a) return;
      try {
        const url = new URL(a.href, window.location.href);
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        ) {
          return;
        }
      } catch {}
      setLoading(true);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <div
      aria-hidden
      className="page-loader"
      data-active={loading}
    />
  );
}

export default function PageLoader() {
  return (
    <Suspense fallback={null}>
      <PageLoaderInner />
    </Suspense>
  );
}
