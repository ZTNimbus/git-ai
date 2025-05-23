"use client";

import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import useProject from "~/hooks/use-project";
import useRefetch from "~/hooks/use-refetch";
import { api } from "~/trpc/react";

function ArchiveButton() {
  const { projectId } = useProject();
  const refetch = useRefetch();
  const archiveProject = api.project.archiveProject.useMutation();

  return (
    <Button
      disabled={archiveProject.isPending}
      size="sm"
      variant="destructive"
      className="cursor-pointer hover:opacity-80"
      onClick={() => {
        const confirm = window.confirm(
          "Please confirm that you would like to archive this project",
        );

        if (confirm)
          archiveProject.mutate(
            { projectId },
            {
              onSuccess: () => {
                toast.success("Project successfully archived");
                refetch();
              },

              onError: () => {
                toast.error("Failed archiving project");
              },
            },
          );
      }}
    >
      Archive
    </Button>
  );
}

export default ArchiveButton;
