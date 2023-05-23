import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import {
  addContestMembers,
  getContestIdsByUser,
  getRelation,
} from "../helpers/authz";
import { contests } from "../schema";
import { eq, inArray } from "drizzle-orm";

export const contestRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().nullish(),
        startsAt: z.coerce.date(),
        endsAt: z.coerce.date(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const {
        user: { id },
        db,
        authClient,
      } = ctx;

      const result = await db.insert(contests).values({
        name: input.name,
        description: input.description ?? '',
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        creatorId: id,
      }).returning().all();

      const newContestId = result[0].id;

      await addContestMembers(authClient, newContestId, [
        {
          userId: id,
          relation: "owner",
        },
      ]);

      return result;
    }),
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .meta({
      check: {
        permission: "view",
      },
    })
    .query(async ({ input, ctx }) => {
      const { db, authorize } = ctx;

      await authorize(input.id);

      const result = await db
        .query
        .contests
        .findFirst({
          where: eq(contests.id, input.id)
        });
      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND"
        });
      }
      return result;
    }),
  list: protectedProcedure.query(async ({ ctx }) => {
    const {
      db,
      authClient,
      user: { id },
    } = ctx;

    const contestIds = await getContestIdsByUser(authClient, id);

    const result = await db
      .query
      .contests
      .findMany({
        where: inArray(contests.id, contestIds)
      });

    if (!result) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Receeved empty result set"
      });
    }
    return result;
  }),
  getRole: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      const {
        authClient,
        user: { id },
      } = ctx;

      return getRelation(authClient, id, input.id);
    }),
  getRelations: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      const {
        authClient,
        user: { id },
      } = ctx;

      return getRelation(authClient, id, input.id);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .meta({
      check: {
        permission: "admin",
      },
    })
    .mutation(async ({ input, ctx }) => {
      const { db, authorize } = ctx;
      const { id } = input;

      await authorize(id);

      const result = await db.delete(contests).where(eq(contests.id, id)).run();

      if (result.error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error,
        });
      }
    }),
});
