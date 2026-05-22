import { NextRequest, NextResponse } from "next/server";
import { getVolumeCoversByTitle, type VolumeCoverData } from "@/lib/mangadex-api";

export const runtime = "nodejs";
// Capas de volume praticamente nao mudam — cache 24h
export const revalidate = 86400;

type Payload = { covers: VolumeCoverData[] };

/**
 * GET /api/manga/[jikanId]/volumes?title=<titulo Jikan>
 *
 * Server-side proxy pro MangaDex. Recebe o titulo da serie (vindo do Jikan)
 * e devolve a lista de capas por volume.
 *
 * - Sempre retorna 200 com { covers: [] } em qualquer falha (graceful).
 * - jikanId fica no path so pra dar cache key consistente por serie + por
 *   roteamento humano (mesmo que internamente a gente nao precise dele).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jikanId: string }> },
) {
  await params; // consome pra evitar warning, valor nao usado internamente

  const title = req.nextUrl.searchParams.get("title")?.trim() ?? "";

  if (!title) {
    return NextResponse.json<Payload>({ covers: [] });
  }

  try {
    const covers = await getVolumeCoversByTitle(title);
    return NextResponse.json<Payload>({ covers });
  } catch (e) {
    console.error("[api/manga/volumes] failed:", e);
    // Fallback graceful — UI sempre tem como degradar pra placeholder colorido
    return NextResponse.json<Payload>({ covers: [] });
  }
}
