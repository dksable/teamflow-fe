import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "../../contexts/AuthContext";
import { useEmployees } from "../../hooks/useEmployees";
import { useCreateProject, useUpdateProject } from "../../hooks/useProjects";
import { Employee } from "../../types/employee";
import { Project, ProjectCreate, ProjectStatus } from "../../types/project";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";

export type ProjectModalMode = "create" | "edit";

type ProjectFormValues = {
  project_code: string;
  project_name: string;
  project_status: ProjectStatus;
  assignee_ids: string[];
  start_date: string;
  end_date: string;
};

type ProjectFormErrors = Partial<Record<keyof ProjectFormValues, string>>;

type ProjectModalProps = {
  mode: ProjectModalMode;
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onSaved: () => void;
};

const statusOptions: Array<{ label: string; value: ProjectStatus }> = [
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "On Hold", value: "on_hold" },
  { label: "Cancelled", value: "cancelled" },
];

const emptyForm: ProjectFormValues = {
  project_code: "",
  project_name: "",
  project_status: "active",
  assignee_ids: [],
  start_date: "",
  end_date: "",
};

export function ProjectModal({
  mode,
  onClose,
  onSaved,
  open,
  project,
}: ProjectModalProps) {
  const [form, setForm] = useState<ProjectFormValues>(emptyForm);
  const [errors, setErrors] = useState<ProjectFormErrors>({});
  const employeesQuery = useEmployees();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const isSubmitting = createProject.isPending || updateProject.isPending;

  useEffect(() => {
    if (!open) {
      return;
    }
    setErrors({});
    setForm(mode === "edit" && project ? projectToForm(project) : emptyForm);
  }, [mode, open, project?.id]);

  function updateField<K extends keyof ProjectFormValues>(
    field: K,
    value: ProjectFormValues[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleClose() {
    if (!isSubmitting) {
      onClose();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeProjectForm(form);
    const nextErrors = validateProjectForm(normalized);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const payload = toProjectPayload(normalized);
    try {
      if (mode === "edit" && project) {
        await updateProject.mutateAsync({ id: project.id, payload });
        toast.success("Project updated successfully");
      } else {
        await createProject.mutateAsync(payload);
        toast.success("Project created successfully");
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
      title={mode === "edit" ? "Edit Project" : "Add Project"}
    >
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <ProjectField
          error={errors.project_code}
          id="project_code"
          label="Project Code"
          onChange={(value) => updateField("project_code", value.toUpperCase())}
          value={form.project_code}
        />
        <ProjectField
          error={errors.project_name}
          id="project_name"
          label="Project Name"
          onChange={(value) => updateField("project_name", value)}
          value={form.project_name}
        />
        <label className="block text-sm font-medium" htmlFor="project_status">
          Project Status
          <select
            aria-invalid={Boolean(errors.project_status)}
            className="mt-2 h-10 w-full rounded-md border bg-background px-3"
            id="project_status"
            onChange={(event) =>
              updateField("project_status", event.target.value as ProjectStatus)
            }
            value={form.project_status}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.project_status ? (
            <p className="mt-1 text-sm text-red-600">{errors.project_status}</p>
          ) : null}
        </label>
        <AssigneeMultiSelect
          employees={employeesQuery.data ?? []}
          error={errors.assignee_ids}
          isError={employeesQuery.isError}
          isLoading={employeesQuery.isLoading}
          onChange={(value) => updateField("assignee_ids", value)}
          value={form.assignee_ids}
        />
        <ProjectField
          error={errors.start_date}
          id="start_date"
          label="Start Date"
          onChange={(value) => updateField("start_date", value)}
          type="date"
          value={form.start_date}
        />
        <ProjectField
          error={errors.end_date}
          id="end_date"
          label="End Date"
          onChange={(value) => updateField("end_date", value)}
          type="date"
          value={form.end_date}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button
            disabled={isSubmitting}
            onClick={handleClose}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting
              ? "Saving..."
              : mode === "edit"
                ? "Save Changes"
                : "Save Project"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function ProjectField({
  error,
  id,
  label,
  onChange,
  type = "text",
  value,
}: {
  error?: string;
  id: keyof ProjectFormValues;
  label: string;
  onChange: (value: string) => void;
  type?: "date" | "text";
  value: string;
}) {
  const errorId = `${id}-error`;

  return (
    <label className="block text-sm font-medium" htmlFor={id}>
      {label}
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        className="mt-2 h-10 w-full rounded-md border bg-background px-3"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
      {error ? (
        <p className="mt-1 text-sm text-red-600" id={errorId}>
          {error}
        </p>
      ) : null}
    </label>
  );
}

function AssigneeMultiSelect({
  employees,
  error,
  isError,
  isLoading,
  onChange,
  value,
}: {
  employees: Employee[];
  error?: string;
  isError: boolean;
  isLoading: boolean;
  onChange: (value: string[]) => void;
  value: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selectedEmployees = employees.filter((employee) => value.includes(employee.id));
  const filteredEmployees = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return employees;
    }
    return employees.filter((employee) =>
      [
        employee.employee_id,
        employee.first_name,
        employee.last_name,
        employee.email,
        `${employee.first_name} ${employee.last_name}`,
      ].some((field) => field.toLowerCase().includes(query)),
    );
  }, [employees, searchTerm]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function toggleEmployee(employeeId: string) {
    if (value.includes(employeeId)) {
      onChange(value.filter((id) => id !== employeeId));
      return;
    }
    onChange([...value, employeeId]);
  }

  return (
    <div className="block text-sm font-medium" ref={rootRef}>
      <label htmlFor="assignee-search">Assignee</label>
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="mt-2 flex min-h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-left"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="text-sm font-normal">
          {value.length > 0 ? `${value.length} selected` : "Select assignees"}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>
      {selectedEmployees.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedEmployees.map((employee) => (
            <button
              className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-xs font-medium"
              key={employee.id}
              onClick={() => toggleEmployee(employee.id)}
              type="button"
            >
              {employee.first_name} {employee.last_name}
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      ) : null}
      {isOpen ? (
        <div className="relative z-20 mt-2 rounded-md border bg-card shadow-lg">
          <div className="border-b p-2">
            <input
              className="h-9 w-full rounded-md border bg-background px-3 text-sm font-normal"
              id="assignee-search"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search employees"
              value={searchTerm}
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1" role="listbox">
            {isLoading ? (
              <p className="px-3 py-2 text-sm font-normal text-muted-foreground">
                Loading employees...
              </p>
            ) : isError ? (
              <p className="px-3 py-2 text-sm font-normal text-muted-foreground">
                Could not load employees.
              </p>
            ) : filteredEmployees.length === 0 ? (
              <p className="px-3 py-2 text-sm font-normal text-muted-foreground">
                No employees found.
              </p>
            ) : (
              filteredEmployees.map((employee) => {
                const isSelected = value.includes(employee.id);
                return (
                  <button
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted"
                    key={employee.id}
                    onClick={() => toggleEmployee(employee.id)}
                    role="option"
                    type="button"
                    aria-selected={isSelected}
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded border">
                      {isSelected ? <Check className="h-3 w-3" /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {employee.first_name} {employee.last_name} - {employee.employee_id}
                      </span>
                      <span className="block truncate text-xs font-normal text-muted-foreground">
                        {employee.email}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function projectToForm(project: Project): ProjectFormValues {
  return {
    project_code: project.project_code,
    project_name: project.project_name,
    project_status: project.project_status,
    assignee_ids: project.assignees.map((assignee) => assignee.id),
    start_date: project.start_date,
    end_date: project.end_date ?? "",
  };
}

function normalizeProjectForm(values: ProjectFormValues): ProjectFormValues {
  return {
    project_code: values.project_code.trim().toUpperCase(),
    project_name: values.project_name.trim(),
    project_status: values.project_status,
    assignee_ids: Array.from(new Set(values.assignee_ids)),
    start_date: values.start_date,
    end_date: values.end_date,
  };
}

function toProjectPayload(values: ProjectFormValues): ProjectCreate {
  return {
    project_code: values.project_code,
    project_name: values.project_name,
    project_status: values.project_status,
    assignee_ids: values.assignee_ids,
    start_date: values.start_date,
    end_date: values.end_date || null,
  };
}

function validateProjectForm(values: ProjectFormValues) {
  const nextErrors: ProjectFormErrors = {};
  if (!values.project_code) {
    nextErrors.project_code = "Project code is required";
  }
  if (!values.project_name) {
    nextErrors.project_name = "Project name is required";
  }
  if (!statusOptions.some((option) => option.value === values.project_status)) {
    nextErrors.project_status = "Project status is required";
  }
  if (values.assignee_ids.length === 0) {
    nextErrors.assignee_ids = "At least one assignee is required";
  }
  if (!values.start_date) {
    nextErrors.start_date = "Start date is required";
  }
  if (values.start_date && values.end_date && values.end_date < values.start_date) {
    nextErrors.end_date = "End date cannot be before start date";
  }
  return nextErrors;
}
