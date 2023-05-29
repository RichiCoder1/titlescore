import { Navigate, useParams } from "react-router";
import { trpc } from "~/utils/trpc";
import { Criteria } from "./parts/Criteria";
import { Separator } from "~/components/ui/Separator";
import { Contestants } from "./parts/Contestants";
import { Members } from "./parts/Members";
import { useContestMember } from "~/utils/auth";
import { Scoring } from "./parts/Scoring";
import { ContestProvider } from "./helpers";
import { useContestInterval } from "~/utils/contest";

export function ContestsIndexPage() {
  const { contestId } = useParams();
  if (!contestId) {
    throw new Error("Missing contestId.");
  }

  const { canManage } = useContestMember({ contestId });

  const {
    data: contest,
    isLoading,
    error,
  } = trpc.contest.get.useQuery({
    id: contestId!,
  });

  const { startPretty, endPretty } = useContestInterval({
    contest,
    relative: false,
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error?.data?.code === "NOT_FOUND" || (!isLoading && contest == null)) {
    return <Navigate to={`/app?message=No Contest with that Id found`} />;
  }

  return (
    <ContestProvider value={contest}>
      <h1 className="text-xl font-semibold">{contest.name}</h1>
      <p className="mt-1 max-w-fit text-xs leading-6 text-gray-500">
        <span className="relative truncate">
          {startPretty} - {endPretty}
        </span>
      </p>
      <Separator className="my-4" />
      <div className="mt-4 flex flex-col gap-4">
        {canManage ? <Scoring contestId={contestId} /> : null}
        <Contestants contestId={contestId} />
        <Criteria contestId={contestId} />
        {canManage ? <Members contestId={contestId} /> : null}
      </div>
    </ContestProvider>
  );
}
