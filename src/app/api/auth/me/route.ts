import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("manga-token")?.value;
  if (!token) return NextResponse.json({ user: null });

  const session = await verifyToken(token);
  if (!session) return NextResponse.json({ user: null });

  return NextResponse.json({ user: session });
}
