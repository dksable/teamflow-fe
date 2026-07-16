import { useState } from "react";
import { Plus } from "lucide-react";

import { DeleteEmployeeDialog } from "../components/employees/DeleteEmployeeDialog";
import {
  EmployeeModal,
  EmployeeModalMode,
} from "../components/employees/EmployeeModal";
import { EmployeeTable } from "../components/employees/EmployeeTable";
import { Button } from "../components/ui/button";
import { useEmployees } from "../hooks/useEmployees";
import { useResendEmployeeInvitation } from "../hooks/useEmployees";
import { usePermissions } from "../hooks/usePermissions";
import { Employee } from "../types/employee";
import { toast } from "sonner";

export function EmployeesPage() {
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<EmployeeModalMode>("create");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeePendingDelete, setEmployeePendingDelete] = useState<Employee | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const employeesQuery = useEmployees();
  const resendInvitation = useResendEmployeeInvitation();
  const permissions = usePermissions();

  function openCreateModal() {
    setModalMode("create");
    setSelectedEmployee(null);
    setIsEmployeeModalOpen(true);
  }

  function openEditModal(employee: Employee) {
    setModalMode("edit");
    setSelectedEmployee(employee);
    setIsEmployeeModalOpen(true);
  }

  function closeEmployeeModal() {
    setIsEmployeeModalOpen(false);
    setSelectedEmployee(null);
    setModalMode("create");
  }

  function openDeleteDialog(employee: Employee) {
    setEmployeePendingDelete(employee);
    setIsDeleteDialogOpen(true);
  }

  function closeDeleteDialog() {
    setIsDeleteDialogOpen(false);
    setEmployeePendingDelete(null);
  }

  async function handleResendInvitation(employee: Employee) {
    try {
      const response = await resendInvitation.mutateAsync(employee.id);
      if (response.invitation_sent) {
        toast.success(response.message);
      } else {
        toast.warning("Invitation email could not be sent.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not resend invitation.");
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Employees</h2>
          <p className="mt-2 text-muted-foreground">
            Create employees and view the current employee directory.
          </p>
        </div>
        {permissions.canCreate ? (
          <Button onClick={openCreateModal} type="button">
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        ) : null}
      </div>

      <EmployeeTable
        employees={employeesQuery.data ?? []}
        canManage={permissions.canEdit || permissions.canDelete}
        isError={employeesQuery.isError}
        isLoading={employeesQuery.isLoading}
        onDelete={openDeleteDialog}
        onEdit={openEditModal}
        onResendInvitation={handleResendInvitation}
      />

      <EmployeeModal
        employee={selectedEmployee}
        mode={modalMode}
        onClose={closeEmployeeModal}
        onSaved={closeEmployeeModal}
        open={isEmployeeModalOpen}
      />

      <DeleteEmployeeDialog
        employee={employeePendingDelete}
        onClose={closeDeleteDialog}
        onDeleted={closeDeleteDialog}
        open={isDeleteDialogOpen}
      />
    </section>
  );
}
