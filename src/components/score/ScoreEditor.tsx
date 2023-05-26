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
        score: z.coerce.number().min(0).max(criteria.weight).nullable(),
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
    [props]
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
    form.reset(utils.scores.get.getData(queryIds));
    refetch();
  }, [criteria]);

  const formRef = useRef<HTMLFormElement>(null);

  const autoSave = useDebouncedCallback(() => {
    formRef.current?.requestSubmit();
  }, 1000);

  const { mutate, isLoading } = trpc.scores.updateScore.useMutation({
    onMutate() {
      autoSave.cancel();
    },
    onSettled(data) {
      form.reset(undefined, {
        keepValues: true,
      });
      if (data) {
        utils.scores.get.setData(queryIds, data);
      }
      utils.scores.summary.invalidate();
    },
  });

  const valueWatch = form.watch();
  useEffect(() => {
    if (form.formState.isDirty && form.formState.isValid && !isLoading) {
      autoSave();
    }
  }, [form.formState, autoSave, valueWatch]);

  const onSubmit = useCallback(
    async (values: z.infer<typeof scoreSchema>) => {
      mutate(values);
    },
    [mutate, form]
  );

  return (
    <Form {...form}>
      <p className="text-xs font-light text-slate-600/90 -mb-1">category</p>
      <h4 className="text-xl font-semibold">{criteria.name}</h4>
      <p className="text-xs font-light text-slate-600/90 mt-2 ">
        category guidance
      </p>
      <p className="text-sm">{criteria.description}</p>
      <Separator className="my-4" />
      <form id={formId} ref={formRef} onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset className="border-none space-y-2" disabled={!isSuccess}>
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
                  readOnly={!isSuccess}
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
                    className="w-[100px]"
                    min={0}
                    max={criteria.weight}
                    pattern="\d+"
                    {...field}
                    value={field.value ?? ""}
                  />{" "}
                  <span className="ml-2 text-sm text-slate-500">
                    / {criteria.weight}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="mt-4 mr-2 w-2/6 overflow-hidden"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
          <Button
            type="submit"
            variant="destructive"
            className="mt-4 w-2/6 block"
          >
            Finalize Score
          </Button>
        </fieldset>
      </form>
    </Form>
  );
}
