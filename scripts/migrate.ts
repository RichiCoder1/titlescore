import { config } from "dotenv";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import assert from "node:assert";

config({
  path: join(fileURLToPath(new URL(".", import.meta.url)), "../.dev.vars"),
});

assert(process.env.DATABASE_URL, "DATABASE_URL is required");

const connectionString = `${process.env.DATABASE_URL}?sslmode=require`;
const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

try {
  await migrate(db, { migrationsFolder: "migrations" });
  await sql.end();
} catch (error) {
  console.error(error);
  process.exit(1);
}
