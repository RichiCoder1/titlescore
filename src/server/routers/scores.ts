import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { updateScoreSchema } from "~/shared/schemas/scores";
import { contestMembers, scores } from "../schema";
import { and, eq, inArray } from "drizzle-orm";
import { groupBy } from "lodash-es";
import { getContestMembers } from "../helpers/authz";

export const scoresRouter = router({
  updateScore: protectedProcedure
    .input(updateScoreSchema)
    .meta({
      check: { permission: "write_score" },
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
        contestId: z.string(),
      })
    )
    .meta({
      check: { permission: "score_status" },
    })
    .query(async ({ input, ctx }) => {
      const { db, authorize, authClient } = ctx;
      await authorize(input.contestId);
      const judgeConnections = await getContestMembers(
        authClient,
        input.contestId,
        "judge"
      );

      const judges = await db.query.contestMembers.findMany({
        where: inArray(
          contestMembers.userId,
          judgeConnections.map(({ userId }) => userId)
        ),
      });

      const criteria = await db.query.criteria.findMany({
        where: eq(scores.contestId, input.contestId),
      });

      const contestantScores = await db.query.contestants.findMany({
        where: eq(scores.contestId, input.contestId),
        with: {
          scores: true,
        },
      });

      const mapped = contestantScores.map((contestant) => {
        const scoreSummary = judgeConnections.map(({ userId }) => {
          const judgeScores = contestant.scores.filter(
            (score) => score.judgeId === userId
          );
          return {
            judgeId: userId,
            criteria: criteria.map((criterion) => {
              const score = judgeScores.find(
                (score) => score.criteriaId === criterion.id
              );
              return {
                criteriaId: criterion.id,
                name: criterion.name,
                weight: criterion.weight,
                score,
              };
            }),
          };
        });
        return {
          id: contestant.id,
          name: contestant.name,
          judges: scoreSummary,
        };
      });

      return {
        contestants: mapped,
        judges: judges,
      };
    }),
  myScores: protectedProcedure
    .input(
      z.object({
        judgeId: z.string(),
        contestantId: z.string(),
        contestId: z.string(),
      })
    )
    .meta({
      check: { permission: "write_score" },
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
  calculate: protectedProcedure
    .input(
      z.object({
        contestId: z.string(),
      })
    )
    .meta({
      check: { permission: "finalize_score" },
    })
    .query(async ({ input, ctx }) => {
      const { db, authorize } = ctx;
      await authorize(input.contestId);

      const contestantScores = await db.query.contestants.findMany({
        where: eq(scores.contestId, input.contestId),
        with: {
          scores: true,
        },
      });

      const mapped = contestantScores.map((contestant) => {
        const scores = contestant.scores;
        const byCriteria = groupBy(scores, (score) => score.criteriaId);
        const criteriaScores = Object.entries(byCriteria).map(
          ([criteriaId, scores]) => {
            let dropped: {
              high: { judgeId: string; score: number };
              low: { judgeId: string; score: number };
            } | null = null;
            if (scores.length >= 5) {
              const sorted = scores.sort((a, b) => a.score! - b.score!);
              const high = sorted.pop();
              const low = sorted.shift();
              dropped = {
                high: {
                  judgeId: high!.judgeId,
                  score: high!.score!,
                },
                low: {
                  judgeId: low!.judgeId,
                  score: low!.score!,
                },
              };
              const average =
                sorted.reduce((acc, score) => acc + score.score!, 0) /
                sorted.length;
              return {
                criteriaId,
                average,
                dropped,
              };
            } else {
              const average =
                scores.reduce((acc, score) => acc + score.score!, 0) /
                scores.length;
              return {
                criteriaId,
                average,
                dropped,
              };
            }
          }
        );
        return {
          contestantId: contestant.id,
          name: contestant.name,
          scores: criteriaScores,
        };
      });

      const totalScores = mapped.map((contestant) => {
        const total = contestant.scores.reduce(
          (acc, { average }) => acc + average,
          0
        );
        return {
          ...contestant,
          total,
        };
      });

      return totalScores;
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
