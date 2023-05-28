import createClerkClient from "@clerk/clerk-sdk-node/esm/instance";
import * as cookie from "cookie";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "~/server/schema";
import ky from "ky";

type ClerkClient = ReturnType<typeof createClerkClient>;
type JwtPayload = Awaited<ReturnType<ClerkClient["verifyToken"]>>;

export const generateContextData = (
  context: EventContext<CfEnv, any, any>,
  data: { clerk: ClerkClient; payload: JwtPayload }
) => {
  const pool = new Pool({
    connectionString: context.env.DATABASE_URL,
  });
  const host = context.request.headers.get("host")!;
  const baseUrl =
    host.includes("localhost") || host.includes("127.0.0.1")
      ? `http://${host}`
      : `https://${host}`;

  const authClient = ky.extend({
    prefixUrl: `https://gateway-alpha.authzed.com`,
    headers: {
      Authorization: `Bearer ${context.env.AUTHZED_API_KEY}`,
    },
    credentials: undefined,
  });
  return {
    baseUrl,
    authClient,
    user: data.payload,
    clerk: data.clerk,
    db: drizzle(pool, {
      schema,
    }),
  };
};

export const onRequest: PagesFunction<CfEnv, any, CfData> = async (context) => {
  if (context.request.method === "OPTIONS") {
    return context.next();
  }

  const url = new URL(context.request.url);

  if (url.pathname.startsWith("/api/public")) {
    return context.next();
  }

  const clerk = createClerkClient({
    publishableKey: context.env.CLERK_PUBLISHABLE_KEY,
    secretKey: context.env.CLERK_SECRET_KEY,
    jwtKey: context.env.CLERK_JWT_PUBLIC_KEY,
  });

  const cookies = context.request.headers.get("Cookie");
  const parsedCookies = cookie.parse(cookies || "");

  let token = "";
  if (context.request.headers.has("Authorization")) {
    const header = context.request.headers.get("Authorization")!;
    const [type, value] = header.split(" ");
    if (type === "Bearer") {
      token = value;
    }
  } else if (parsedCookies["__session"]) {
    token = parsedCookies["__session"];
  }

  if (!/\S/.test(token)) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: JwtPayload;
  try {
    payload = await clerk.verifyToken(token, {
      issuer: context.env.CLERK_ISSUER,
      audience: ["authenticated", undefined as any],
    });
  } catch (error) {
    console.error("Got error verifying token", error);
    return new Response("Unauthorized\n\n" + (error as Error)?.toString(), {
      status: 401,
    });
  }

  Object.assign(context.data, generateContextData(context, { clerk, payload }));

  return context.next();
};
