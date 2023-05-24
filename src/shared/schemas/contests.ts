import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { contests } from "~/server/schema";
import * as z from 'zod';

export const insertContestSchema = createInsertSchema(contests, {
  startsAt: z.date(),
  endsAt: z.date(),
}).pick({
  name: true,
  description: true,
  startsAt: true,
  endsAt: true,
});

export const selectContestSchema = createSelectSchema(contests, {
  startsAt: z.date(),
  endsAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Contest = z.infer<typeof selectContestSchema>;
