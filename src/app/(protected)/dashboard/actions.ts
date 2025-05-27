"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { generateEmbedding } from "~/lib/gemini";
import { db } from "~/server/db";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue();

  const queryVector = await generateEmbedding(
    `This question, along with all questions are related to this repo. ${question}`,
  );

  const vectorQuery = `[${queryVector.join(",")}]`;

  const result = (await db.$queryRaw`
  SELECT "fileName", "sourceCode", "summary",
  1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
  FROM "SourceCodeEmbedding"
  WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > .5
  AND "projectId" = ${projectId}
  ORDER BY similarity DESC
  LIMIT 10
  `) as {
    fileName: string;
    sourceCode: string;
    summary: string;
  }[];

  console.log("RESULT", result);

  let context = "";

  for (const doc of result) {
    context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\n summary of file: ${doc.summary}\n\n`;
  }

  console.log("CONTEXT", context);

  (async () => {
    const { textStream } = await streamText({
      model: google("gemini-1.5-flash"),
      prompt: `
      You are an AI code assistant who answers questions about the codebase provided in the repository. Your target audience is a technical intern.
      You are knowledgeable, expert, helpful, clever and well-mannered.

      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK

      START QUESTION
      ${question} in this repository?
      END OF QUESTION

      AI asistant will take into account any CONTEXT BLOCK that is provided in conversation.
      All incoming questions will be related to the related repository.
      If the context does not provide the answer to question, The AI assistant will say "I'm sorry, but I do not know the answer to this question. Please try modifying your prompt or being more specific".
      Do not invent anything that is not drawn directly from the context.
      Answer in markdown syntax with code snippets if needed. Be very detailed when answering.
      `,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return {
    output: stream.value,
    filesReferences: result,
  };
}
