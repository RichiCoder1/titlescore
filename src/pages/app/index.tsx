import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { ContestTable } from "~/components/contests/ContestTable";
import { CreateContestDialog } from "~/components/contests/CreateContestDialog";
import { Button } from "~/components/ui/Button";
import { DialogTrigger } from "~/components/ui/Dialog";
import { trpc } from "~/utils/trpc";

export function IndexPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data, isLoading } = trpc.contest.list.useQuery();
  const isEmpty = !isLoading && data!.length === 0;
  return (
    <>
      <CreateContestDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        shouldNotNavigate
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
              Contests
            </h2>
          </div>
          <div className="flex ml-4 mt-0">
            <DialogTrigger asChild>
              <Button title="Create a new contest">
                <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
              </Button>
            </DialogTrigger>
          </div>
        </div>

        {isEmpty ? (
          <div>
            <div className="text-center mt-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                No contests
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                Get started by creating a new contest.
              </p>
              <div className="mt-6">
                <DialogTrigger asChild>
                  <Button title="Create a new contest">
                    <PlusIcon
                      className="-ml-0.5 mr-1.5 h-5 w-5"
                      aria-hidden="true"
                    />
                    New Contest
                  </Button>
                </DialogTrigger>
              </div>
            </div>
          </div>
        ) : null}

        <h3 className="mt-6 text-lg">Active Contests</h3>
        {isEmpty ? (
          <p
            v-if="!isLoading && contests?.current?.length === 0"
            className="mt-2 text-sm text-gray-400"
          >
            No active contests.
          </p>
        ) : null}
        <ContestTable contests={data ?? []} />
      </CreateContestDialog>
    </>
  );
}
