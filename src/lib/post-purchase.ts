"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { deriveStatus, useOrders, type StoredOrder } from "@/lib/orders-store";
import { useReviews } from "@/lib/reviews-store";

export type PostPurchasePrompt = {
  /** ID unico do prompt (orderId + volumeId) */
  promptId: string;
  orderId: string;
  /** ID do manga (slug-vol-N segue padrao do volumeId no carrinho) */
  mangaId: string;
  seriesTitle: string;
  volumeNumber: number;
  coverImage: string;
};

/**
 * Vasculha pedidos do user que ja foram entregues e retorna a lista de
 * volumes que ele ainda nao avaliou. Cross-reference com o reviews-store
 * pra remover items ja reviewados.
 *
 * Skip se:
 * - pedido cancelado (deriveStatus !== "entregue")
 * - user nao logado
 * - usuario ja deixou review pra aquele mangaId (com userName == user.name)
 *
 * Usa mangaId == seriesSlug (extrai do volumeId no formato "slug-vol-N").
 */
export function usePostPurchasePrompts(): {
  prompts: PostPurchasePrompt[];
  dismissPrompt: (promptId: string) => void;
  hydrated: boolean;
} {
  const { user } = useAuth();
  const { orders, hydrated: ordersHydrated } = useOrders();
  const { items: reviews, hydrated: reviewsHydrated } = useReviews();

  const prompts = useMemo<PostPurchasePrompt[]>(() => {
    if (!user) return [];
    const userName = user.name;
    // Conjunto de mangaIds que o user ja reviewou — evita prompt redundante
    const reviewedSet = new Set(
      reviews.filter((r) => r.userName === userName).map((r) => r.mangaId)
    );

    const result: PostPurchasePrompt[] = [];
    const seen = new Set<string>();

    for (const order of orders as StoredOrder[]) {
      const status = deriveStatus(order);
      if (status !== "entregue") continue;
      for (const it of order.items) {
        // mangaId derivado do volumeId — formato "slug-vol-N"
        const mangaId = it.volumeId.replace(/-vol-\d+$/i, "");
        if (reviewedSet.has(mangaId)) continue;
        const key = `${order.orderId}::${it.volumeId}`;
        if (seen.has(key)) continue;
        seen.add(key);
        result.push({
          promptId: key,
          orderId: order.orderId,
          mangaId,
          seriesTitle: it.seriesTitle,
          volumeNumber: it.volumeNumber,
          coverImage: it.coverImage,
        });
      }
    }

    return result;
  }, [user, orders, reviews]);

  /**
   * Dismiss e no-op aqui (prompt some sozinho quando o user posta a review,
   * via re-derivacao do useMemo acima ao mudar `reviews`). Mantido na API
   * pra compatibilidade caso queiramos persistir "ignorados" no futuro.
   */
  const dismissPrompt = (_promptId: string) => {
    // intencionalmente vazio — fluxo de dispensa e via post review
    void _promptId;
  };

  return {
    prompts,
    dismissPrompt,
    hydrated: ordersHydrated && reviewsHydrated,
  };
}
