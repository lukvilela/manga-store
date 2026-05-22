"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEstante } from "@/lib/estante-store";
import { useAddresses } from "@/lib/addresses-store";
import { useGamification } from "@/lib/gamification-store";
import { BADGES } from "@/lib/badges";
import { useEffect, useState } from "react";

type OrderSummary = { orderId: string };

function useOrdersCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const read = () => {
      if (typeof window === "undefined") return;
      let total = 0;
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith("order:")) total += 1;
      }
      setCount(total);
    };
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);
  return count;
}

const LINKS: Array<{
  href: string;
  label: string;
  kanji: string;
  match: (path: string) => boolean;
  statKey: "orders" | "estante" | "addresses" | "points" | "badges";
}> = [
  { href: "/conta", label: "Dashboard", kanji: "家", match: (p) => p === "/conta", statKey: "points" },
  { href: "/conta/pedidos", label: "Pedidos", kanji: "注", match: (p) => p.startsWith("/conta/pedidos"), statKey: "orders" },
  { href: "/conta/estante", label: "Estante", kanji: "棚", match: (p) => p.startsWith("/conta/estante"), statKey: "estante" },
  { href: "/conta/conquistas", label: "Conquistas", kanji: "勲", match: (p) => p.startsWith("/conta/conquistas"), statKey: "badges" },
  { href: "/conta/enderecos", label: "Enderecos", kanji: "宅", match: (p) => p.startsWith("/conta/enderecos"), statKey: "addresses" },
];

export default function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const estante = useEstante();
  const addresses = useAddresses();
  const ordersCount = useOrdersCount();
  const { state: gami, hydrated: gamiHydrated } = useGamification();

  const stats = {
    orders: ordersCount,
    estante: estante.count(),
    addresses: addresses.count,
    points: gamiHydrated ? gami.points : 0,
    badges: gamiHydrated ? `${gami.badges.length}/${BADGES.length}` : `0/${BADGES.length}`,
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <aside className="sticky top-24 space-y-5">
      {/* Card identidade */}
      <div className="panel-frame bg-[var(--bg-2)] p-5">
        <p className="eyebrow !text-[var(--akira-cyan)]">Logged in // 在中</p>
        <p className="display mt-2 text-2xl text-[var(--ink)] leading-tight truncate">
          {user?.name ?? "Visitante"}
        </p>
        <p className="font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest mt-1 truncate">
          {user?.email ?? "guest@neo-tokyo"}
        </p>
        <div className="mt-3 inline-flex items-center gap-2 border border-[var(--akira-yellow)] px-2 py-1">
          <span className="jp text-xs text-[var(--akira-yellow)]">点</span>
          <span className="font-mono text-xs text-[var(--akira-yellow)] numerals">{stats.points} pts</span>
        </div>
      </div>

      {/* Links */}
      <nav className="border-[2px] border-[var(--line)] bg-[var(--bg-2)] divide-y divide-[var(--line)]">
        {LINKS.map((l) => {
          const active = l.match(pathname || "");
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`group flex items-center gap-3 px-4 py-3 transition-all relative ${
                active
                  ? "bg-[var(--akira-red)] text-[var(--ink)]"
                  : "text-[var(--ink-soft)] hover:bg-[var(--bg-3)] hover:text-[var(--ink)]"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--akira-yellow)]" />
              )}
              <span className={`jp text-xl ${active ? "text-[var(--ink)]" : "text-[var(--akira-red)]"}`}>
                {l.kanji}
              </span>
              <span className="display text-sm uppercase tracking-wider flex-1">{l.label}</span>
              <span
                className={`font-mono text-[11px] numerals px-1.5 py-0.5 border ${
                  active
                    ? "border-[var(--ink)] text-[var(--ink)]"
                    : "border-[var(--line)] text-[var(--ink-muted)] group-hover:text-[var(--akira-cyan)] group-hover:border-[var(--akira-cyan)]"
                }`}
              >
                {stats[l.statKey]}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full border-[2px] border-[var(--line)] bg-transparent px-4 py-3 text-left text-[var(--ink-muted)] hover:border-[var(--akira-red)] hover:text-[var(--akira-red)] transition group"
      >
        <span className="flex items-center gap-3">
          <span className="jp text-lg group-hover:text-[var(--akira-red)]">出</span>
          <span className="display text-sm uppercase tracking-wider">Sair</span>
          <span className="ml-auto font-mono text-[10px] uppercase">{">"} logout</span>
        </span>
      </button>

      {/* Decoracao rodape */}
      <div className="border-[2px] border-dashed border-[var(--line)] p-3">
        <p className="font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-widest leading-relaxed">
          {">"} akira-mangas.account.v1<br />
          {">"} neo-tokyo distribution<br />
          {">"} sync local-storage
        </p>
      </div>
    </aside>
  );
}
