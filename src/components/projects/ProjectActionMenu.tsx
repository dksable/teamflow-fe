import { MouseEvent, useRef } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import { Project } from "../../types/project";
import { DropdownMenu, DropdownMenuItem } from "../ui/dropdown-menu";

type ProjectActionMenuProps = {
  project: Project;
  isOpen: boolean;
  onOpenChange: (projectId: string | null) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
};

export function ProjectActionMenu({
  isOpen,
  onDelete,
  onEdit,
  onOpenChange,
  project,
}: ProjectActionMenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  function handleTriggerClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onOpenChange(isOpen ? null : project.id);
  }

  function handleEdit() {
    onOpenChange(null);
    triggerRef.current?.focus();
    onEdit(project);
  }

  function handleDelete() {
    onOpenChange(null);
    triggerRef.current?.focus();
    onDelete(project);
  }

  return (
    <div className="flex justify-end">
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Open actions for ${project.project_name}`}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={handleTriggerClick}
        ref={triggerRef}
        type="button"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      <DropdownMenu
        onClose={() => onOpenChange(null)}
        open={isOpen}
        triggerRef={triggerRef}
      >
        <DropdownMenuItem onSelect={handleEdit}>
          <Pencil className="h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem destructive onSelect={handleDelete}>
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenu>
    </div>
  );
}
