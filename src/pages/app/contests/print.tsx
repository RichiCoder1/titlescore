import { Navigate, useParams } from "react-router";
import { trpc } from "~/utils/trpc";
import { Separator } from "~/components/ui/Separator";
import "./print.css";
import { useEffect } from "react";
import { CriteriaPrintForm } from "~/components/print/CriteriaPrintForm";
import { Button } from "~/components/ui/Button";

export function ContestFormPrint() {
  const { contestId } = useParams();
  if (!contestId) {
    throw new Error("Missing contestId.");
  }

  const {
    data: contest,
    isLoading,
    error,
  } = trpc.contest.get.useQuery({
    id: contestId!,
  });

  const { data: criteria } = trpc.criteria.listByContestId.useQuery({
    contestId,
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error?.data?.code === "NOT_FOUND" || (!isLoading && contest == null)) {
    return <Navigate to={`/app?message=No Contest with that Id found`} />;
  }

  useEffect(() => {
    const hasDark = window.document.documentElement.classList.contains("dark");
    if (hasDark) {
      document.documentElement.classList.remove("dark");
      return () => {
        document.documentElement.classList.add("dark");
      };
    }
  }, []);

  return (
    <div className="print-page bg-background px-10 py-4 mx-auto max-w-[7in] print:max-w-none">
      <div className="print:hidden mb-10">
        <h1 className="text-3xl font-semibold">Print Preview</h1>
        <p>
          Below is a preview of the printed document. You can print this out as
          a paper method of tracking judge scoring and comments.
        </p>
        <Button onClick={() => window.print()}>Print</Button>
        <Separator className="my-4 h-2" />
      </div>
      <h1 className="text-xl font-semibold">{contest.name}</h1>
      <p className="mt-1 text-xd leading-6 text-gray-500 max-w-fit">
        <span className="relative truncate">
          {contest.startsAt} - {contest.endsAt}
        </span>
      </p>
      <Separator className="my-4" />
      <div className="space-y-20">
        {criteria?.map((criterion) => (
          <CriteriaPrintForm key={criterion.id} criteria={criterion} />
        ))}
      </div>
    </div>
  );
}
