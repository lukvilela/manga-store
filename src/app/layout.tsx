import type { Metadata } from "next";
import { Bagel_Fat_One, Plus_Jakarta_Sans, JetBrains_Mono, Noto_Serif_JP } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import KonamiListener from "@/components/easter-eggs/KonamiListener";
import KamehamehaEffect from "@/components/easter-eggs/KamehamehaEffect";
import Mascote from "@/components/easter-eggs/Mascote";
import ScrollToTop from "@/components/ScrollToTop";

const display = Bagel_Fat_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const jp = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "900"],
  variable: "--font-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Akira Mangás — Neo-Tokyo Manga Store",
  description: "Loja de mangas com vibe Akira. Catalogo via MyAnimeList, capas em alta, vibracao cyberpunk.",
  openGraph: {
    title: "Akira Mangás — Neo-Tokyo Manga Store",
    description: "Catalogo curado de mangas. Vibe Akira, Neo-Tokyo, cyberpunk.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${sans.variable} ${display.variable} ${mono.variable} ${jp.variable} antialiased scanlines`}>
        <div className="grain" aria-hidden />
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              {/* Easter eggs + polish — globais */}
              <KonamiListener />
              <KamehamehaEffect />
              <Mascote />
              <ScrollToTop />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
