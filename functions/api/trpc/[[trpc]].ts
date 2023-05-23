
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '~/server';
import { drizzle } from 'drizzle-orm/d1';

export const onRequest = async (context: CfCtx) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: context.request,
    router: appRouter,
    createContext: () => ({
      ...context.data,
      db: drizzle(context.env.CONTEST_DB),
    }),
  });
}