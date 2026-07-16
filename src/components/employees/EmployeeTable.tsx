import { useState } from "react";

import { Employee } from "../../types/employee";
import { EmptyState, LoadingState } from "../ui/state";
import { EmployeeActionMenu } from "./EmployeeActionMenu";

type EmployeeTableProps = {
  employees: Employee[];
  isError: boolean;
  isLoading: boolean;
  onDelete: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onResendInvitation: (employee: Employee) => void;
  canManage: boolean;
};

export function EmployeeTable({
  employees,
  isError,
  isLoading,
  onDelete,
  onEdit,
  onResendInvitation,
  canManage,
}: EmployeeTableProps) {
  const [openMenuEmployeeId, setOpenMenuEmployeeId] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingState title="Loading employees..." />;
  }

  if (isError) {
    return (
      <EmptyState
        description="Please refresh the page or try again in a moment."
        title="We could not load employees."
      />
    );
  }

  if (employees.length === 0) {
    return <EmptyState description="Create an employee to invite them into WorkPilot." title="No employees added yet." />;
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-md border bg-card">
      <table className="min-w-[1080px] w-full border-collapse text-left text-sm">
        <thead className="border-b bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Employee ID</th>
            <th className="px-4 py-3 font-medium">First Name</th>
            <th className="px-4 py-3 font-medium">Last Name</th>
            <th className="px-4 py-3 font-medium">Email ID</th>
            <th className="px-4 py-3 font-medium">Date of Birth</th>
            <th className="px-4 py-3 font-medium">Designation</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Account Status</th>
            {canManage ? (
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr className="border-b last:border-0" key={employee.id}>
              <td className="px-4 py-3 font-medium">{employee.employee_id}</td>
              <td className="px-4 py-3">{employee.first_name}</td>
              <td className="px-4 py-3">{employee.last_name}</td>
              <td className="px-4 py-3">{employee.email}</td>
              <td className="px-4 py-3">{formatDate(employee.date_of_birth)}</td>
              <td className="px-4 py-3">{employee.designation}</td>
              <td className="px-4 py-3">
                <span className="inline-flex rounded-md border px-2 py-1 text-xs font-medium">
                  {formatRole(employee.role)}
                </span>
              </td>
              <td className="px-4 py-3">
                <AccountStatusBadge status={employee.account_status} />
              </td>
              {canManage ? (
                <td className="px-4 py-3">
                  <EmployeeActionMenu
                    employee={employee}
                    isOpen={openMenuEmployeeId === employee.id}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onOpenChange={setOpenMenuEmployeeId}
                    onResendInvitation={onResendInvitation}
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

function AccountStatusBadge({ status }: { status: Employee["account_status"] }) {
  const styles: Record<Employee["account_status"], string> = {
    invited: "border-yellow-200 bg-yellow-50 text-yellow-700",
    active: "border-green-200 bg-green-50 text-green-700",
    disabled: "border-red-200 bg-red-50 text-red-700",
  };
  const labels: Record<Employee["account_status"], string> = {
    invited: "Invited",
    active: "Active",
    disabled: "Disabled",
  };

  return (
    <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function formatRole(value: Employee["role"]) {
  if (value === "admin") {
    return "Admin";
  }
  return "View";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
}
