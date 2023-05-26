import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { criteria } from "~/server/schema";
import * as z from "zod";

export const insertCriteriaSchema = createInsertSchema(criteria, {
  weight: z.coerce.number(),
}).omit({
  id: true,
});

export const updateCriteriaSchema = createInsertSchema(criteria, {
  weight: z.coerce.number(),
}).merge(
  z.object({
    id: z.string(),
  })
);

export const selectCriteriaSchema = createSelectSchema(criteria);
export type Criteria = z.infer<typeof selectCriteriaSchema>;
