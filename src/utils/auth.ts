import { useUser } from "@clerk/clerk-react";
import { trpc } from "./trpc";

export function useRole({ contestId }: { contestId: string }) {
  const { user } = useUser();
  if (!user) {
    return {
      role: "anonymous",
      canAdmin: false,
      canManage: false,
      canView: false,
      canScore: false,
    };
  }

  const { data: role } = trpc.contest.getRole.useQuery({
    id: contestId,
  });
  const canAdmin = role === "owner";
  const canManage = canAdmin || role === "organizer";
  const canView = canManage || role === "judge";
  return { role, canAdmin, canManage, canView, canScore: canView };
}
