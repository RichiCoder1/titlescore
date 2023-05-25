import { MoreVerticalIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../DropdownMenu";
import { Button } from "../Button";
import { DialogTrigger } from "../Dialog";
import { ReactNode } from "react";

export type ItemActionsProps = {
  onEditClick: () => void;
  onDeleteClick: () => void;
  disabled: boolean;
  title?: string;
  children?: ReactNode;
};

export function ItemActions(props: ItemActionsProps) {
  return (
    <div className="w-full flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="px-2">
            <span className="sr-only">Open options</span>
            <MoreVerticalIcon className="h-5 w-5" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {props.children}
          <DialogTrigger asChild>
            <DropdownMenuItem
              disabled={props.disabled}
              className="cursor-pointer"
              onClick={() => props.onEditClick()}
              title={props.title}
            >
              Edit
            </DropdownMenuItem>
          </DialogTrigger>

          <DropdownMenuItem
            disabled={props.disabled}
            onClick={() => props.onDeleteClick()}
            title={props.title}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
