import { eq } from "drizzle-orm";
import { Context } from "../context";
import { contests } from "../schema";
import { TRPCError } from "@trpc/server";

export async function checkContest(contestId: string, db: Context["db"]) {
  const contest = await db.query.contests.findFirst({
    where: eq(contests.id, contestId),
  });

  if (!contest) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Contest not found",
    });
  }
}
