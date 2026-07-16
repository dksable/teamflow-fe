import { useState } from "react";

import { Project, ProjectStatus } from "../../types/project";
import { EmptyState, LoadingState } from "../ui/state";
import { ProjectActionMenu } from "./ProjectActionMenu";

type ProjectTableProps = {
  canManage: boolean;
  emptyMessage: string;
  isError: boolean;
  isLoading: boolean;
  onDelete: (project: Project) => void;
  onEdit: (project: Project) => void;
  projects: Project[];
};

const statusLabels: Record<ProjectStatus, string> = {
  active: "Active",
  completed: "Completed",
  on_hold: "On Hold",
  cancelled: "Cancelled",
};

export function ProjectTable({
  canManage,
  emptyMessage,
  isError,
  isLoading,
  onDelete,
  onEdit,
  projects,
}: ProjectTableProps) {
  const [openMenuProjectId, setOpenMenuProjectId] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingState title="Loading projects..." />;
  }

  if (isError) {
    return (
      <EmptyState
        description="Please refresh the page or try again in a moment."
        title="We could not load projects."
      />
    );
  }

  if (projects.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-md border bg-card">
      <table className="w-full min-w-[980px] border-collapse text-left text-sm">
        <thead className="border-b bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Project Code</th>
            <th className="px-4 py-3 font-medium">Project Name</th>
            <th className="px-4 py-3 font-medium">Project Status</th>
            <th className="px-4 py-3 font-medium">Assignee</th>
            <th className="px-4 py-3 font-medium">Start Date</th>
            <th className="px-4 py-3 font-medium">End Date</th>
            {canManage ? (
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr className="border-b last:border-0" key={project.id}>
              <td className="px-4 py-3 font-medium">{project.project_code}</td>
              <td className="px-4 py-3">{project.project_name}</td>
              <td className="px-4 py-3">
                <StatusBadge status={project.project_status} />
              </td>
              <td className="px-4 py-3">
                <AssigneeNames project={project} />
              </td>
              <td className="px-4 py-3">{formatDate(project.start_date)}</td>
              <td className="px-4 py-3">
                {project.end_date ? formatDate(project.end_date) : "-"}
              </td>
              {canManage ? (
                <td className="px-4 py-3">
                  <ProjectActionMenu
                    isOpen={openMenuProjectId === project.id}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onOpenChange={setOpenMenuProjectId}
                    project={project}
                  />
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  const styles: Record<ProjectStatus, string> = {
    active: "border-green-200 bg-green-50 text-green-700",
    completed: "border-blue-200 bg-blue-50 text-blue-700",
    on_hold: "border-yellow-200 bg-yellow-50 text-yellow-700",
    cancelled: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${styles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

function AssigneeNames({ project }: { project: Project }) {
  if (project.assignees.length === 0) {
    return "-";
  }

  const visibleNames = project.assignees.slice(0, 3).map(formatAssigneeName);
  const remainingNames = project.assignees.slice(3).map(formatAssigneeName);

  return (
    <span>
      {visibleNames.join(", ")}
      {remainingNames.length > 0 ? (
        <>
          {" "}
          <span
            className="group relative inline-flex cursor-default font-medium text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary"
            tabIndex={0}
          >
            +{remainingNames.length} more
            <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden min-w-48 max-w-72 -translate-x-1/2 whitespace-normal rounded-md border bg-card px-3 py-2 text-left text-xs font-normal text-foreground shadow-lg group-hover:block group-focus-visible:block">
              {remainingNames.join(", ")}
            </span>
          </span>
        </>
      ) : null}
    </span>
  );
}

function formatAssigneeName(assignee: Project["assignees"][number]) {
  return `${assignee.first_name} ${assignee.last_name}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
}
