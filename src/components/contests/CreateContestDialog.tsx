import {
  useEffect,
  useCallback,
  PropsWithChildren,
  useId,
  useState,
} from "react";
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
import { format, addYears, formatISO } from "date-fns";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import * as z from "zod";
import { insertContestSchema } from "~/shared/schemas/contests";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/Form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/Calendar";
import { cn } from "~/utils/styles";
import { trpc } from "~/utils/trpc";
import { toast } from "react-hot-toast/headless";
import { useNavigate } from "react-router";
import { useTimezoneSelect, allTimezones } from "react-timezone-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/Select";

export type CreateContestDialogProps = PropsWithChildren<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shouldNotNavigate?: boolean;
}>;

const formSchema = insertContestSchema
  .pick({
    name: true,
    description: true,
  })
  .merge(
    z.object({
      dates: z
        .object({
          from: z.date(),
          to: z.date(),
        })
        .refine((range) => {
          return range.from < range.to;
        }, "Start date must occur before the end date."),
      tz: z.string(),
    })
  );

export function CreateContestDialog({
  children,
  open,
  onOpenChange,
  shouldNotNavigate,
}: CreateContestDialogProps) {
  const [userTz] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tz: userTz,
    },
  });
  const { reset } = form;
  const onShowDialog = useCallback(
    (open: boolean) => {
      onOpenChange?.(open);
      reset({
        tz: userTz,
      });
    },
    [onOpenChange, reset]
  );
  const formId = useId();
  const navigate = useNavigate();
  const utils = trpc.useContext();
  const { options: tzOptions } = useTimezoneSelect({
    labelStyle: "original",
    timezones: allTimezones,
  });

  const { mutateAsync, isLoading } = trpc.contest.create.useMutation({
    onMutate: async (contest) => {
      await utils.contest.list.cancel();
      const previous = utils.contest.list.getData();
      utils.contest.list.setData(undefined, (old) => [
        ...(old ?? []),
        {
          ...contest,
          id: -1,
        } as any,
      ]);
      return { previous };
    },
    onError: (e, _, context) => {
      console.error("test", e);
      toast.error(`Failed to create contest:\n\n${e}`);
      utils.contest.list.setData(undefined, context!.previous);
    },
    onSettled() {
      utils.contest.list.invalidate();
    },
  });

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      const result = await mutateAsync({
        name: values.name,
        description: values.description,
        startsAt: formatISO(values.dates.from, { representation: "date" }),
        endsAt: formatISO(values.dates.to, { representation: "date" }),
      });

      onOpenChange?.(false);
      if (shouldNotNavigate !== true) {
        navigate(`/app/${result.id}/`);
      }
    },
    [formId, onOpenChange, navigate]
  );

  return (
    <Dialog open={open} onOpenChange={onShowDialog}>
      {children}
      <Form {...form}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Contest</DialogTitle>
            <DialogDescription>Create a new contest.</DialogDescription>
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
                    <Input placeholder="International National" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dates"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Contest Dates</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[300px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <DateRangeDisplay dates={field.value} />
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > addYears(new Date(), 2) ||
                          date < addYears(new Date(), -1)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                  <FormDescription>
                    The start and end dates. Scores may not be modified outside
                    these times and provides warnings when trying to perform
                    certain operations outside this window.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tz"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-[500px]">
                        {tzOptions.map(({ value, label }) => (
                          <SelectItem value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    A short description of the contest. This is not required,
                    but recommended to give organizers and judges context.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
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

function DateRangeDisplay({ dates }: { dates?: { from?: Date; to?: Date } }) {
  if (dates?.from) {
    if (dates.to) {
      return <>{`${format(dates.from, "PPP")} - ${format(dates.to, "PPP")}`}</>;
    }
    return <>{format(dates.from, "PPP")}</>;
  }
  return <span>Pick a date</span>;
}
