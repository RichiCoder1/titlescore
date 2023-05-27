import { useUser } from "@clerk/clerk-react";
import { trpc } from "./trpc";
import { useEffect } from "react";

export function useRole({ contestId }: { contestId: string }) {
  const { user } = useUser();

  const utils = trpc.useContext();
  const { data } = trpc.contest.getRole.useQuery({
    id: contestId,
  });
  useEffect(() => {
    if (data && user && data.userId !== user.id) {
      utils.contest.getRole.invalidate({ id: contestId });
    }
  }, [user, data]);

  if (!user || !data) {
    return {
      role: "anonymous",
      canAdmin: false,
      canManage: false,
      canView: false,
      canScore: false,
    };
  }

  const role = data?.relation;

  const canAdmin = role === "owner";
  const canManage = canAdmin || role === "organizer";
  const canView = canManage || role === "judge";
  return { role, canAdmin, canManage, canView, canScore: canView };
}
