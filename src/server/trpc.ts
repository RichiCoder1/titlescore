import { DefaultErrorShape, TRPCError, initTRPC } from "@trpc/server";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";
import superjson from "superjson";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { Context } from "./context";
import { checkPermission } from "./helpers/authz";
import { checkContest } from "./helpers/contest";

export type ErrorShape = DefaultErrorShape & {
  trpcCode: TRPC_ERROR_CODE_KEY;
  data: DefaultErrorShape["data"] & {
    zodError?: Record<string, string>;
    prettyMessage?: string;
  };
};

export interface Meta {
  /**
   * The authorization check for this procedure.
   */
  check?: {
    /**
     * The resource type to check against.
     *
     * @default "contest"
     */
    resourceType?: string;
    /**
     * The permission to check for.
     */
    permission: string;
    /**
     * Optional method to get the ZedToken for a given call.
     * @param ctx
     * @returns The ZedToken if any
     */
    token?: (ctx: Context) => Promise<string>;
    /**
     * Whether or not to use a fully consistent check.
     *
     * @default false
     */
    secure?: boolean;
  };
}

const t = initTRPC
  .context<Context>()
  .meta<Meta>()
  .create({
    transformer: superjson,
    errorFormatter(opts) {
      const { shape, error } = opts;
      return {
        ...shape,
        trpcCode: error.code,
        data: {
          ...shape.data,
          zodError:
            error.code === "BAD_REQUEST" && error.cause instanceof ZodError
              ? error.cause.flatten()
              : null,
          prettyMessage:
            error.code === "BAD_REQUEST" && error.cause instanceof ZodError
              ? fromZodError(error.cause)
              : null,
        },
      };
    },
  });

export const router = t.router;
export const middleware = t.middleware;
/**
 * All procedures are protected by default, not currently any public procedures.
 */
export const protectedProcedure = t.procedure.use((opts) => {
  const { ctx, meta } = opts;
  if (!ctx.user?.id) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action.",
    });
  }

  let authorize: (id: string | number) => Promise<void | never> = () =>
    Promise.resolve();

  if (meta?.check) {
    const { authClient, db } = ctx;
    const { resourceType, permission } = meta.check;

    const userId = ctx.user.id;

    authorize = async (id: string | number) => {
      try {
        // If this is a contest procedure, check the contest first.
        if (!resourceType || resourceType === "contest") {
          await checkContest(Number(id), db);
        }

        const result = await checkPermission(authClient, {
          resourceId: id,
          resourceType: resourceType ?? "contest",
          permission,
          userId,
        });

        if (result.permissionship !== true) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to perform this action.",
          });
        }
      } catch (e) {
        console.error("trpc.authorize", { e });
        if (e instanceof TRPCError) throw e;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check permissions:\n\n" + (e as Error)?.message,
        });
      }
    };
  }

  return opts.next({
    ctx: {
      user: {
        id: ctx.user.id!,
        email: ctx.user.email!,
        claims: ctx.user.claims!,
      },
      authorize,
    },
  });
});
