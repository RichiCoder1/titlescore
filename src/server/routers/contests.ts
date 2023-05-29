import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import {
  addContestMembers,
  checkPermission,
  getContestIdsByUser,
  getRelation,
} from "../helpers/authz";
import { contestMembers, contests } from "../schema";
import { eq, inArray } from "drizzle-orm";
import { insertContestSchema } from "~/shared/schemas/contests";
import { ulid } from "../helpers/ulid";

export const contestRouter = router({
  create: protectedProcedure
    .input(insertContestSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        user: { id },
        db,
        authClient,
      } = ctx;

      const result = await db
        .insert(contests)
        .values({
          id: ulid(),
          name: input.name,
          description: input.description ?? "",
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          creatorId: id,
        })
        .returning();

      const newContestId = result[0].id;

      await addContestMembers(authClient, newContestId, [
        {
          userId: id,
          relation: "owner",
        },
      ]).catch(async (e) => {
        try {
          await db.delete(contests).where(eq(contests.id, newContestId));
        } catch {
          /* empty */
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to add contest permissions:\n\n" + (e as Error).toString(),
        });
      });

      return result[0];
    }),
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .meta({
      check: {
        permission: "view",
      },
    })
    .query(async ({ input, ctx }) => {
      const { db, authorize } = ctx;

      await authorize(input.id);

      const result = await db.query.contests.findFirst({
        where: eq(contests.id, input.id),
      });
      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
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

    if (contestIds.length === 0) {
      return [];
    }

    const result = await db.query.contests.findMany({
      where: inArray(contests.id, contestIds),
    });

    if (!result) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Receeved empty result set",
      });
    }
    return result;
  }),
  me: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const {
        authClient,
        user: { id },
        db,
      } = ctx;

      const user = await db.query.contestMembers.findFirst({
        where: eq(contestMembers.userId, id),
      });

      return {
        relation: await getRelation(authClient, id, input.id),
        userId: id,
        displayName: user?.displayName,
      };
    }),
  getRelations: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      const {
        authClient,
        user: { id },
      } = ctx;

      return getRelation(authClient, id, input.id);
    }),
  check: protectedProcedure
    .input(
      z.object({
        contestId: z.string(),
        permission: z.string(),
      })
    )
    .meta({
      check: {
        permission: "view",
      },
    })
    .query(async ({ ctx, input }) => {
      const {
        authClient,
        user: { id },
        authorize,
      } = ctx;

      const zedToken = await authorize(input.contestId);

      return checkPermission(authClient, {
        ...input,
        resourceId: input.contestId,
        resourceType: "contest",
        userId: id,
        zedToken,
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .meta({
      check: {
        permission: "admin",
      },
    })
    .mutation(async ({ input, ctx }) => {
      const { db, authorize } = ctx;
      const { id } = input;

      await authorize(id);

      await db.delete(contests).where(eq(contests.id, id));
    }),
});
