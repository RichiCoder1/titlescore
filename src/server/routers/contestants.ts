/* eslint-disable camelcase */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { createContestantSchema } from "~/shared/schemas/contestants";
import { contestants } from "../schema";
import { eq } from "drizzle-orm";

export const contestantsRouter = router({
  create: protectedProcedure
    .input(createContestantSchema)
    .meta({ check: { permission: "manage" } })
    .mutation(async ({ input, ctx }) => {
      const { db, authorize } = ctx;

      await authorize(input.contestId);

      const result = await db
        .insert(contestants)
        .values([
          {
            contestId: input.contestId,
            name: input.name,
            stageName: input.stageName,
          },
        ])
        .returning()
        .all();

      return result;
    }),
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .meta({ check: { permission: "view" } })
    .query(async ({ input, ctx }) => {
      const { db, authorize } = ctx;

      const result = await db.query.contestants.findFirst({
        where: eq(contestants.id, input.id),
      });
      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      await authorize(result.contestId);
      return result;
    }),
  listByContestId: protectedProcedure
    .input(z.object({ contestId: z.number() }))
    .meta({ check: { permission: "view" } })
    .query(async ({ ctx, input }) => {
      const { db, authorize } = ctx;

      await authorize(input.contestId);

      const result = await db.query.contestants.findMany({
        where: eq(contestants.contestId, input.contestId),
      });
      return result;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { db, authorize } = ctx;
      const { id } = input;

      const data = await db.query.criteria.findFirst({
        where: eq(contestants.id, id),
        columns: {
          contestId: true,
        },
      });

      await authorize(data!.contestId);

      const result = await db
        .delete(contestants)
        .where(eq(contestants.id, id))
        .run();
      if (result.error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error,
        });
      }
    }),
});
