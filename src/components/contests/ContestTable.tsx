import { NavLink } from "react-router-dom";
import { Contest } from "~/shared/schemas/contests";
import { Button } from "../ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/DropdownMenu";
import { MoreVerticalIcon } from "lucide-react";
import { format } from "date-fns";
import { trpc } from "~/utils/trpc";
import { toast } from "react-hot-toast/headless";

export type ContestTableProps = {
  contests: Contest[];
};

export function ContestTable({ contests }: ContestTableProps) {
  const utils = trpc.useContext();
  const { mutate, isLoading } = trpc.contest.delete.useMutation({
    onSuccess: () => {
      utils.contest.invalidate();
    },
    onError: (e) => {
      toast.error(`Failed to delete contest:\n\n${e}`);
    },
  });

  return (
    <ul role="list" className="divide-y divide-gray-800">
      {contests.map((contest) => (
        <li
          key={contest.id}
          className="relative flex justify-between gap-x-6 py-5"
        >
          <div className="relative flex gap-x-4">
            <div className="min-w-0 flex-auto">
              <p className="text-sm font-semibold leading-6 text-white">
                <NavLink to={`/app/${contest.id}`}>
                  <span className="absolute inset-x-0 -top-px bottom-0" />
                  {contest.name}
                </NavLink>
              </p>
              <p className="mt-1 flex text-xs leading-5 text-gray-500 max-w-fit">
                <span className="relative truncate">
                  {contest.startsAt} - {contest.endsAt}
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-none items-center gap-x-4">
            <Button variant="link" className="bg-prim px-4 py-2 text-base">
              <NavLink to={`/app/${contest.id}`}>
                View contest<span className="sr-only">, {contest.name}</span>
              </NavLink>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <span className="sr-only">Open options</span>
                  <MoreVerticalIcon className="h-5 w-5" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  disabled={isLoading}
                  asChild
                  className="cursor-pointer"
                >
                  <NavLink to={`/app/${contest.id}`}>View</NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isLoading}
                  onClick={() => mutate({ id: contest.id })}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </li>
      ))}
    </ul>
  );
}
