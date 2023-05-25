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
import { Contestants } from "~/shared/schemas/contestants";
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

export const columns: ColumnDef<Contestants>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "stageName",
    header: "Stage Name",
  },
];

export function Contestants({ contestId }: { contestId: number }) {
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
                    <TableCell>
                      <UpdateContestantsDialog
                        open={row.getIsExpanded()}
                        onOpenChange={row.toggleExpanded}
                        contestants={row.original}
                      >
                        <ItemActions
                          onEditClick={() => row.toggleExpanded()}
                          onDeleteClick={() => mutate({ id: row.original.id })}
                          disabled={isLoading}
                        />
                      </UpdateContestantsDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
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
                Add New Contestants
              </Button>
            </DialogTrigger>
          )}
        </CardFooter>
      </Card>
    </CreateContestantsDialog>
  );
}
