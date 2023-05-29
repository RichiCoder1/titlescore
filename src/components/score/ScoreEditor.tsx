import { Criteria } from "~/shared/schemas/criteria";
import { Input } from "../ui/Input";
import { useCallback, useEffect, useId, useMemo, useRef } from "react";
import { Label } from "../ui/Label";
import { Separator } from "../ui/Separator";
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/Form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { githubDarkInit } from "@uiw/codemirror-theme-github";
import "./ScoreEditor.css";
import { useDebouncedCallback } from "use-debounce";
import { trpc } from "~/utils/trpc";
import { updateScoreSchema } from "~/shared/schemas/scores";
import { Button } from "../ui/Button";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "~/components/ui/AlertDialog.tsx";
import { cn } from "~/utils/styles.ts";

export type ScoreEditorProps = {
  judgeId: string;
  contestantId: string;
  contestId: string;
  criteria: Criteria;
};

const scoreSchema = updateScoreSchema;

const extensions = [markdown()];

const theme = githubDarkInit({
  settings: {
    background: "transparent",
  },
});

export function ScoreEditor(props: ScoreEditorProps) {
  const { criteria } = props;
  const utils = trpc.useContext();
  const schema = useMemo(() => {
    return scoreSchema.merge(
      z.object({
        score: z.coerce.number().min(0).max(criteria.weight).nullish(),
      })
    );
  }, [criteria]);
  const queryIds = useMemo(
    () => ({
      contestId: props.contestId,
      criteriaId: props.criteria.id,
      contestantId: props.contestantId,
      judgeId: props.judgeId,
    }),
    [props.contestId, props.contestantId, props.criteria.id, props.judgeId]
  );
  const { data, isSuccess, refetch } = trpc.scores.get.useQuery(
    {
      ...queryIds,
    },
    { enabled: false }
  );

  const form = useForm<z.infer<typeof scoreSchema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...queryIds,
    },
  });
  form.watch();
  const formId = useId();

  useEffect(() => {
    if (data && isSuccess) {
      form.reset(data, {
        keepTouched: true,
      });
    }
  }, [data, isSuccess]);
  useEffect(() => {
    form.reset(utils.scores.get.getData(queryIds) ?? queryIds);
    refetch();
  }, [queryIds]);

  const formRef = useRef<HTMLFormElement>(null);

  const autoSave = useDebouncedCallback(() => {
    formRef.current?.requestSubmit();
  }, 1000);

  const { mutate, isLoading } = trpc.scores.updateScore.useMutation({
    async onMutate(score) {
      autoSave.cancel();
      await utils.scores.get.cancel();

      const previous = utils.scores.get.getData(queryIds);
      utils.scores.get.setData(queryIds, {
        ...previous!,
        ...score,
      });
      return { previous };
    },
    onError(_, __, ctx) {
      utils.scores.get.setData(queryIds, ctx!.previous);
    },
    onSettled(data) {
      form.reset(undefined, {
        keepValues: true,
      });
      if (data) {
        utils.scores.get.setData(queryIds, data);
      }
      utils.scores.summary.invalidate();
      utils.scores.myScores.invalidate();
    },
  });

  const valueWatch = form.watch();
  useEffect(() => {
    if (form.formState.isDirty && form.formState.isValid && !isLoading) {
      autoSave();
    }
  }, [form.formState, autoSave, valueWatch, isLoading]);

  const onSubmit = useCallback(
    async (values: z.infer<typeof scoreSchema>) => {
      mutate(values);
    },
    [mutate]
  );

  const finalize = trpc.scores.finalizeScore.useMutation({
    onMutate() {
      autoSave.cancel();
      const previous = utils.scores.get.getData(queryIds);
      utils.scores.get.setData(queryIds, {
        ...previous!,
        submittedAt: new Date(),
      });
      return { previous };
    },
    onError(_, __, ctx) {
      utils.scores.get.setData(queryIds, ctx!.previous);
    },
    onSettled(data) {
      if (data) {
        utils.scores.get.setData(queryIds, data);
      }
      utils.scores.summary.invalidate();
      utils.scores.myScores.invalidate();
    },
  });

  return (
    <Form {...form}>
      <p className="-mb-1 text-xs font-light text-slate-600/90">criteria</p>
      <h4 className="text-xl font-semibold">{criteria.name}</h4>
      <p className="mt-2 text-xs font-light text-slate-600/90 ">
        criteria guidance
      </p>
      <p className="text-sm">{criteria.description}</p>
      <Separator className="my-4" />
      <form id={formId} ref={formRef} onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset
          className="space-y-2 border-none"
          disabled={!isSuccess || data?.submittedAt != null}
        >
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="comments">Comments</Label>
                <FormDescription>
                  You can track any notes here that'd you'd like to keep as
                  feedback. This form will autosave.
                </FormDescription>
                <CodeMirror
                  value={field.value ?? undefined}
                  onChange={field.onChange}
                  theme={theme}
                  extensions={extensions}
                  height="200px"
                  readOnly={!isSuccess || data?.submittedAt != null}
                  basicSetup={{
                    lineNumbers: false,
                    foldGutter: false,
                    highlightActiveLine: false,
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="score"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Score</FormLabel>
                <FormDescription>
                  <p>The score for this contestant in this category.</p>
                  <p>
                    This score must be be at least 0 and up to the category max
                    of {criteria.weight}. This score will not be final until you
                    submit via Finalize below.
                  </p>
                </FormDescription>
                <div className="flex flex-row items-center">
                  <Input
                    type="number"
                    className="w-[100px]"
                    min={0}
                    max={criteria.weight}
                    pattern="\d+"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value == "" ? null : e.target.value
                      )
                    }
                  />{" "}
                  <span className="ml-2 text-sm text-slate-500">
                    / {criteria.weight}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div
            className={cn("mt-2 flex space-x-2", {
              hidden: data?.submittedAt != null,
            })}
          >
            <Button type="submit" className="w-2/6 overflow-hidden">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-2/6">
                  Finalize Score
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  Are you sure you want to finalize your score?
                </AlertDialogHeader>
                <AlertDialogDescription>
                  Your score will be final and un-editable once you submit.
                </AlertDialogDescription>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => finalize.mutate(queryIds)}>
                    Submit My Score
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </fieldset>
      </form>
    </Form>
  );
}

export default ScoreEditor;
