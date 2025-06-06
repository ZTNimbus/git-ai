"use client";

import MDEditor from "@uiw/react-md-editor";
import { useState, type FormEvent } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import useProject from "~/hooks/use-project";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";
import CodeReferences from "./code-rerefences";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import useRefetch from "~/hooks/use-refetch";
import { Info } from "lucide-react";

function AskQuestionCard() {
  const { project } = useProject();
  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filesReferences, setFilesReferences] = useState<
    {
      fileName: string;
      sourceCode: string;
      summary: string;
    }[]
  >([]);
  const [answer, setAnswer] = useState("");
  const saveAnswer = api.project.saveAnswer.useMutation();
  const refetch = useRefetch();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFilesReferences([]);
    if (!project?.id) return;
    setLoading(true);
    setAnswer("");

    const { output, filesReferences } = await askQuestion(question, project.id);

    setOpen(true);
    setFilesReferences(filesReferences);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer((ans) => ans + delta);
      }
    }

    setLoading(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[75vw] lg:max-w-[60vw]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>{question}</DialogTitle>

              <Button
                variant="outline"
                disabled={saveAnswer.isPending}
                onClick={() =>
                  saveAnswer.mutate(
                    {
                      projectId: project.id,
                      question,
                      answer,
                      filesReferences,
                    },

                    {
                      onSuccess: () => {
                        toast.success("Answer saved");
                        refetch();
                      },

                      onError: () => toast.error("Failed saving answer"),
                    },
                  )
                }
              >
                Save Answer
              </Button>
            </div>
          </DialogHeader>

          <MDEditor.Markdown
            source={answer}
            className="!h-full max-h-[30vh] max-w-[70vw] overflow-scroll p-5"
          />

          <div className="h-4"></div>
          <CodeReferences filesReferences={filesReferences} />

          <Button type="button" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>

      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should I edit to the change font?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />

            <div className="mt-2 flex items-center gap-1">
              <Info className="size-3" />
              <p className="text-muted-foreground text-xs">
                Try modifying your prompt if your initial question does not
                bring results.
              </p>
            </div>

            <div className="h-4"></div>

            <Button type="submit" disabled={loading} className="cursor-pointer">
              Ask AI!
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

export default AskQuestionCard;
