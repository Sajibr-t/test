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
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
