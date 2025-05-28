"use client";

import { GitBranch, Info, InfoIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import useRefetch from "~/hooks/use-refetch";
import { api } from "~/trpc/react";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

function Create() {
  const { register, handleSubmit, reset } = useForm<FormInput>();

  const createProject = api.project.createProject.useMutation();
  const checkCredits = api.project.checkCredits.useMutation();

  const refetch = useRefetch();

  function onSubmit(data: FormInput) {
    if (!!checkCredits.data) {
      createProject.mutate(
        {
          githubUrl: data.repoUrl,
          name: data.projectName,
          githubToken: data.githubToken,
        },
        {
          onSuccess: () => {
            toast.success("Successfully created project");
            void refetch();
            reset();
          },

          onError: () => toast.error("Failed creating new project"),
        },
      );
    } else {
      checkCredits.mutate({
        githubUrl: data.repoUrl,
        githubToken: data.githubToken,
      });
    }

    return true;
  }

  const hasEnoughCredits = checkCredits?.data?.userCredits
    ? checkCredits.data.fileCount <= checkCredits.data.userCredits
    : true;

  return (
    <div className="flex h-full items-center justify-center gap-12">
      <Image
        src={"/1-removebg-preview.png"}
        width={300}
        height={300}
        alt="man on a computer"
      />

      <div>
        <div>
          <h1 className="inline text-2xl font-semibold">
            Link your Github Repository
            <GitBranch className="ml-1 inline" />
          </h1>

          <p className="text-muted-foreground text-sm">
            Please enter the full URL of the repository in order to connect it
            to Git AI.
          </p>
        </div>

        <div className="h-4"></div>

        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("projectName", { required: true })}
              placeholder="Project Name"
              maxLength={50}
              required
            />

            <div className="h-2"></div>

            <Input
              {...register("repoUrl", { required: true })}
              placeholder="Github URL"
              type="url"
              maxLength={100}
              required
            />

            <div className="h-2"></div>

            <Input
              {...register("githubToken")}
              placeholder="Github Token(optional, enter if your project fails)"
            />
            <div className="flex items-center gap-1">
              <InfoIcon className="size-3" />
              <p className="text-muted-foreground mt-1 max-w-100 text-xs">
                Grab your token{" "}
                <Link
                  href={"https://github.com/settings/tokens"}
                  target="_blank"
                  className="cursor-pointer text-purple-500 underline"
                >
                  here.{" "}
                </Link>
                Github Tokens are crucial if your project size is large and you
                fail creating your project due to Rate Limiting.
              </p>
            </div>

            {!!checkCredits.data && (
              <>
                <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 px-4 py-2 text-orange-700">
                  <div className="flex items-center gap-2">
                    <Info className="size-4" />

                    <p className="text-sm">
                      You will be charged{" "}
                      <strong>{checkCredits.data?.fileCount}</strong> credits
                      for this repository.
                    </p>
                  </div>

                  <p className="text-sm">
                    You have{" "}
                    <strong>
                      {checkCredits.data?.userCredits} credits remaining.
                    </strong>
                  </p>
                </div>
              </>
            )}

            <div className="h-4"></div>

            <Button
              type="submit"
              disabled={
                createProject.isPending ||
                checkCredits.isPending ||
                !hasEnoughCredits
              }
            >
              {!!checkCredits.data ? "Create Project" : "Check Credits"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Create;
