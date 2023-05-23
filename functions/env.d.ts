interface CfEnv {
  /** Bindings */
  CONTEST_DB: D1Database;

  /** Secrets */
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  CLERK_ISSUER: string;
  CLERK_JWT_PUBLIC_KEY: string;
  AUTHZED_API_KEY: string;
  SENDGRID_API_KEY: string;
  SENDGRID_INVITE_TEMPLATE_ID: string;
}

interface CfData extends Record<string, unknown> {
  token?: string;
  user?: Awaited<ReturnType<typeof import('@clerk/backend').verifyToken>>;
}

type CfCtx<T extends string = any> = EventContext<CfEnv, T, CfData>;
