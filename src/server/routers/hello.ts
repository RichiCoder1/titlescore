
import { publicProcedure, router } from '../trpc';
 
export const helloRouter = router({
  hello: publicProcedure
    .query(async ({ ctx }) => {
      return `Hello, ${ctx.user?.sub}!`;
    }),
});