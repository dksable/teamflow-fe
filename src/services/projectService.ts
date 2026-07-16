import { apiDelete, apiGet, apiPatch, apiPost } from "../lib/api";
import { Project, ProjectCreate, ProjectUpdate } from "../types/project";

export function fetchProjects() {
  return apiGet<Project[]>("/projects");
}

export function createProject(payload: ProjectCreate) {
  return apiPost<Project>("/projects", payload);
}

export function updateProject(id: string, payload: ProjectUpdate) {
  return apiPatch<Project>(`/projects/${id}`, payload);
}

export function deleteProject(id: string) {
  return apiDelete(`/projects/${id}`);
}
