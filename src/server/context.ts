import { inferAsyncReturnType } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { drizzle } from "drizzle-orm/d1";
import ky from 'ky';
import createClerkClient from '@clerk/clerk-sdk-node/esm/instance';
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
        Authorization: `apiKey ${cfCtx.env.AUTHZED_API_KEY}`
      }
    });

    return {
      user: {
        id: cfCtx.data.user?.sub,
        email: cfCtx.data.user?.email as string | undefined,
        claims: cfCtx.data.user,
      },
      db: drizzle(cfCtx.env.CONTEST_DB, {
        schema
      }),
      authClient,
      clerk: createClerkClient({
        publishableKey: cfCtx.env.CLERK_PUBLISHABLE_KEY,
        secretKey: cfCtx.env.CLERK_SECRET_KEY,
        jwtKey: cfCtx.env.CLERK_JWT_PUBLIC_KEY,
      }),
      baseUrl,
      env: cfCtx.env,
    };
  };

export type Context = inferAsyncReturnType<inferAsyncReturnType<typeof createContext>>;
export type AuthzClient = Context["authClient"];
