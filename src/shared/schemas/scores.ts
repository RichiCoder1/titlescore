import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";
import { scores } from "~/server/schema";

export const updateScoreSchema = z.object({
  contestId: z.string(),
  judgeId: z.string(),
  criteriaId: z.string(),
  contestantId: z.string(),
  comment: z.string().nullish(),
  score: z.number().nullish(),
});

export const submitScoreSchema = updateScoreSchema.omit({
  comment: true,
  score: true,
});

export const selectScoreSchema = createSelectSchema(scores);
export type Score = z.infer<typeof selectScoreSchema>;
