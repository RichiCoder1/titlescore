import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import {
  insertCriteriaSchema,
  updateCriteriaSchema,
} from "~/shared/schemas/criteria";
import { criteria } from "../schema";
import { eq } from "drizzle-orm";
import { ulid } from "../helpers/ulid";

export const criteriaRouter = router({
  create: protectedProcedure
    .input(insertCriteriaSchema)
    .meta({
      check: { permission: "manage" },
    })
    .mutation(async ({ input, ctx }) => {
      const { db, authorize } = ctx;

      await authorize(input.contestId);

      const result = await db
        .insert(criteria)
        .values({
          id: ulid(),
          contestId: input.contestId,
          name: input.name,
          description: input.description ?? "",
          weight: input.weight,
          dueAt: input.dueAt,
        })
        .returning();

      return result[0];
    }),
  update: protectedProcedure
    .input(updateCriteriaSchema)
    .meta({
      check: { permission: "manage" },
    })
    .mutation(async ({ input, ctx }) => {
      const { db, authorize } = ctx;

      await authorize(input.contestId);

      const result = await db
        .update(criteria)
        .set({
          name: input.name,
          description: input.description ?? "",
          weight: input.weight,
          dueAt: input.dueAt,
        })
        .where(eq(criteria.id, input.id!))
        .returning();

      return result[0];
    }),
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .meta({
      check: { permission: "view" },
    })
    .query(async ({ input, ctx }) => {
      const { db, authorize } = ctx;

      const result = await db.query.criteria.findFirst({
        where: eq(criteria.contestId, input.id),
      });

      await authorize(result!.contestId);

      return result;
    }),
  listByContestId: protectedProcedure
    .input(z.object({ contestId: z.string() }))
    .meta({
      check: { permission: "view" },
    })
    .query(async ({ ctx, input }) => {
      const { db, authorize } = ctx;

      await authorize(input.contestId);

      const result = await db.query.criteria.findMany({
        where: eq(criteria.contestId, input.contestId),
      });

      return result;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .meta({
      check: { permission: "manage" },
    })
    .mutation(async ({ input, ctx }) => {
      const { db, authorize } = ctx;
      const { id } = input;

      const data = await db.query.criteria.findFirst({
        where: eq(criteria.id, id),
        columns: {
          contestId: true,
        },
      });

      await authorize(data!.contestId);

      await db.delete(criteria).where(eq(criteria.id, id));
    }),
});
