import { redirect, permanentRedirect } from "next/navigation";

export const dynamic = "force-static";

type Props = { params: Promise<{ slug: string }> };

/**
 * Rota legada baseada em Prisma. Migrada pra Jikan: redireciona pra busca
 * com o slug como query. Mantemos bookmarks vivos via 301.
 */
export default async function SeriePage({ params }: Props) {
  const { slug } = await params;
  const q = decodeURIComponent(slug).replace(/[-_]+/g, " ").trim();
  if (!q) {
    // Sem slug util, manda pra catalogo
    redirect("/busca");
  }
  // permanentRedirect emite 308 (mantemos metodo + corpo).
  permanentRedirect(`/busca?q=${encodeURIComponent(q)}`);
}
