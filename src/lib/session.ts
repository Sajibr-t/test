/**
 * Authentication and access control.
 *
 * Sessions are a signed JWT stored in an httpOnly cookie — there is no session
 * table, so signing out is just deleting the cookie. httpOnly means client-side
 * JavaScript cannot read the token, which protects it from XSS.
 *
 * Access levels in this store:
 *   - anonymous      -> can browse the marketing pages
 *   - PENDING buyer  -> registered, awaiting admin approval (sees /pending)
 *   - APPROVED buyer -> can see trade prices, order, and view their invoices
 *   - ADMIN          -> everything, including the /admin area
 *
 * Use the `requireX` helpers at the top of a page/action to gate it. They
 * redirect rather than throw, so an unauthorised visitor lands somewhere useful.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./db";
import { randomBytes } from "node:crypto";

// Signing key for session tokens. MUST be set to a long random value in
// production via the SESSION_SECRET env var — the dev fallback is not secret,
// and anyone who knows it could forge an admin session.
const local = globalThis as unknown as { localSessionSecret?: string };
function signingKey() {
  const configured = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === "production" && (!configured || configured.length < 32 || /^(dev-secret|change-me)/.test(configured))) throw new Error("Set a random SESSION_SECRET of at least 32 characters before starting production.");
  local.localSessionSecret ??= randomBytes(48).toString("hex");
  return new TextEncoder().encode(configured || local.localSessionSecret);
}
const COOKIE = "session";

export type Session = { userId: string; role: string; version: number };

/** Sign a new 7-day session token and set it as the session cookie. */
export async function createSession(userId: string, role: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { sessionVersion: true } });
  const token = await new SignJWT({ userId, role, version: user.sessionVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(signingKey());
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true, // not readable by client-side JS
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // sent on normal navigation, blocked on cross-site POSTs
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // keep cookie and token lifetimes in sync
  });
}

/**
 * Read and verify the session cookie.
 * Returns null for anyone not signed in, and also for tampered or expired
 * tokens — jwtVerify throws in those cases and we treat that as "logged out".
 */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, signingKey(), { algorithms: ["HS256"] });
    if (typeof payload.userId !== "string" || typeof payload.role !== "string") return null;
    return { userId: payload.userId, role: payload.role, version: typeof payload.version === "number" ? payload.version : 0 };
  } catch {
    return null;
  }
}

/** Log out: drop the cookie. Nothing server-side to clean up. */
export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

/**
 * The full user record for the current session, or null if signed out.
 *
 * Note this re-reads the user from the database rather than trusting the
 * token's contents, so a buyer approved (or suspended) after signing in gets
 * their new status immediately instead of having to log in again.
 */
export async function getUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  return user && user.sessionVersion === session.version ? user : null;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

/** Gate for the /admin area. Non-admins are bounced to the login page. */
export async function requireAdmin() {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") redirect("/login");
  return user;
}

/**
 * Gate for buyer-only pages (cart, checkout, order history).
 * Signed out -> /login. Registered but not yet approved -> /pending.
 * Admins pass too, so they can preview the buyer experience.
 */
export async function requireApprovedBuyer() {
  const user = await getUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN" && user.status !== "APPROVED") redirect("/pending");
  return user;
}
