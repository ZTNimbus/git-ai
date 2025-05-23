"use client";

import MDEditor from "@uiw/react-md-editor";
import Image from "next/image";
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import useProject from "~/hooks/use-project";
import { api } from "~/trpc/react";
import AskQuestionCard from "../dashboard/ask-question-card";
import CodeReferences from "../dashboard/code-rerefences";

function QA() {
  const { projectId } = useProject();
  const { data: questions } = api.project.getQuestions.useQuery({ projectId });

  const [questionIndex, setQuestionIndex] = useState(0);
  const question: any = questions?.[questionIndex];

  return (
    <Sheet>
      <AskQuestionCard />

      <div className="h-4"></div>

      <h1 className="text-xl font-semibold">Saved Questions</h1>

      <div className="h-2"></div>

      <div className="flex flex-col gap-2">
        {questions?.map((q: any, idx) => {
          return (
            <React.Fragment key={q.id}>
              <SheetTrigger onClick={() => setQuestionIndex(idx)}>
                <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow">
                  <Image
                    alt="user image"
                    className="rounded-full"
                    height={30}
                    width={30}
                    src={q.user.imageUrl ?? "/identicon.png"}
                  />

                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2">
                      <p className="line-clamp-1 text-lg font-medium text-gray-700">
                        {q.question}
                      </p>

                      <span className="text-xs whitespace-nowrap text-gray-400">
                        {question.createdAt.toString()}
                      </span>
                    </div>

                    <p className="line-clamp-1 text-sm text-gray-500">
                      {q.answer}
                    </p>
                  </div>
                </div>
              </SheetTrigger>
            </React.Fragment>
          );
        })}
      </div>

      {question && (
        <SheetContent className="sm:max-w-[80vw]">
          <SheetHeader>
            <SheetTitle>{question.question}</SheetTitle>

            <MDEditor.Markdown source={question.answer} />
            <CodeReferences
              filesReferences={(question.filesReferences ?? []) as any}
            />
          </SheetHeader>
        </SheetContent>
      )}
    </Sheet>
  );
}

export default QA;
