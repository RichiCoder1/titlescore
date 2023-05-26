import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { contests } from "~/server/schema";
import * as z from "zod";

export const insertContestSchema = createInsertSchema(contests).omit({
  id: true,
  creatorId: true,
});

export const selectContestSchema = createSelectSchema(contests);
export type Contest = z.infer<typeof selectContestSchema>;
