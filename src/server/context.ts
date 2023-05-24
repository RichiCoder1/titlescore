import { inferAsyncReturnType } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { drizzle } from "drizzle-orm/d1";
import ky from 'ky';
import * as schema from "./schema";

export const createContext =
  (cfCtx: CfCtx) => async (ctx: FetchCreateContextFnOptions) => {
    const host = ctx.req.headers.get("host")!;
    const baseUrl = host.includes("localhost")
      ? `http://${host}`
      : `https://${host}`;

    const authClient = ky.extend({
      prefixUrl: `https://gateway-alpha.authzed.com`,
      headers: {
        Authorization: `Bearer ${cfCtx.env.AUTHZED_API_KEY}`
      },
      credentials: undefined,
    });

    return {
      user: {
        id: cfCtx.data.user?.sub,
        email: cfCtx.data.user?.email as string | undefined,
        claims: cfCtx.data.user,
      },
      db: drizzle(cfCtx.env.CONTEST_DB, {
        schema,
        logger: true,
      }),
      authClient,
      clerk: cfCtx.data.clerk,
      baseUrl,
      env: cfCtx.env,
    };
  };

export type Context = inferAsyncReturnType<inferAsyncReturnType<typeof createContext>>;
export type AuthzClient = Context["authClient"];
