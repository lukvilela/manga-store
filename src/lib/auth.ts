import { SignJWT, jwtVerify } from "jose";

export type SessionPayload = {
  userId: string;
  name: string;
  email: string;
  role: string;
};

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "manga-store-dev-secret-change-in-production"
);

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
