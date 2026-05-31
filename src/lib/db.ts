import { PrismaClient } from "@prisma/client";

/**
 * Prisma singleton — évite d'épuiser le pool de connexions en dev (HMR)
 * et en serverless (Vercel).
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
