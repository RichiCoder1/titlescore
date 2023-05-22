interface CfEnv {
  CLERK_SECRET_KEY: string;
  CLERK_JWT_PUBLIC_KEY: string;
  CONTEST_DB: D1Database;
}

interface CfData extends Record<string, unknown> {
  token?: string;
  user?: import('jose').JWTPayload;
}

type CfCtx<T extends string = any> = EventContext<CfEnv, T, CfData>;