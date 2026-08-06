import { config } from "dotenv";

config({ path: ".env.local" });

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Direct (non-pooled) connection: Prisma Migrate needs a session-level
    // connection for advisory locks, which Neon's pooled/pgbouncer endpoint
    // doesn't support. The app runtime uses the pooled DATABASE_URL instead
    // (see src/lib/prisma.ts).
    url: process.env.DIRECT_URL,
  },
});
