import EmptyCart from "@/components/EmptyCart";
import CartContent from "./CartContent";
import { getTopManga, toCardData } from "@/lib/manga-api";

/**
 * Pagina do carrinho — Server Component pai.
 *
 * Faz fetch ISR das sugestoes pro empty state (cache 1h via Jikan lib),
 * e delega rendering decision pra CartContent (Client — consome useCart).
 *
 * Estrategia: pre-renderizamos o EmptyCart no servidor e passamos como
 * children/prop pro client. Custo zero quando o carrinho tem itens —
 * o JSX nao chega ao DOM, mas o cache fica quente pra proximas visitas.
 */
export const metadata = {
  title: "Carrinho · MangaVerse",
  description: "Seus volumes reservados em Neo-Tokyo.",
};

export default async function CarrinhoPage() {
  const top = await getTopManga(4);
  const sugestoes = top.map(toCardData);

  return (
    <main className="min-h-screen bg-bg relative">
      {/* Background decorativo Akira */}
      <div className="absolute inset-0 halftone-lg opacity-20 pointer-events-none" aria-hidden />

      <CartContent emptyState={<EmptyCart sugestoes={sugestoes} />} />
    </main>
  );
}
