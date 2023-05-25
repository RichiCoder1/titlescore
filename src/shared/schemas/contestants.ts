import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { contestants } from "~/server/schema";
import * as z from "zod";

export const insertContestantsSchema = createInsertSchema(contestants, {
  contestId: z.coerce.number(),
}).pick({
  name: true,
  stageName: true,
  contestId: true,
});

export const updateContestantsSchema = createInsertSchema(contestants, {
  contestId: z.coerce.number(),
})
  .pick({
    id: true,
    name: true,
    stageName: true,
    contestId: true,
    // I don't know why this is necessary, but it is.
  })
  .merge(
    z.object({
      id: z.coerce.number().nonnegative(),
    })
  );

export const selectContestantsSchema = createSelectSchema(contestants, {
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Contestants = z.infer<typeof selectContestantsSchema>;
