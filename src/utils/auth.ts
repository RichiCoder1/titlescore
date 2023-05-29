import { useUser } from "@clerk/clerk-react";
import { trpc } from "./trpc";
import { useEffect } from "react";

export function useContestMember({ contestId }: { contestId: string }) {
  const { user } = useUser();

  const utils = trpc.useContext();
  const { data } = trpc.contest.me.useQuery({
    id: contestId,
  });
  useEffect(() => {
    if (data && user && data.userId !== user.id) {
      utils.contest.me.invalidate({ id: contestId });
    }
  }, [user, data, utils.contest.me, contestId]);

  if (!user || !data) {
    return {
      displayName: "Anonymous",
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
  const canScore = role === "judge" || role === "tally";
  return {
    role,
    canAdmin,
    canManage,
    canView,
    canScore,
    displayName: data.displayName,
  };
}
