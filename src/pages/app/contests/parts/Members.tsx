import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/Card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "~/components/ui/Table";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Member } from "~/shared/schemas/members";
import { trpc } from "~/utils/trpc";
import { PuffLoader } from "react-spinners";
import { AddMemberDialog } from "~/components/members/AddMemberDialog";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/Button";
import { PlusCircle } from "lucide-react";
import { cn } from "~/utils/styles";
import { DialogTrigger } from "~/components/ui/Dialog";
import toast from "react-hot-toast/headless";
import { ItemActions } from "~/components/ui/tableParts/ItemActions";
import { useUser } from "@clerk/clerk-react";
import { DropdownMenuItem } from "~/components/ui/DropdownMenu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/Tooltip";

const baseColumnDefs: ColumnDef<Member>[] = [
  {
    accessorFn: (row) => row.displayName ?? row.email,
    header: "User",
    cell: ({ cell, row }) => (
      <Tooltip>
        <TooltipTrigger>{cell.renderValue() as string}</TooltipTrigger>
        <TooltipContent>{row.original.email}</TooltipContent>
      </Tooltip>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
  },
];

export function Members({ contestId }: { contestId: string }) {
  const { user } = useUser();
  const utils = trpc.useContext();
  const { data, isLoading } = trpc.members.listByContestId.useQuery(
    {
      contestId,
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 1 * 60 * 60 * 1000,
    }
  );
  const { mutate: resend } = trpc.members.resendInvite.useMutation();
  const { mutate } = trpc.members.delete.useMutation({
    onSuccess: () => {
      utils.members.listByContestId.invalidate({
        contestId,
      });
    },
    onError: (e) => {
      toast.error(`Failed to delete contest:\n\n${e}`);
    },
  });

  const colHelper = createColumnHelper<Member>();
  const columns = useMemo(() => {
    return [
      ...baseColumnDefs,
      colHelper.display({
        id: "actions",
        cell: ({ row }) => (
          <ItemActions
            onDeleteClick={() =>
              mutate({
                contestId: contestId,
                userId: row.original.userId,
              })
            }
            disabled={isLoading || row.original.userId == user?.id}
          >
            <DropdownMenuItem
              onClick={() =>
                resend({
                  contestId: contestId,
                  email: row.original.email,
                  role: row.original.role,
                })
              }
              disabled={isLoading || row.original.userId == user?.id}
            >
              Resend Invite Link
            </DropdownMenuItem>
          </ItemActions>
        ),
      }),
    ];
  }, [colHelper, isLoading, user?.id, mutate, contestId, resend]);

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const [showCreate, setShowCreate] = useState(false);

  return (
    <AddMemberDialog
      open={showCreate}
      onOpenChange={setShowCreate}
      contestId={contestId}
    >
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        className={cn({
                          "line-clamp-5":
                            cell.column.columnDef.header === "Description",
                          "w-1 whitespace-nowrap": cell.getValue() == null,
                        })}
                        key={cell.id}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={baseColumnDefs.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter
          className={cn("flex", {
            "justify-center": isLoading,
            "justify-end": !isLoading,
          })}
        >
          {isLoading ? (
            <PuffLoader className="my-4" color="hsl(var(--primary))" />
          ) : (
            <DialogTrigger asChild>
              <Button onClick={() => setShowCreate(true)}>
                <PlusCircle className="mr-2 h-5 w-5" />
                Add New Members
              </Button>
            </DialogTrigger>
          )}
        </CardFooter>
      </Card>
    </AddMemberDialog>
  );
}
