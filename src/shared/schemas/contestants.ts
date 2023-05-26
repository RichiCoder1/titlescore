import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { contestants } from "~/server/schema";
import * as z from "zod";

export const insertContestantsSchema = createInsertSchema(contestants).omit({
  id: true,
});

export const updateContestantsSchema = createInsertSchema(contestants).merge(
  z.object({
    id: z.string(),
  })
);

export const selectContestantsSchema = createSelectSchema(contestants);
export type Contestant = z.infer<typeof selectContestantsSchema>;
