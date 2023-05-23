/* eslint-disable camelcase */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import {
  addContestMembers,
  getContestMembers,
  getRelation,
  removeContestMembers,
} from "../helpers/authz";
import { inviteMemberSchema } from "~/shared/schemas/members";
import ky from "ky";
import { contests } from "../schema";
import { eq } from "drizzle-orm";

export const membersRouter = router({
  invite: protectedProcedure
    .input(inviteMemberSchema)
    .meta({ check: { permission: "manage" } })
    .mutation(async ({ input, ctx }) => {
      const { authClient, db, authorize, clerk } = ctx;

      await authorize(input.contestId);

      const contest = await db.query.contests.findFirst({
        where: eq(contests.id, input.contestId),
      });

      const matchingUsers = await clerk.users.getUserList({
        emailAddress: [input.email],
      });

      const targetUser = matchingUsers.shift();

      let userId: string;
      if (targetUser == null) {
        const createdUser = await clerk.users.createUser({
          emailAddress: [input.email],
        });

        userId = createdUser.id;
      } else {
        userId = targetUser.id;
      }

      const token = await clerk.signInTokens.createSignInToken({
        userId,
        expiresInSeconds: 60 * 60 * 3,
      });

      const verifyLink = new URL(`${ctx.baseUrl}/app/verify`);
      verifyLink.searchParams.set("token", token.token);
      verifyLink.searchParams.set("redirectTo", `${ctx.baseUrl}/app/contests/${input.contestId}`);

      await addContestMembers(authClient, input.contestId, [
        {
          userId,
          relation: input.role,
        },
      ]);

      await ky.post('https://api.sendgrid.com/v3/mail/send', {
        headers: {
          "Authorization": `Bearer ${ctx.env.SENDGRID_API_KEY}`,
        },
        json: {
          personalizations: [
            { to: [{ email: input.email }] }
          ],
          from: { email: "no-reply@titlescore.app" },
          template_id: ctx.env.SENDGRID_INVITE_TEMPLATE_ID,
          dynamic_template_data: {
            contestId: input.contestId,
            contestName: contest!.name,
            role: input.role,
            appUrl: verifyLink.toString(),
          }
        }
      });
    }),
  resendInvite: protectedProcedure
    .input(inviteMemberSchema)
    .meta({ check: { permission: "manage" } })
    .mutation(async ({ input, ctx }) => {
      const { db, authorize, clerk, authClient } = ctx;

      await authorize(input.contestId);

      const contest = await db.query.contests.findFirst({
        where: eq(contests.id, input.contestId),
      });

      const matchingUsers = await clerk.users.getUserList({
        emailAddress: [input.email],
      });

      const targetUser = matchingUsers.shift();
      if (!targetUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No user with that email found."
        });
      }

      const userId = targetUser.id;

      const token = await clerk.signInTokens.createSignInToken({
        userId,
        expiresInSeconds: 60 * 60 * 3,
      });

      const verifyLink = new URL(`${ctx.baseUrl}/app/verify`);
      verifyLink.searchParams.set("token", token.token);
      verifyLink.searchParams.set("redirectTo", `${ctx.baseUrl}/app/contests/${input.contestId}`);

      await addContestMembers(authClient, input.contestId, [
        {
          userId,
          relation: input.role,
        },
      ]);

      await ky.post('https://api.sendgrid.com/v3/mail/send', {
        headers: {
          "Authorization": `Bearer ${ctx.env.SENDGRID_API_KEY}`,
        },
        json: {
          personalizations: [
            { to: [{ email: input.email }] }
          ],
          from: { email: "no-reply@titlescore.app" },
          template_id: ctx.env.SENDGRID_INVITE_TEMPLATE_ID,
          dynamic_template_data: {
            contestId: input.contestId,
            contestName: contest!.name,
            role: input.role,
            appUrl: verifyLink.toString(),
          }
        }
      });
    }),
  listByContestId: protectedProcedure
    .input(z.object({ contestId: z.number() }))
    .meta({ check: { permission: "view" } })
    .query(async ({ ctx, input }) => {
      const { authClient, authorize, clerk } = ctx;

      await authorize(input.contestId);

      const result = await getContestMembers(authClient, input.contestId);
      const userIds = result.map((member) => member.userId);

      const membersResult = await clerk.users.getUserList({
        userId: userIds,
      });

      return membersResult.map((user) => ({
        userId: user.id,
        email: user.emailAddresses.find(email => email.id == user.primaryEmailAddressId)?.emailAddress,
        role: result.find((member) => member.userId === user.id)?.relation,
      }));
    }),
  delete: protectedProcedure
    .input(z.object({ contestId: z.number(), userId: z.string() }))
    .meta({ check: { permission: "manage" } })
    .mutation(async ({ input, ctx }) => {
      const { authClient, authorize } = ctx;
      const { userId } = input;

      if (userId === ctx.user?.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot remove yourself from the contest.",
        });
      }

      await authorize(input.contestId);

      const role = await getRelation(
        authClient,
        input.userId,
        input.contestId
      );

      await removeContestMembers(authClient, input.contestId, [
        { userId: input.userId, relation: role! },
      ]);
    }),
});
