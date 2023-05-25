import { useCallback, PropsWithChildren, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";
import { Button } from "../ui/Button";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/Form";
import { trpc } from "~/utils/trpc";
import { toast } from "react-hot-toast/headless";
import { useNavigate } from "react-router";
import { Member, updateMemberSchema } from "~/shared/schemas/members";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/Select";

export type UpdateMemberDialogProps = PropsWithChildren<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member;
  contestId: number;
}>;

const formSchema = updateMemberSchema;

export function UpdateMemberDialog({
  children,
  open,
  onOpenChange,
  member,
  contestId,
}: UpdateMemberDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...member,
    },
  });
  const { reset } = form;
  const onShowDialog = useCallback(
    (open: boolean) => {
      onOpenChange?.(open);
      reset({
        ...member,
      });
    },
    [onOpenChange, reset]
  );
  const formId = useId();
  const navigate = useNavigate();
  const utils = trpc.useContext();

  const { mutateAsync, isLoading } = trpc.members.update.useMutation({
    onMutate: async (members) => {
      await utils.members.listByContestId.cancel({
        contestId,
      });
      const previousList = utils.members.listByContestId.getData({
        contestId,
      });
      utils.members.listByContestId.setData({ contestId }, (old) =>
        (old ?? []).map((crit) => {
          if (crit.userId == members.userId) {
            return Object.assign({}, crit, members);
          }
          return crit;
        })
      );
      return { previousList };
    },
    onError: (e, target, context) => {
      console.error("test", e);
      toast.error(`Failed to create members:\n\n${e}`);
      utils.members.listByContestId.setData(
        { contestId: target.contestId },
        context!.previousList
      );
    },
    onSettled(_, __, vars) {
      utils.members.listByContestId.invalidate({
        contestId: vars.contestId,
      });
    },
  });

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      await mutateAsync(values);
      onOpenChange?.(false);
    },
    [formId, onOpenChange, navigate]
  );

  return (
    <Dialog open={open} onOpenChange={onShowDialog}>
      {children}
      <Form {...form}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Member Role</DialogTitle>
          </DialogHeader>
          <form
            id={formId}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2 pb-4"
          >
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <>
                  <input {...field} type="hidden" value={field.value} />
                  <FormMessage />
                </>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role for this user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="judge">Judge</SelectItem>
                      <SelectItem value="organizer">Organizer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contestId"
              render={({ field }) => (
                <>
                  <input {...field} type="hidden" value={field.value} />
                  <FormMessage />
                </>
              )}
            />
          </form>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onShowDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" form={formId} disabled={isLoading}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Form>
    </Dialog>
  );
}
