import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { contestRouter } from "./contests";
import { criteriaRouter } from "./criteria";
import { contestantsRouter } from "./contestants";
import { membersRouter } from "./members";
import { scoresRouter } from "./scores";

export const appRouter = router({
  hello: protectedProcedure
    .input(
      z.object({
        text: z.string().nullish(),
      })
    )
    .query(({ input, ctx }) => {
      return {
        greeting: `hello ${input?.text ?? "world"} for ${
          ctx.user?.email ?? "anonymous"
        }`,
        time: new Date(),
      };
    }),
  contest: contestRouter,
  criteria: criteriaRouter,
  contestants: contestantsRouter,
  members: membersRouter,
  scores: scoresRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
