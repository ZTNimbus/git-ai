import { SourceCodeInfo } from "./../../node_modules/protobufjs/ext/descriptor/index.d";
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import type { Document } from "@langchain/core/documents";
import { generateEmbedding, summariseCode } from "./gemini";
import { db } from "~/server/db";

export async function loadGithubRepo(githubUrl: string, githubToken?: string) {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || "",
    branch: "main",
    ignoreFiles: [
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
  });

  const docs = await loader.load();

  return docs;
}

export async function indexGithubRepo(
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) {
  const docs = await loadGithubRepo(githubUrl, githubToken);

  const allEmbeddings = await generateEmbeddings(docs);

  await Promise.allSettled(
    allEmbeddings.map(async (embedding, idx) => {
      console.log(`Processing ${idx} of ${allEmbeddings.length}`);

      const { summary, sourceCode, fileName } = embedding;

      if (!embedding) return;

      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          summary,
          sourceCode,
          fileName,
          projectId,
        },
      });

      await db.$executeRaw`
      UPDATE "SourceCodeEmbedding"
      SET "summaryEmbedding" = ${embedding.embedding}::vector
      WHERE "id" = ${sourceCodeEmbedding.id}
      `;
    }),
  );
}

async function generateEmbeddings(docs: Document[]) {
  return await Promise.all(
    docs.map(async (doc) => {
      const summary = await summariseCode(doc);
      const embedding = await generateEmbedding(summary);

      return {
        summary,
        embedding,
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
      };
    }),
  );
}
