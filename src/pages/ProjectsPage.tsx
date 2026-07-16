import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { DeleteProjectDialog } from "../components/projects/DeleteProjectDialog";
import { ProjectModal, ProjectModalMode } from "../components/projects/ProjectModal";
import { ProjectTable } from "../components/projects/ProjectTable";
import { Button } from "../components/ui/button";
import { usePermissions } from "../hooks/usePermissions";
import { useProjects } from "../hooks/useProjects";
import { Project } from "../types/project";

export function ProjectsPage() {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ProjectModalMode>("create");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectPendingDelete, setProjectPendingDelete] = useState<Project | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const projectsQuery = useProjects();
  const permissions = usePermissions();

  const filteredProjects = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const projects = projectsQuery.data ?? [];
    if (!query) {
      return projects;
    }
    return projects.filter((project) =>
      [
        project.project_name,
        project.project_code,
        ...project.assignees.flatMap((assignee) => [
          assignee.employee_id,
          assignee.first_name,
          assignee.last_name,
          assignee.email,
        ]),
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [projectsQuery.data, searchTerm]);

  function openCreateModal() {
    setModalMode("create");
    setSelectedProject(null);
    setIsProjectModalOpen(true);
  }

  function openEditModal(project: Project) {
    setModalMode("edit");
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  }

  function closeProjectModal() {
    setIsProjectModalOpen(false);
    setSelectedProject(null);
    setModalMode("create");
  }

  function openDeleteDialog(project: Project) {
    setProjectPendingDelete(project);
    setIsDeleteDialogOpen(true);
  }

  function closeDeleteDialog() {
    setIsDeleteDialogOpen(false);
    setProjectPendingDelete(null);
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Projects</h2>
          <p className="mt-2 text-muted-foreground">
            Manage projects and assigned employees.
          </p>
        </div>
        {permissions.canCreate ? (
          <Button onClick={openCreateModal} type="button">
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        ) : null}
      </div>

      <div className="mt-6 max-w-md">
        <label className="relative block" htmlFor="project-search">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm"
            id="project-search"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search projects"
            value={searchTerm}
          />
        </label>
      </div>

      <ProjectTable
        canManage={permissions.canEdit || permissions.canDelete}
        emptyMessage={
          permissions.role === "admin"
            ? "No projects added yet."
            : "No projects are assigned to you."
        }
        isError={projectsQuery.isError}
        isLoading={projectsQuery.isLoading}
        onDelete={openDeleteDialog}
        onEdit={openEditModal}
        projects={filteredProjects}
      />

      <ProjectModal
        mode={modalMode}
        onClose={closeProjectModal}
        onSaved={closeProjectModal}
        open={isProjectModalOpen}
        project={selectedProject}
      />

      <DeleteProjectDialog
        onClose={closeDeleteDialog}
        onDeleted={closeDeleteDialog}
        open={isDeleteDialogOpen}
        project={projectPendingDelete}
      />
    </section>
  );
}
