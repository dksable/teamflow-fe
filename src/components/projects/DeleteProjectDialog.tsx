import { toast } from "sonner";

import { getApiErrorMessage } from "../../contexts/AuthContext";
import { useDeleteProject } from "../../hooks/useProjects";
import { Project } from "../../types/project";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";

type DeleteProjectDialogProps = {
  onClose: () => void;
  onDeleted: () => void;
  open: boolean;
  project: Project | null;
};

export function DeleteProjectDialog({
  onClose,
  onDeleted,
  open,
  project,
}: DeleteProjectDialogProps) {
  const deleteProject = useDeleteProject();

  function handleClose() {
    if (!deleteProject.isPending) {
      onClose();
    }
  }

  async function handleDelete() {
    if (!project) {
      return;
    }

    try {
      await deleteProject.mutateAsync(project.id);
      toast.success("Project deleted successfully");
      onDeleted();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <Dialog
      description="Are you sure you want to delete this project? All employee assignments for this project will also be removed."
      onClose={handleClose}
      open={open}
      title="Delete Project"
    >
      <div className="mt-6 flex justify-end gap-3">
        <Button
          disabled={deleteProject.isPending}
          onClick={handleClose}
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          className="bg-red-600 text-white hover:bg-red-700"
          disabled={deleteProject.isPending}
          onClick={handleDelete}
          type="button"
        >
          {deleteProject.isPending ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </Dialog>
  );
}
