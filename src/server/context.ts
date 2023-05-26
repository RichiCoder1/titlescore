import { inferAsyncReturnType } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { drizzle } from "drizzle-orm/neon-serverless";
import ky from "ky";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

export const createContext =
  (cfCtx: CfCtx) => async (ctx: FetchCreateContextFnOptions) => {
    const host = ctx.req.headers.get("host")!;
    const baseUrl =
      host.includes("localhost") || host.includes("127.0.0.1")
        ? `http://${host}`
        : `https://${host}`;

    const authClient = ky.extend({
      prefixUrl: `https://gateway-alpha.authzed.com`,
      headers: {
        Authorization: `Bearer ${cfCtx.env.AUTHZED_API_KEY}`,
      },
      credentials: undefined,
    });

    const sendgrid = ky.extend({
      prefixUrl: `https://api.sendgrid.com`,
      headers: {
        Authorization: `Bearer ${cfCtx.env.SENDGRID_API_KEY}`,
      },
      credentials: undefined,
    });

    const pool = new Pool({
      connectionString: cfCtx.env.DATABASE_URL,
    });

    return {
      user: {
        id: cfCtx.data.user?.sub,
        email: cfCtx.data.user?.email as string | undefined,
        claims: cfCtx.data.user,
      },
      db: drizzle(pool, {
        schema,
      }),
      authClient,
      sendgrid,
      clerk: cfCtx.data.clerk!,
      baseUrl,
      env: cfCtx.env,
    };
  };

export type Context = inferAsyncReturnType<
  inferAsyncReturnType<typeof createContext>
>;
export type AuthzClient = Context["authClient"];
