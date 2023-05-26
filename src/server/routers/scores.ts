import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { updateScoreSchema } from "~/shared/schemas/scores";
import { scores } from "../schema";
import { and, eq } from "drizzle-orm";

export const scoresRouter = router({
  updateScore: protectedProcedure
    .input(updateScoreSchema)
    .meta({
      check: { permission: "score" },
    })
    .mutation(async ({ input, ctx }) => {
      const { db, authorize } = ctx;

      await authorize(input.contestId);

      const result = await db
        .insert(scores)
        .values({
          contestId: input.contestId,
          contestantId: input.contestantId,
          judgeId: input.judgeId,
          criteriaId: input.criteriaId,
          comment: input.comment,
          score: input.score,
        })
        .onConflictDoUpdate({
          target: [scores.judgeId, scores.contestantId, scores.criteriaId],
          set: {
            comment: input.comment,
            score: input.score,
          },
        })
        .returning();

      return result[0];
    }),
  get: protectedProcedure
    .input(
      z.object({
        judgeId: z.string(),
        criteriaId: z.string(),
        contestantId: z.string(),
        contestId: z.string(),
      })
    )
    .meta({
      check: { permission: "view" },
    })
    .query(async ({ input, ctx }) => {
      const { db, authorize } = ctx;
      await authorize(input.contestId);
      return (
        (await db.query.scores.findFirst({
          where: and(
            eq(scores.judgeId, input.judgeId),
            eq(scores.criteriaId, input.criteriaId),
            eq(scores.contestantId, input.contestantId)
          ),
        })) ?? {
          ...input,
        }
      );
    }),
  summary: protectedProcedure
    .input(
      z.object({
        judgeId: z.string(),
        contestantId: z.string(),
        contestId: z.string(),
      })
    )
    .meta({
      check: { permission: "view" },
    })
    .query(async ({ input, ctx }) => {
      const { db, authorize } = ctx;
      await authorize(input.contestId);
      return db.query.scores.findMany({
        where: and(
          eq(scores.judgeId, input.judgeId),
          eq(scores.contestantId, input.contestantId)
        ),
      });
    }),
  delete: protectedProcedure
    .input(
      z.object({
        judgeId: z.string(),
        criteriaId: z.string(),
        contestantId: z.string(),
      })
    )
    .meta({
      check: { permission: "manage" },
    })
    .mutation(async ({ input, ctx }) => {
      const { db, authorize } = ctx;

      const existing = await db.query.scores.findFirst({
        where: and(
          eq(scores.judgeId, input.judgeId),
          eq(scores.criteriaId, input.criteriaId),
          eq(scores.contestantId, input.contestantId)
        ),
      });

      if (!existing) {
        return false;
      }

      await authorize(existing.contestId);

      await db
        .delete(scores)
        .where(
          and(
            eq(scores.judgeId, input.judgeId),
            eq(scores.criteriaId, input.criteriaId),
            eq(scores.contestantId, input.contestantId)
          )
        );
    }),
});
