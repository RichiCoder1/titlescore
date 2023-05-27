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
import { Contestant } from "~/shared/schemas/contestants";
import { trpc } from "~/utils/trpc";
import { PuffLoader } from "react-spinners";
import { CreateContestantsDialog } from "~/components/contestants/CreateContestantDialog";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/Button";
import { PlusCircle } from "lucide-react";
import { cn } from "~/utils/styles";
import { DialogTrigger } from "~/components/ui/Dialog";
import { UpdateContestantsDialog } from "~/components/contestants/UpdateContestantDialog";
import toast from "react-hot-toast/headless";
import { ItemActions } from "~/components/ui/tableParts/ItemActions";
import { useRole } from "~/utils/auth";
import { Link } from "react-router-dom";

export function Contestants({ contestId }: { contestId: string }) {
  const { role, canManage } = useRole({ contestId });

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

  const columns = useMemo(() => {
    const colHelper = createColumnHelper<Contestant>();
    const cols: ColumnDef<Contestant>[] = [
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "stageName",
        header: "Stage Name",
      },
    ];

    if (role === "judge") {
      cols.push(
        colHelper.display({
          id: "score",
          size: 100,
          cell: (props) => (
            <Button variant="link">
              <Link
                to={`/app/${contestId}/contestant/${props.row.original.id}`}
              >
                View and Score
              </Link>
            </Button>
          ),
        })
      );
    }

    if (canManage) {
      cols.push(
        colHelper.display({
          id: "actions",
          cell: ({ row }) => (
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
          ),
        })
      );
    }

    return cols;
  }, [role]);

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
                        key={cell.id}
                        className={cn({
                          "w-1 whitespace-nowrap": cell.getValue() == null,
                        })}
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
