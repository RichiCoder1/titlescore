
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '~/server';

export const onRequest = async (context: CfCtx) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: context.request,
    router: appRouter,
    createContext: () => ({
      ...context.data,
    }),
  });
}