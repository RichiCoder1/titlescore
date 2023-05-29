/// <reference types="vite/client" />
/// <reference types="@cloudflare/workers-types" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly CF_PAGES?: string;
  readonly CF_PAGES_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ReadableStream<R = any> {
  [Symbol.asyncIterator](): AsyncIterator<R>;
}

interface CfEnv {
  /** Secrets */
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  CLERK_ISSUER: string;
  CLERK_JWT_PUBLIC_KEY: string;
  AUTHZED_API_KEY: string;
  SENDGRID_API_KEY: string;
  SENDGRID_INVITE_TEMPLATE_ID: string;
  DATABASE_URL: string;
}

type Database = import("drizzle-orm").Simplify<
  import("drizzle-orm/neon-serverless").NeonDatabase<
    typeof import("~/server/schema")
  >
>;
