import { MouseEvent, useRef } from "react";
import { Mail, MoreVertical, Pencil, Trash2 } from "lucide-react";

import { Employee } from "../../types/employee";
import { DropdownMenu, DropdownMenuItem } from "../ui/dropdown-menu";

type EmployeeActionMenuProps = {
  employee: Employee;
  isOpen: boolean;
  onOpenChange: (employeeId: string | null) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onResendInvitation: (employee: Employee) => void;
};

export function EmployeeActionMenu({
  employee,
  isOpen,
  onOpenChange,
  onEdit,
  onDelete,
  onResendInvitation,
}: EmployeeActionMenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  function handleTriggerClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onOpenChange(isOpen ? null : employee.id);
  }

  function handleEdit() {
    onOpenChange(null);
    triggerRef.current?.focus();
    onEdit(employee);
  }

  function handleDelete() {
    onOpenChange(null);
    triggerRef.current?.focus();
    onDelete(employee);
  }

  function handleResendInvitation() {
    onOpenChange(null);
    triggerRef.current?.focus();
    onResendInvitation(employee);
  }

  return (
    <div className="flex justify-end">
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Open actions for ${employee.first_name} ${employee.last_name}`}
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
        {employee.account_status === "invited" ? (
          <DropdownMenuItem onSelect={handleResendInvitation}>
            <Mail className="h-4 w-4" />
            Resend Invitation
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem destructive onSelect={handleDelete}>
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenu>
    </div>
  );
}
