import { z } from "zod";

export const createCriteriaSchema = z.object({
  contestId: z.number().positive(),
  name: z.string(),
  description: z.string(),
  weight: z.coerce.number().int().positive(),
});
