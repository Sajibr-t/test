/**
 * Shared Prisma client — the single database connection for the whole app.
 *
 * Import this anywhere you need data:  import { prisma } from "@/lib/db"
 *
 * Why the `globalThis` dance: in development Next.js hot-reloads modules on
 * every file save. Without caching the client on the global object, each
 * reload would construct a new PrismaClient and open new connections until
 * the database refuses them. In production the module is only evaluated once,
 * so we deliberately skip the cache there.
 *
 * When TURSO_DATABASE_URL is set (e.g. on Vercel) the client talks to a Turso
 * (hosted libSQL/SQLite) database through Prisma's libSQL adapter; otherwise it
 * uses the local SQLite file from DATABASE_URL.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql/web";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) return new PrismaClient();
  return new PrismaClient({ adapter: new PrismaLibSQL({ url, authToken: process.env.TURSO_AUTH_TOKEN }) });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
