import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { db } from "~/server/db";
import { generateEmbedding, summariseCode } from "./gemini";
import { Document } from "@langchain/core/documents";
import { Octokit } from "octokit";

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
        fileName: doc.metadata.source,
      };
    }),
  );
}

export async function checkCredits(githubUrl: string, githubToken?: string) {
  const octokit = new Octokit({ auth: githubToken });

  const githubOwner = githubUrl.split("/")[3];
  const githubRepo = githubUrl.split("/")[4];

  if (!githubOwner || !githubRepo) return 0;

  const fileCount = await getFileCount("", octokit, githubOwner, githubRepo, 0);

  return fileCount;
}

async function getFileCount(
  path: string,
  octokit: Octokit,
  githubOwner: string,
  githubRepo: string,
  acc: number = 0,
) {
  const { data } = await octokit.rest.repos.getContent({
    owner: githubOwner,
    repo: githubRepo,
    path,
  });

  if (!Array.isArray(data) && data.type === "file") return acc + 1;

  if (Array.isArray(data)) {
    let fileCount = 0;

    const directories: string[] = [];

    for (const item of data) {
      if (item.type === "dir") {
        directories.push(item.path);
      } else fileCount++;
    }

    if (directories.length > 0) {
      const directoryCounts = await Promise.all(
        directories.map((dirPath) =>
          getFileCount(dirPath, octokit, githubOwner, githubRepo, 0),
        ),
      );

      fileCount += directoryCounts.reduce((acc, count) => acc + count, 0);
    }

    return acc + fileCount;
  }

  return acc;
}
