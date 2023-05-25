import { useCallback, PropsWithChildren, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/Form";
import { trpc } from "~/utils/trpc";
import { toast } from "react-hot-toast/headless";
import { useNavigate } from "react-router";
import {
  Contestants,
  updateContestantsSchema,
} from "~/shared/schemas/contestants";

export type UpdateContestantsDialogProps = PropsWithChildren<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contestants: Contestants;
}>;

const formSchema = updateContestantsSchema;

export function UpdateContestantsDialog({
  children,
  open,
  onOpenChange,
  contestants,
}: UpdateContestantsDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...contestants,
    },
  });
  const { reset } = form;
  const onShowDialog = useCallback(
    (open: boolean) => {
      onOpenChange?.(open);
      reset({
        ...contestants,
      });
    },
    [onOpenChange, reset]
  );
  const formId = useId();
  const navigate = useNavigate();
  const utils = trpc.useContext();

  const { mutateAsync, isLoading } = trpc.contestants.update.useMutation({
    onMutate: async (contestants) => {
      await utils.contestants.listByContestId.cancel({
        contestId: contestants.contestId,
      });
      const previousList = utils.contestants.listByContestId.getData({
        contestId: contestants.contestId,
      });
      const previousContestants = utils.contestants.get.getData({
        id: contestants.id,
      });
      utils.contestants.listByContestId.setData(
        { contestId: contestants.contestId },
        (old) =>
          (old ?? []).map((crit) => {
            if (crit.id == contestants.id) {
              return Object.assign({}, crit, contestants);
            }
            return crit;
          })
      );
      utils.contestants.get.setData(
        { id: contestants.id },
        () => contestants as any
      );
      return { previousList, previousContestants };
    },
    onError: (e, target, context) => {
      console.error("test", e);
      toast.error(`Failed to create contestants:\n\n${e}`);
      utils.contestants.listByContestId.setData(
        { contestId: target.contestId },
        context!.previousList
      );
      utils.contestants.get.setData(
        { id: contestants.id },
        context?.previousContestants
      );
    },
    onSettled(_, __, vars) {
      utils.contestants.listByContestId.invalidate({
        contestId: vars.contestId,
      });
      utils.contestants.get.invalidate({ id: vars.id });
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
            <DialogTitle>Create Contestants</DialogTitle>
            <DialogDescription>Create a new contestants.</DialogDescription>
          </DialogHeader>
          <form
            id={formId}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2 pb-4"
          >
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <>
                  <input {...field} type="hidden" value={field.value} />
                  <FormMessage />
                </>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stageName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Pup Bork" {...field} />
                  </FormControl>
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
