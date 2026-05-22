import type { Metadata, Viewport } from "next";
import { Bagel_Fat_One, Plus_Jakarta_Sans, JetBrains_Mono, Noto_Serif_JP } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import KonamiListener from "@/components/easter-eggs/KonamiListener";
import KamehamehaEffect from "@/components/easter-eggs/KamehamehaEffect";
import Mascote from "@/components/easter-eggs/Mascote";
import ScrollToTop from "@/components/ScrollToTop";
import PageLoader from "@/components/PageLoader";
import { organizationSchema, websiteSchema, jsonLdScript, SITE_URL } from "@/lib/structured-data";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Akira Mangás — Neo-Tokyo Manga Store",
    template: "%s — Akira Mangás",
  },
  description:
    "Loja de mangas com vibe Akira. Catalogo via MyAnimeList, capas em alta, vibracao cyberpunk.",
  applicationName: "Akira Mangás",
  authors: [{ name: "Akira Mangás" }],
  generator: "Next.js",
  keywords: [
    "manga",
    "mangas",
    "akira",
    "neo-tokyo",
    "cyberpunk",
    "shonen",
    "seinen",
    "loja manga brasil",
    "comprar manga",
    "myanimelist",
  ],
  category: "ecommerce",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon-192.svg",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Akira Mangás — Neo-Tokyo Manga Store",
    description:
      "Catalogo curado de mangas. Vibe Akira, Neo-Tokyo, cyberpunk.",
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "Akira Mangás",
  },
  twitter: {
    card: "summary_large_image",
    title: "Akira Mangás — Neo-Tokyo Manga Store",
    description: "Loja de mangas Neo-Tokyo. 55.000+ series via Jikan.",
  },
  verification: {
    google: "MOCK-GOOGLE-VERIFICATION-CODE",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#c1121f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* JSON-LD Organization + WebSite (com SearchAction pra sitelinks) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteSchema()) }}
        />
      </head>
      <body className={`${sans.variable} ${display.variable} ${mono.variable} ${jp.variable} antialiased scanlines`}>
        <PageLoader />
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
