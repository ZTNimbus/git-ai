"use client";

import { GitBranch } from "lucide-react";
import Image from "next/image";
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

  const refetch = useRefetch();

  function onSubmit(data: FormInput) {
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

    return true;
  }
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
              placeholder="Github Token(optional, only required for private repositories)"
            />

            <div className="h-4"></div>

            <Button type="submit" disabled={createProject.isPending}>
              Create Project
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Create;
