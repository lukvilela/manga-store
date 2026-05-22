import { NextRequest, NextResponse } from "next/server";
import { searchManga, toCardData } from "@/lib/manga-api";

export const runtime = "nodejs";
export const revalidate = 300; // 5min cache

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "8"), 25);

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const data = await searchManga(q, limit);
    return NextResponse.json({ results: data.map(toCardData) });
  } catch (e) {
    return NextResponse.json({ results: [], error: (e as Error).message }, { status: 500 });
  }
}
