import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

import { env } from "~/env.mjs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

let postgres: Pool | undefined;

if(!postgres) {
    
  postgres = new Pool({
    max: 20,
    connectionString: env.DATABASE_URL,
    idleTimeoutMillis: 30000,
  });
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const postgresql = postgres;
