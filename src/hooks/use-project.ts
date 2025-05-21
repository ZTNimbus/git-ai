import { api } from "~/trpc/react";
import { useLocalStorage } from "usehooks-ts";

export default function useProject() {
  const { data: projects } = api.project.getProjects.useQuery();
  const [projectId, setProjectId] = useLocalStorage("git-projectId", "");

  const project = projects?.find((project) => project.id === projectId);

  return { projects, project, projectId, setProjectId };
}
