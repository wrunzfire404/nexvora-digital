import { PrismaClient } from "@prisma/client";

// Production/PostgreSQL mode: uses PrismaPg adapter
// Development: set DATABASE_URL to a PostgreSQL URL (Neon or local)
// 
// Untuk development lokal tanpa PostgreSQL:
// Gunakan Neon free tier dan isi DATABASE_URL di .env dengan URL Neon

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // PostgreSQL adapter (digunakan untuk Neon dan PostgreSQL lainnya)
  if (databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://")) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaPg } = require("@prisma/adapter-pg");
    const adapter = new PrismaPg({ connectionString: databaseUrl });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error"] : [],
    });
  }

  // Fallback untuk pengembangan (jika DATABASE_URL masih SQLite)
  // Ini tidak akan berjalan di Prisma v7 dengan schema PostgreSQL
  // Gunakan URL PostgreSQL dari Neon: https://neon.tech
  throw new Error(
    "DATABASE_URL must be a PostgreSQL connection string. " +
    "Get a free database at https://neon.tech"
  );
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
