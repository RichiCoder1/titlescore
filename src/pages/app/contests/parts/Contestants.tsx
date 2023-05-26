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
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Contestant } from "~/shared/schemas/contestants";
import { trpc } from "~/utils/trpc";
import { PuffLoader } from "react-spinners";
import { CreateContestantsDialog } from "~/components/contestants/CreateContestantDialog";
import { useState } from "react";
import { Button } from "~/components/ui/Button";
import { PlusCircle } from "lucide-react";
import { cn } from "~/utils/styles";
import { DialogTrigger } from "~/components/ui/Dialog";
import { UpdateContestantsDialog } from "~/components/contestants/UpdateContestantDialog";
import toast from "react-hot-toast/headless";
import { ItemActions } from "~/components/ui/tableParts/ItemActions";
import { useRole } from "~/utils/auth";
import { Link } from "react-router-dom";

export const columns: ColumnDef<Contestant>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "stageName",
    header: "Stage Name",
  },
];

export function Contestants({ contestId }: { contestId: string }) {
  const { canManage } = useRole({ contestId });

  const utils = trpc.useContext();
  const { data, isLoading } = trpc.contestants.listByContestId.useQuery({
    contestId,
  });
  const { mutate } = trpc.contestants.delete.useMutation({
    onSuccess: () => {
      utils.contestants.listByContestId.invalidate({
        contestId,
      });
    },
    onError: (e) => {
      toast.error(`Failed to delete contest:\n\n${e}`);
    },
  });
  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const [showCreate, setShowCreate] = useState(false);

  return (
    <CreateContestantsDialog
      open={showCreate}
      onOpenChange={setShowCreate}
      contestId={contestId}
    >
      <Card>
        <CardHeader>
          <CardTitle>Contestants</CardTitle>
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
                  {canManage ? <TableHead key="view"></TableHead> : null}
                  <TableHead key="actions"></TableHead>
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
                        })}
                        key={cell.id}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="w-1 whitespace-nowrap">
                      <Button variant="link">
                        <Link
                          to={`/app/${contestId}/contestant/${row.original.id}`}
                        >
                          View and Score
                        </Link>
                      </Button>
                    </TableCell>
                    {canManage ? (
                      <TableCell className="w-1">
                        <UpdateContestantsDialog
                          open={row.getIsExpanded()}
                          onOpenChange={row.toggleExpanded}
                          contestants={row.original}
                        >
                          <ItemActions
                            onEditClick={() => row.toggleExpanded()}
                            onDeleteClick={() =>
                              mutate({ id: row.original.id })
                            }
                            disabled={isLoading}
                          />
                        </UpdateContestantsDialog>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              ) : !isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
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
            hidden: !canManage,
          })}
        >
          {isLoading ? (
            <PuffLoader className="my-4" color="hsl(var(--primary))" />
          ) : (
            <DialogTrigger asChild>
              <Button onClick={() => setShowCreate(true)}>
                <PlusCircle className="mr-2 h-5 w-5" />
                Add New Contestants
              </Button>
            </DialogTrigger>
          )}
        </CardFooter>
      </Card>
    </CreateContestantsDialog>
  );
}
