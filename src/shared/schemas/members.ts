import { z } from "zod";
import { roleSchema } from "~/server/helpers/authz";

export const addMemberSchema = z.object({
  contestId: z.coerce.number(),
  email: z.string().email(),
  role: roleSchema,
});

export const updateMemberSchema = z.object({
  contestId: z.coerce.number(),
  userId: z.string(),
  role: roleSchema,
});

export const selectMembersSchema = z.object({
  userId: z.string(),
  role: roleSchema,
  email: z.string().email(),
});

export type Member = z.infer<typeof selectMembersSchema>;
