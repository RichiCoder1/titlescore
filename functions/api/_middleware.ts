import createClerkClient from "@clerk/clerk-sdk-node/esm/instance";
import * as cookie from "cookie";

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
  if (parsedCookies["__session"]) {
    token = parsedCookies["__session"];
  } else if (context.request.headers.has("Authorization")) {
    const header = context.request.headers.get("Authorization")!;
    const [type, value] = header.split(" ");
    if (type === "Bearer") {
      token = value;
    }
  }

  if (!/\S/.test(token)) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const payload = await clerk.verifyToken(token, {
      issuer: context.env.CLERK_ISSUER,
    });

    context.data.token = token;
    context.data.user = payload;
    context.data.clerk = clerk;

    return context.next();
  } catch (error) {
    return new Response("Unauthorized\n\n" + (error as Error)?.toString(), {
      status: 401,
    });
  }
};
