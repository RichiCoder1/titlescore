import {
  AlertTriangleIcon,
  CheckIcon,
  ClipboardEditIcon,
  XCircleIcon,
} from "lucide-react";
import { useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "~/components/ui/Button";
import { Separator } from "~/components/ui/Separator";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/Table";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "~/components/ui/Tooltip";
import { useContest, useContestInterval } from "~/utils/contest";
import { trpc } from "~/utils/trpc";

export const Scoring = ({ contestId }: { contestId: string }) => {
  const { data: contest, isLoading: isLoadingContest } = useContest();
  const { data: summary, isLoading: isLoadingSummary } =
    trpc.scores.summary.useQuery({
      contestId,
    });
  const { data: members } = trpc.members.listByContestId.useQuery({
    contestId,
  });

  const calc = trpc.scores.calculate.useQuery(
    {
      contestId,
    },
    {
      enabled: false,
    }
  );

  useEffect(() => {
    console.log({ scores: calc.data });
  }, [calc.data]);

  const isLoading = isLoadingContest || isLoadingSummary;
  const contestDates = useContestInterval({ contest });
  const hasQuorum = (summary?.judges?.length ?? 0) >= 5;

  const ScoringIndicator = useCallback(function ScoringIndicator({
    criteria,
  }: NonNullable<typeof summary>["contestants"][0]["judges"][0]) {
    return (
      <div className="flex space-x-2">
        {criteria?.map((criterion) => {
          const hasScore = criterion.score != null;
          const isSubmitted = criterion.score?.submittedAt != null;
          return (
            <Tooltip key={criterion.criteriaId}>
              <TooltipTrigger asChild>
                {hasScore ? (
                  isSubmitted ? (
                    <CheckIcon className="text-green-600" />
                  ) : (
                    <ClipboardEditIcon className="text-indigo-400" />
                  )
                ) : (
                  <XCircleIcon className="text-slate-600" />
                )}
              </TooltipTrigger>
              <TooltipContent className="flex flex-col items-center">
                <div>{criterion.name}</div>
                <div>
                  {criterion.score?.score ?? "No Score"} / {criterion.weight}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    );
  },
  []);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mx-4 space-y-2">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold">Scoring</h2>
          {!hasQuorum ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertTriangleIcon className="h-5 w-5 text-orange-500" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                You do not have enough judges assigned to drop high and low
                scores. The final scores will be an average of all judges
                scores.
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
        {!isLoading && !contestDates.isActive ? (
          <p>This contest is not currently active.</p>
        ) : null}
        {!isLoading && contestDates.isActive ? (
          <Table>
            <TableBody>
              {summary?.contestants?.map(({ id, name, judges }) => (
                <TableRow key={id}>
                  <TableCell>{name}</TableCell>
                  {judges.map(({ judgeId, criteria }) => {
                    return (
                      <TableCell key={judgeId} className="">
                        <div className="mb-2 text-sm font-light">
                          {
                            members?.find((member) => member.userId === judgeId)
                              ?.displayName
                          }
                        </div>
                        <ScoringIndicator
                          judgeId={judgeId}
                          criteria={criteria}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
        <div className="flex justify-end space-x-2">
          <Button variant="destructive" onClick={() => calc.refetch()}>
            Calculate Scores
          </Button>
          <Button variant="secondary" asChild>
            <Link
              to={`/api/generate/${contestId}`}
              reloadDocument
              download={true}
            >
              Export Scoring Sheet
            </Link>
          </Button>
        </div>
      </div>
      <Separator className="mt-2" />
    </TooltipProvider>
  );
};
