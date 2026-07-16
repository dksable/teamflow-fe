import { toast } from "sonner";

import { getApiErrorMessage } from "../../contexts/AuthContext";
import { useDeleteEmployee } from "../../hooks/useEmployees";
import { Employee } from "../../types/employee";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";

type DeleteEmployeeDialogProps = {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

export function DeleteEmployeeDialog({
  employee,
  open,
  onClose,
  onDeleted,
}: DeleteEmployeeDialogProps) {
  const deleteEmployee = useDeleteEmployee();
  const employeeName = employee
    ? `${employee.first_name} ${employee.last_name}`.trim() || employee.employee_id
    : "this employee";

  function handleClose() {
    if (!deleteEmployee.isPending) {
      onClose();
    }
  }

  async function handleDelete() {
    if (!employee) {
      return;
    }

    try {
      await deleteEmployee.mutateAsync(employee.id);
      toast.success("Employee deleted successfully");
      onDeleted();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <Dialog
      description={`Are you sure you want to delete ${employeeName}? This action will permanently delete the employee's information and cannot be undone.`}
      onClose={handleClose}
      open={open}
      title="Delete Employee"
    >
      <div className="mt-6 flex justify-end gap-3">
        <Button
          disabled={deleteEmployee.isPending}
          onClick={handleClose}
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          className="bg-red-600 text-white hover:bg-red-700"
          disabled={deleteEmployee.isPending}
          onClick={handleDelete}
          type="button"
        >
          {deleteEmployee.isPending ? "Deleting..." : "Done"}
        </Button>
      </div>
    </Dialog>
  );
}
