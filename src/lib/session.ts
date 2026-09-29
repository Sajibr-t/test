import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./db";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-secret"
);
const COOKIE = "session";

export type Session = { userId: string; role: string };

export async function createSession(userId: string, role: string) {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { userId: payload.userId as string, role: payload.role as string };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.userId } });
}

export async function requireAdmin() {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") redirect("/login");
  return user;
}

// Admins pass too, so they can preview the buyer experience.
export async function requireApprovedBuyer() {
  const user = await getUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN" && user.status !== "APPROVED") redirect("/pending");
  return user;
}
