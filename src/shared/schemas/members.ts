import { z } from "zod";

export const inviteMemberSchema = z.object({
  contestId: z.number(),
  email: z.string().email(),
  role: z.enum(["judge", "owner", "organizer"]),
});
