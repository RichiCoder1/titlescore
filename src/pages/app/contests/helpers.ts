import { createContext, useContext } from "react";
import { Contest } from "~/shared/schemas/contests";
import { trpc } from "~/utils/trpc";

export const ContestContext = createContext<Contest>({} as any);
export const ContestProvider = ContestContext.Provider;

export function useContest() {
  return useContext(ContestContext);
}

export function useContestPermission(permission: string) {
  const contest = useContest();
  const check = trpc.contest.check.useQuery(
    {
      contestId: contest.id,
      permission,
    },
    {
      suspense: true,
    }
  );
  return check.data!;
}
