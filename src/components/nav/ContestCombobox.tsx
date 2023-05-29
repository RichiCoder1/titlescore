"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";

import { cn } from "@/utils/styles";
import { Button } from "@/components/ui/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { DialogTrigger } from "../ui/Dialog";
import { trpc } from "~/utils/trpc";
import { CreateContestDialog } from "../contests/CreateContestDialog";
import { useNavigate, useParams } from "react-router";
import { useEffect } from "react";

export function ContestCombobox() {
  const { contestId } = useParams();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(contestId ?? "");
  const [showCreateContest, setShowCreateContest] = React.useState(false);
  const navigate = useNavigate();

  const { data, isLoading } = trpc.contest.list.useQuery(undefined, {
    suspense: false,
  });

  useEffect(() => {
    setValue(contestId ?? "");
  }, [contestId, setValue]);

  return (
    <CreateContestDialog
      open={showCreateContest}
      onOpenChange={setShowCreateContest}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between !bg-gray-900"
            title="Contest Selector"
            disabled={isLoading}
          >
            {value
              ? data?.find((contest) => `${contest.id}` === value)?.name
              : "Select contest..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search contests..." />
              <CommandEmpty>No contests found.</CommandEmpty>
              <CommandGroup>
                {data?.map((contest) => (
                  <CommandItem
                    key={contest.id}
                    value={`${contest.id}`}
                    onSelect={(currentValue) => {
                      setOpen(false);
                      if (currentValue === value) {
                        return;
                      }
                      setValue(value);
                      navigate(`/app/${contest.id}`);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === `${contest.id}` ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {contest.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      setShowCreateContest(true);
                    }}
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create Contest
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </CreateContestDialog>
  );
}
