import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { createCriteriaSchema } from "~/shared/schemas/criteria";
import { criteria } from "../schema";
import { eq } from "drizzle-orm";

export const criteriaRouter = router({
  create: protectedProcedure
    .input(createCriteriaSchema)
    .meta({
      check: { permission: "manage" },
    })
    .mutation(async ({ input, ctx }) => {
      const { db, authorize } = ctx;

      await authorize(input.contestId);

      const result = await db
        .insert(criteria)
        .values({
          contestId: input.contestId,
          name: input.name,
          description: input.description ?? "",
          weight: input.weight,
        })
        .returning()
        .all();
      return result[0];
    }),
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .meta({
      check: { permission: "view" },
    })
    .query(async ({ input, ctx }) => {
      const { db, authorize } = ctx;

      const result = await db
        .query
        .criteria
        .findFirst({
          where: eq(criteria.contestId, input.id)
        });

      await authorize(result!.contestId);

      return result;
    }),
  listByContestId: protectedProcedure
    .input(z.object({ contestId: z.number() }))
    .meta({
      check: { permission: "view" },
    })
    .query(async ({ ctx, input }) => {
      const { db, authorize } = ctx;

      await authorize(input.contestId);

      const result = await db
      .query
      .criteria
      .findMany({
        where: eq(criteria.contestId, input.contestId)
      });

      return result;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .meta({
      check: { permission: "manage" },
    })
    .mutation(async ({ input, ctx }) => {
      const { db, authorize } = ctx;
      const { id } = input;

      const data = await db
        .query
        .criteria
        .findFirst({
          where: eq(criteria.id, id),
          columns: {
            contestId: true
          }
        });

      await authorize(data!.contestId);

      const result = await db.delete(criteria).where(eq(criteria.id, id)).run();
      if (result.error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error,
        });
      }
    }),
});