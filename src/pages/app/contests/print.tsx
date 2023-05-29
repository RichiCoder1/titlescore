import { Navigate, useParams } from "react-router";
import { trpc } from "~/utils/trpc";
import { Separator } from "~/components/ui/Separator";
import "./print.css";
import { useEffect } from "react";
import { CriteriaPrintForm } from "~/components/print/CriteriaPrintForm";
import { Button } from "~/components/ui/Button";
import { useAuth } from "@clerk/clerk-react";
import { useContestMember } from "~/utils/auth";

export function ContestFormPrint() {
  const { contestId } = useParams();
  if (!contestId) {
    throw new Error("Missing contestId.");
  }

  const { userId } = useAuth();
  const { role, displayName } = useContestMember({ contestId });

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

  useEffect(() => {
    const hasDark = window.document.documentElement.classList.contains("dark");
    if (hasDark) {
      document.documentElement.classList.remove("dark");
      return () => {
        document.documentElement.classList.add("dark");
      };
    }
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error?.data?.code === "NOT_FOUND" || (!isLoading && contest == null)) {
    return <Navigate to={`/app?message=No Contest with that Id found`} />;
  }

  return (
    <div className="print-page relative mx-auto max-w-[7in] bg-background px-10 py-4 print:mb-[0.5in] print:max-w-none">
      <div className="mb-10 print:hidden">
        <h1 className="text-3xl font-semibold">Print Preview</h1>
        <p>
          Below is a preview of the printed document. You can print this out as
          a paper method of tracking judge scoring and comments.
        </p>
        <Button onClick={() => window.print()}>Print</Button>
        <Separator className="my-4 h-2" />
      </div>
      <header className="absolute inset-x-0 flex items-center justify-end text-xs font-light text-black/30 print:fixed">
        {userId}
      </header>
      <h1 className="text-xl font-semibold">{contest.name}</h1>
      <p className="mt-1 max-w-fit text-xs leading-6 text-gray-500">
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
      <footer className="my-4 flex flex-row items-center justify-end space-x-2 print:fixed print:inset-x-0 print:bottom-0 print:mb-4 print:mt-0">
        <div className="text-xl">Judge:</div>
        <div className="flex h-[50px] min-w-[4in] items-center rounded-md border border-black px-4">
          {role === "judge" ? displayName : null}
        </div>
      </footer>
    </div>
  );
}

export default ContestFormPrint;
