import { initTRPC } from '@trpc/server';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

type Context = CfData & {
  db: DrizzleD1Database;
};

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;