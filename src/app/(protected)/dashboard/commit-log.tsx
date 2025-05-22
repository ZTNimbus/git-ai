"use client";

import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import useProject from "~/hooks/use-project";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

function CommitLog() {
  const { projectId, project } = useProject();
  const { data: commits } = api.project.getCommits.useQuery({ projectId });

  return (
    <ul className="space-y-6">
      {commits?.map((commit, idx) => {
        return (
          <li className="relative flex gap-x-4" key={commit.id}>
            <div
              className={cn(
                idx === commits.length - 1 ? "h-6" : "bottom-6",
                "absolute top-6 left-6 flex w-6 justify-center",
              )}
            >
              <div className="w-px translate-x-1 bg-gray-200"></div>
            </div>

            <>
              <Image
                width={30}
                height={30}
                src={commit.commitAuthorAvatar || "/identicon.png"}
                alt="commit avatar"
                className="relative mt-4 size-8 flex-none rounded-full bg-gray-50"
              />

              <div className="flex-auto rounded-md bg-white p-3 ring-1 ring-gray-200 ring-inset">
                <div className="flex justify-between gap-x-4">
                  <Link
                    target="_blank"
                    href={`${project?.githubUrl}/commits/${commit.commitHash}`}
                    className="py-0.5 text-xs leading-5 text-gray-500"
                  >
                    <span className="font-medium text-gray-900">
                      {commit.commitAuthorName}
                    </span>

                    <span className="inline-flex items-center">
                      committed
                      <ExternalLink className="ml-1 size-4" />
                    </span>
                  </Link>
                </div>

                <span className="font-semibold">{commit.commitMessage}</span>

                <pre className="mt-2 text-sm leading-6 whitespace-pre-wrap text-gray-500">
                  {commit.summary}
                </pre>
              </div>
            </>
          </li>
        );
      })}
    </ul>
  );
}

export default CommitLog;
