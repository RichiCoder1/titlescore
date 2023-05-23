import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { submitScore } from "~/shared/schemas/scores";

export const scoresRouter = router({
  submitScore: protectedProcedure
    .input(submitScore)
    .meta({
      check: { permission: "score" },
    })
    .mutation(async ({ input, ctx }) => {
      const { dbClient, authorize } = ctx;

      const getContest = await dbClient
        .from("criteria")
        .select("contestId")
        .eq("id", input.criteria_id)
        .single();
      if (getContest.error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: getContest.error.hint,
          cause: getContest.error,
        });
      }

      await authorize(getContest.data.contestId);

      const result = await dbClient.from("scores").upsert([
        {
          judge_id: input.judge_id,
          contestant_id: input.contestant_id,
          criteria_id: input.criteria_id,
          score: input.score ?? undefined,
          comment: input.comment,
        },
      ]);

      if (result.error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error.hint,
          cause: result.error,
        });
      }
      return result.data;
    }),
  get: protectedProcedure
    .input(
      z.object({
        judge_id: z.string(),
        criteria_id: z.string(),
        contestant_id: z.string(),
      })
    )
    .meta({
      check: { permission: "view" },
    })
    .query(async ({ input, ctx }) => {
      const { dbClient, authorize } = ctx;

      const getContest = await dbClient
        .from("criteria")
        .select("contestId")
        .eq("id", input.criteria_id)
        .single();
      if (getContest.error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: getContest.error.hint,
          cause: getContest.error,
        });
      }

      await authorize(getContest.data.contestId);

      const result = await dbClient
        .from("scores")
        .select()
        .eq("judge_id", input.judge_id)
        .eq("criteria_id", input.criteria_id)
        .eq("contestant_id", input.contestant_id)
        .maybeSingle();

      if (result.error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error.hint,
          cause: result.error,
        });
      }

      return result.data;
    }),
  delete: protectedProcedure
    .input(
      z.object({
        judge_id: z.string(),
        criteria_id: z.string(),
        contestant_id: z.string(),
      })
    )
    .meta({
      check: { permission: "manage" },
    })
    .mutation(async ({ input, ctx }) => {
      const { dbClient, authorize } = ctx;

      const getContest = await dbClient
        .from("criteria")
        .select("contestId")
        .eq("id", input.criteria_id)
        .single();

      if (getContest.error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: getContest.error.hint,
          cause: getContest.error,
        });
      }

      await authorize(getContest.data.contestId);

      const result = await dbClient
        .from("criteria")
        .delete()
        .eq("judge_id", input.judge_id)
        .eq("criteria_id", input.criteria_id)
        .eq("contestant_id", input.contestant_id);

      if (result.error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error.hint,
          cause: result.error,
        });
      }
    }),
});
