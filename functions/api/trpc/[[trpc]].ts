
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '~/server/routers';
import { createContext } from '~/server/context';

export const onRequest = async (context: CfCtx) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: context.request,
    router: appRouter,
    createContext: createContext(context),
  });
}
