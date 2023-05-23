/// <reference types="vite/client" />

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
