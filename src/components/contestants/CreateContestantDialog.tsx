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
import { insertContestantsSchema } from "~/shared/schemas/contestants";

export type CreateContestantsDialogProps = PropsWithChildren<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contestId: string;
}>;

const formSchema = insertContestantsSchema;

export function CreateContestantsDialog({
  children,
  open,
  onOpenChange,
  contestId,
}: CreateContestantsDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contestId,
    },
  });
  const { reset } = form;
  const onShowDialog = useCallback(
    (open: boolean) => {
      onOpenChange?.(open);
      reset({
        contestId,
      });
    },
    [onOpenChange, reset]
  );
  const formId = useId();
  const navigate = useNavigate();
  const utils = trpc.useContext();

  const { mutateAsync, isLoading } = trpc.contestants.create.useMutation({
    onMutate: async (contestants) => {
      await utils.contestants.listByContestId.cancel({ contestId });
      const previous = utils.contestants.listByContestId.getData({ contestId });
      utils.contestants.listByContestId.setData({ contestId }, (old) => [
        ...(old ?? []),
        {
          ...contestants,
          id: -1,
        } as any,
      ]);
      return { previous };
    },
    onError: (e, _, context) => {
      console.error("test", e);
      toast.error(`Failed to create contestants:\n\n${e}`);
      utils.contestants.listByContestId.setData(
        { contestId },
        context!.previous
      );
    },
    onSettled() {
      utils.contestants.listByContestId.invalidate();
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
          </DialogHeader>
          <form
            id={formId}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2 pb-4"
          >
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
            <input type="hidden" value={contestId} />
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
