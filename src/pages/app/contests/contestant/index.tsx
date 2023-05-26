import { useUser } from "@clerk/clerk-react";
import {
  ChevronLeftIcon,
  ClipboardEditIcon,
  Edit2Icon,
  LockIcon,
  SkipBackIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { ScoreEditor } from "~/components/score/ScoreEditor";
import { Button } from "~/components/ui/Button";
import { Separator } from "~/components/ui/Separator";
import { Skeleton } from "~/components/ui/Skeleton";
import { Criteria } from "~/shared/schemas/criteria";
import { cn } from "~/utils/styles";
import { trpc } from "~/utils/trpc";

export function ContestantPage() {
  const { contestId, contestantId } = useParams();
  if (!contestId || !contestantId) {
    throw new Error("Missing contest or contestant id.");
  }

  const { user } = useUser();
  const [contestQuery, contestantQuery, criteriaQuery, scoreSummaryQuery] =
    trpc.useQueries((t) => [
      t.contest.get({ id: contestId }),
      t.contestants.get({ id: contestantId }),
      t.criteria.listByContestId({ contestId }),
      t.scores.summary({
        judgeId: user!.id,
        contestId,
        contestantId,
      }),
    ]);

  const [selectedCriteria, setSelectedCriteria] = useState<Criteria | null>(
    null
  );
  useEffect(() => {
    if (selectedCriteria == null && criteriaQuery.data) {
      setSelectedCriteria(criteriaQuery.data[0]);
    }
  }, [selectedCriteria, criteriaQuery.data]);

  const isLoading = contestQuery.isLoading || contestantQuery.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-[30rem] max-w-full h-10" />
        <Skeleton className="w-full h-8" />
      </div>
    );
  }

  if (!contestantQuery.data) {
    return (
      <div>
        <p>No contestant found.</p>
      </div>
    );
  }

  const contestant = contestantQuery.data!;

  return (
    <>
      <div className="space-y-2">
        <div className="flex flow-row items-center">
          <Button variant="ghost" asChild className="px-4 mr-2">
            <Link to={`/app/${contestId}/`}>
              <ChevronLeftIcon className="w-8 h-8" />
              <span className="sr-only">Go back</span>
            </Link>
          </Button>
          <h2 className="text-xl font-semibold">{contestant.stageName}</h2>
        </div>
        {contestant.name !== contestant.stageName ? (
          <h3>{contestant.name}</h3>
        ) : null}
      </div>
      <Separator className="my-4" />
      <div className="flex w-full gap-x-6 md:flex-row">
        <div className="min-w-[200px]">
          <div className="text-lg">Available Categories</div>
          <ul className="">
            {criteriaQuery.data?.map((criteria) => (
              <li className="list-none mt-4" key={criteria.id}>
                <Button
                  className={cn(
                    "w-full dark:text-white text-semibold inline-flex justify-between",
                    criteria.id === selectedCriteria?.id && "bg-muted"
                  )}
                  variant="link"
                  onClick={() => setSelectedCriteria(criteria)}
                >
                  <div>{criteria.name}</div>
                  {scoreSummaryQuery.data
                    ? scoreSummaryQuery.data
                        .filter((score) => score.criteriaId === criteria.id)
                        .map((score) => (
                          <div
                            key={score.criteriaId}
                            className="ml-2 text-sm font-light text-slate-400 flex items-center"
                          >
                            {score.score ? (
                              score.submittedAt ? (
                                <LockIcon className="h-4 w-4 mr-1 text-slate-500" />
                              ) : (
                                <ClipboardEditIcon className="h-4 w-4 mr-1 text-slate-500" />
                              )
                            ) : null}
                            <span>{score.score}</span>
                            <span>/</span>
                            <span>{criteria.weight}</span>
                          </div>
                        ))
                    : null}
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1">
          {selectedCriteria ? (
            <ScoreEditor
              contestId={contestId}
              contestantId={contestantId}
              judgeId={user!.id}
              criteria={selectedCriteria}
            />
          ) : (
            <p>Select a category.</p>
          )}
        </div>
      </div>
    </>
  );
}
