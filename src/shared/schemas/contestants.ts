import { z } from "zod";

export const createContestantSchema = z.object({
  contestId: z.number(),
  name: z.string(),
  stageName: z.string(),
});
