import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "../../contexts/AuthContext";
import { useCreateEmployee, useUpdateEmployee } from "../../hooks/useEmployees";
import { Employee, EmployeeCreate } from "../../types/employee";
import { Dialog } from "../ui/dialog";
import {
  EmployeeForm,
  EmployeeFormErrors,
  normalizeEmployeeForm,
  validateEmployeeForm,
} from "./EmployeeForm";

export type EmployeeModalMode = "create" | "edit";

type EmployeeModalProps = {
  mode: EmployeeModalMode;
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
  onSaved: () => void;
};

const emptyForm: EmployeeCreate = {
  employee_id: "",
  first_name: "",
  last_name: "",
  email: "",
  date_of_birth: "",
  designation: "",
  role: "view",
};

export function EmployeeModal({
  mode,
  open,
  employee,
  onClose,
  onSaved,
}: EmployeeModalProps) {
  const [form, setForm] = useState<EmployeeCreate>(emptyForm);
  const [errors, setErrors] = useState<EmployeeFormErrors>({});
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const isSubmitting = createEmployee.isPending || updateEmployee.isPending;

  useEffect(() => {
    if (!open) {
      return;
    }

    setErrors({});
    setForm(mode === "edit" && employee ? employeeToForm(employee) : emptyForm);
  }, [employee?.id, mode, open]);

  function updateField(field: keyof EmployeeCreate, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleClose() {
    if (!isSubmitting) {
      onClose();
    }
  }

  async function handleSubmit() {
    const nextErrors = validateEmployeeForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const payload = normalizeEmployeeForm(form);

    try {
      if (mode === "edit" && employee) {
        await updateEmployee.mutateAsync({ id: employee.id, payload });
        toast.success("Employee updated successfully");
      } else {
        const response = await createEmployee.mutateAsync(payload);
        if (response.invitation_sent) {
          toast.success("Employee added and invitation email sent successfully.");
        } else {
          toast.warning("Employee added, but the invitation email could not be sent.");
        }
      }

      setForm(emptyForm);
      setErrors({});
      onSaved();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      title={mode === "edit" ? "Edit Employee" : "Add Employee"}
    >
      <EmployeeForm
        errors={errors}
        isSubmitting={isSubmitting}
        onCancel={handleClose}
        onChange={updateField}
        onSubmit={handleSubmit}
        submitLabel={mode === "edit" ? "Save Changes" : "Save Employee"}
        values={form}
      />
    </Dialog>
  );
}

function employeeToForm(employee: Employee): EmployeeCreate {
  return {
    employee_id: employee.employee_id,
    first_name: employee.first_name,
    last_name: employee.last_name,
    email: employee.email,
    date_of_birth: employee.date_of_birth,
    designation: employee.designation,
    role: employee.role,
  };
}
