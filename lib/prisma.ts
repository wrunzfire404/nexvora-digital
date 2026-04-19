import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    // Selama build time (static generation), DATABASE_URL mungkin belum ada.
    // Return placeholder — akan diinisialisasi ulang saat runtime.
    console.warn("[Prisma] DATABASE_URL is not set. Using placeholder client.");
    return new PrismaClient();
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error"] : [],
  });
}

export const prisma = global._prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global._prisma = prisma;
}
