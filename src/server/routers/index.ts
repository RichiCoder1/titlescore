import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { contestRouter } from "./contests";
import { criteriaRouter } from "./criteria";
import { contestantsRouter } from "./contestants";
import { membersRouter } from "./members";
import { scoresRouter } from "./scores";

export const appRouter = router({
  getUser: protectedProcedure.input(z.object({})).query(({ ctx }) => {
    return ctx.user;
  }),
  contest: contestRouter,
  criteria: criteriaRouter,
  contestants: contestantsRouter,
  members: membersRouter,
  scores: scoresRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
