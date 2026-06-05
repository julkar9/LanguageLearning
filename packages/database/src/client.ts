import { PrismaClient } from "@prisma/client";

export const defaultDatabaseUrl =
  "postgresql://language_learning:language_learning@localhost:5175/language_learning?schema=public";

export function ensureDatabaseUrl(): void {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = defaultDatabaseUrl;
  }
}

export function createPrismaClient(): PrismaClient {
  ensureDatabaseUrl();
  return new PrismaClient();
}
