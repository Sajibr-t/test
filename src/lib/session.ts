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

// Signing key for session tokens. MUST be set to a long random value in
// production via the SESSION_SECRET env var — the dev fallback is not secret,
// and anyone who knows it could forge an admin session.
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-secret"
);
const COOKIE = "session";

export type Session = { userId: string; role: string };

/** Sign a new 7-day session token and set it as the session cookie. */
export async function createSession(userId: string, role: string) {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true, // not readable by client-side JS
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
    const { payload } = await jwtVerify(token, secret);
    return { userId: payload.userId as string, role: payload.role as string };
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
  return prisma.user.findUnique({ where: { id: session.userId } });
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
