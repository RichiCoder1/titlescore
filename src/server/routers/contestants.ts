/* eslint-disable camelcase */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import {
  insertContestantsSchema,
  updateContestantsSchema,
} from "~/shared/schemas/contestants";
import { contestants } from "../schema";
import { eq } from "drizzle-orm";
import { ulid } from "../helpers/ulid";

export const contestantsRouter = router({
  create: protectedProcedure
    .input(insertContestantsSchema)
    .meta({ check: { permission: "manage" } })
    .mutation(async ({ input, ctx }) => {
      const { db, authorize } = ctx;

      await authorize(input.contestId);

      const result = await db
        .insert(contestants)
        .values([
          {
            id: ulid(),
            contestId: input.contestId,
            name: input.name,
            stageName: input.stageName,
          },
        ])
        .returning();

      return result[0];
    }),
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
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
  update: protectedProcedure
    .input(updateContestantsSchema)
    .meta({
      check: { permission: "manage" },
    })
    .mutation(async ({ input, ctx }) => {
      const { db, authorize } = ctx;

      await authorize(input.contestId);

      const result = await db
        .update(contestants)
        .set({
          name: input.name,
          stageName: input.stageName ?? input.name,
        })
        .where(eq(contestants.id, input.id!))
        .returning();

      return result[0];
    }),
  listByContestId: protectedProcedure
    .input(z.object({ contestId: z.string() }))
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
    .input(z.object({ id: z.string() }))
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

      await db.delete(contestants).where(eq(contestants.id, id));
    }),
});
