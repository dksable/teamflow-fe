import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createProject,
  deleteProject,
  fetchProjects,
  updateProject,
} from "../services/projectService";
import { ProjectCreate, ProjectUpdate } from "../types/project";

export const projectsQueryKey = ["projects"];

export function useProjects() {
  return useQuery({
    queryKey: projectsQueryKey,
    queryFn: fetchProjects,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProjectCreate) => createProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProjectUpdate }) =>
      updateProject(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
}
