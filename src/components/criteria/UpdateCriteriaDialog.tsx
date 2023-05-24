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
import { Criteria, updateCriteriaSchema } from "~/shared/schemas/criteria";

export type UpdateCriteriaDialogProps = PropsWithChildren<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  criteria: Criteria;
}>;

const formSchema = updateCriteriaSchema;

export function UpdateCriteriaDialog({
  children,
  open,
  onOpenChange,
  criteria,
}: UpdateCriteriaDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...criteria,
    },
  });
  const { reset } = form;
  const onShowDialog = useCallback(
    (open: boolean) => {
      onOpenChange?.(open);
      reset({
        ...criteria,
      });
    },
    [onOpenChange, reset]
  );
  const formId = useId();
  const navigate = useNavigate();
  const utils = trpc.useContext();

  const { mutateAsync, isLoading } = trpc.criteria.update.useMutation({
    onMutate: async (criteria) => {
      await utils.criteria.listByContestId.cancel({
        contestId: criteria.contestId,
      });
      const previousList = utils.criteria.listByContestId.getData({
        contestId: criteria.contestId,
      });
      const previousCriteria = utils.criteria.get.getData({ id: criteria.id });
      utils.criteria.listByContestId.setData(
        { contestId: criteria.contestId },
        (old) =>
          (old ?? []).map((crit) => {
            if (crit.id == criteria.id) {
              return Object.assign({}, crit, criteria);
            }
            return crit;
          })
      );
      utils.criteria.get.setData({ id: criteria.id }, () => criteria as any);
      return { previousList, previousCriteria };
    },
    onError: (e, target, context) => {
      console.error("test", e);
      toast.error(`Failed to create criteria:\n\n${e}`);
      utils.criteria.listByContestId.setData(
        { contestId: target.contestId },
        context!.previousList
      );
      utils.criteria.get.setData(
        { id: criteria.id },
        context?.previousCriteria
      );
    },
    onSettled(_, __, vars) {
      utils.criteria.listByContestId.invalidate({
        contestId: vars.contestId,
      });
      utils.criteria.get.invalidate({ id: vars.id });
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
            <DialogTitle>Create Criteria</DialogTitle>
            <DialogDescription>Create a new criteria.</DialogDescription>
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
                    <Input placeholder="Presentation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? undefined} />
                  </FormControl>
                  <FormDescription>
                    A short description of the criteria. This is not required,
                    but recommended to give organizers and judges context.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={field.value ?? undefined}
                      min={0}
                    />
                  </FormControl>
                  <FormDescription>
                    The relative weight of this criteria. Judges may assign a
                    score from zero up to this max.
                  </FormDescription>
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
