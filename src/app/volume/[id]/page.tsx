import { permanentRedirect } from "next/navigation";

export const dynamic = "force-static";

/**
 * Rota legada baseada em Prisma. Volumes individuais nao existem mais
 * no fluxo Jikan — redirecionamos pra home/catalogo via 308.
 */
export default async function VolumePage() {
  permanentRedirect("/busca");
}
