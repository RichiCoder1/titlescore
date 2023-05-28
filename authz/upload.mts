#!/usr/bin/env tsx
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { v1 } from "@authzed/authzed-node";
import dotenv from "dotenv";

const cwd = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: join(cwd, "../.dev.vars") });

const { promises: client } = v1.NewClient(process.env.AUTHZED_API_KEY!);

const schema = readFileSync(join(cwd, "./schema.zed"), "utf-8");

const response = await client.writeSchema(
  v1.WriteSchemaRequest.create({
    schema,
  })
);

console.log(response);
