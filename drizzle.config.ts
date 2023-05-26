import { config } from "dotenv";
import type { Config } from "drizzle-kit";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

config({
  path: join(fileURLToPath(new URL(".", import.meta.url)), "../.dev.vars"),
});

export default {
  schema: "./src/server/schema.ts",
  out: "./migrations",
  connectionString: process.env.DATABASE_URL,
} satisfies Config;
