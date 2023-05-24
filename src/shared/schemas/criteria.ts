import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { criteria } from "~/server/schema";
import * as z from "zod";

export const insertCriteriaSchema = createInsertSchema(criteria, {
  weight: z.coerce.number(),
  contestId: z.coerce.number(),
}).pick({
  name: true,
  description: true,
  weight: true,
  contestId: true,
});

export const updateCriteriaSchema = createInsertSchema(criteria, {
  weight: z.coerce.number(),
  contestId: z.coerce.number(),
})
  .pick({
    id: true,
    name: true,
    description: true,
    weight: true,
    contestId: true,
    // I don't know why this is necessary, but it is.
  })
  .merge(
    z.object({
      id: z.coerce.number().nonnegative(),
    })
  );

export const selectCriteriaSchema = createSelectSchema(criteria, {
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Criteria = z.infer<typeof selectCriteriaSchema>;
