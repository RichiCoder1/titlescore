import * as z from "zod";

export const submitScore = z.object({
  judge_id: z.string(),
  criteria_id: z.string(),
  contestant_id: z.string(),
  comment: z.string().nullish(),
  score: z.coerce.number().nullish(),
});
