import type { Config } from "drizzle-kit";
 
export default {
  schema: "./src/server/schema.ts",
  out: "./migrations",
} satisfies Config;