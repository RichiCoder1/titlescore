import { Navigate, useParams } from "react-router";
import { trpc } from "~/utils/trpc";
import { format } from "date-fns";
import { Criteria } from "./parts/Criteria";
import { Separator } from "~/components/ui/Separator";
import { Contestants } from "./parts/Contestants";
import { Members } from "./parts/Members";

export function ContestsIndexPage() {
  const { contestId: rawId } = useParams();
  const contestId = Number(rawId);
  const {
    data: contest,
    isLoading,
    error,
  } = trpc.contest.get.useQuery({
    id: contestId,
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error?.data?.code === "NOT_FOUND" || (!isLoading && contest == null)) {
    return <Navigate to={`/app?message=No Contest with that Id found`} />;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">{contest.name}</h1>
      <p className="mt-1 text-xd leading-6 text-gray-500 max-w-fit">
        <span className="relative truncate">
          {format(contest.startsAt, "PPP")} - {format(contest.endsAt, "PPP")}
        </span>
      </p>
      <Separator className="my-4" />
      <div className="mt-4 flex flex-col gap-4">
        <Criteria contestId={contestId} />
        <Contestants />
        <Members />
      </div>
    </div>
  );
}
