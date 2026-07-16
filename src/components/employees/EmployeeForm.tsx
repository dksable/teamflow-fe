import { FormEvent } from "react";

import { EmployeeCreate } from "../../types/employee";
import { Button } from "../ui/button";

export type EmployeeFormErrors = Partial<Record<keyof EmployeeCreate, string>>;

const designationOptions = [
  "Software Engineer",
  "Senior Software Engineer",
  "Lead Software Engineer",
  "Engineering Manager",
  "QA Engineer",
  "Senior QA Engineer",
  "QA Lead",
  "UI/UX Designer",
  "Product Manager",
  "Project Manager",
  "HR Executive",
  "HR Manager",
  "Business Analyst",
  "DevOps Engineer",
  "Technical Architect",
  "Team Lead",
  "Intern",
  "Other",
];
const otherDesignationValue = "__other_designation__";

type EmployeeFormProps = {
  values: EmployeeCreate;
  errors: EmployeeFormErrors;
  isSubmitting: boolean;
  submitLabel: string;
  onCancel: () => void;
  onChange: (field: keyof EmployeeCreate, value: string) => void;
  onSubmit: () => void;
};

export function EmployeeForm({
  values,
  errors,
  isSubmitting,
  submitLabel,
  onCancel,
  onChange,
  onSubmit,
}: EmployeeFormProps) {
  const isCustomDesignation =
    Boolean(values.designation) &&
    values.designation !== otherDesignationValue &&
    !designationOptions.includes(values.designation);
  const selectedDesignation = isCustomDesignation || values.designation === otherDesignationValue ? "Other" : values.designation;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <FormField
        error={errors.employee_id}
        id="employee_id"
        label="Employee ID"
        onChange={(value) => onChange("employee_id", value)}
        value={values.employee_id}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          error={errors.first_name}
          id="first_name"
          label="First Name"
          onChange={(value) => onChange("first_name", value)}
          value={values.first_name}
        />
        <FormField
          error={errors.last_name}
          id="last_name"
          label="Last Name"
          onChange={(value) => onChange("last_name", value)}
          value={values.last_name}
        />
      </div>
      <FormField
        error={errors.email}
        id="email"
        label="Email ID"
        onChange={(value) => onChange("email", value)}
        type="email"
        value={values.email}
      />
      <FormField
        error={errors.date_of_birth}
        id="date_of_birth"
        label="Date of Birth"
        onChange={(value) => onChange("date_of_birth", value)}
        type="date"
        value={values.date_of_birth}
      />
      <label className="block text-sm font-medium" htmlFor="designation">
        Designation
        <select
          aria-invalid={Boolean(errors.designation)}
          className="mt-2 h-10 w-full rounded-md border bg-background px-3"
          id="designation"
          onChange={(event) => onChange("designation", event.target.value === "Other" ? otherDesignationValue : event.target.value)}
          value={selectedDesignation}
        >
          <option value="">Select designation</option>
          {designationOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {selectedDesignation === "Other" ? (
          <input
            aria-invalid={Boolean(errors.designation)}
            className="mt-2 h-10 w-full rounded-md border bg-background px-3"
            onChange={(event) => onChange("designation", event.target.value)}
            placeholder="Custom Designation"
            type="text"
            value={isCustomDesignation ? values.designation : ""}
          />
        ) : null}
        {errors.designation ? (
          <p className="mt-1 text-sm text-red-600">{errors.designation}</p>
        ) : null}
      </label>
      <label className="block text-sm font-medium" htmlFor="role">
        Role
        <select
          aria-invalid={Boolean(errors.role)}
          className="mt-2 h-10 w-full rounded-md border bg-background px-3"
          id="role"
          onChange={(event) => onChange("role", event.target.value)}
          value={values.role}
        >
          <option value="view">View</option>
          <option value="admin">Admin</option>
        </select>
        {errors.role ? (
          <p className="mt-1 text-sm text-red-600">{errors.role}</p>
        ) : null}
      </label>
      <div className="flex justify-end gap-3 pt-2">
        <Button
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function FormField({
  error,
  id,
  label,
  onChange,
  type = "text",
  value,
}: {
  error?: string;
  id: keyof EmployeeCreate;
  label: string;
  onChange: (value: string) => void;
  type?: string;
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

export function normalizeEmployeeForm(values: EmployeeCreate): EmployeeCreate {
  return {
    employee_id: values.employee_id.trim(),
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    email: values.email.trim().toLowerCase(),
    date_of_birth: values.date_of_birth,
    designation: values.designation === otherDesignationValue ? "" : values.designation.trim(),
    role: values.role,
  };
}

export function validateEmployeeForm(values: EmployeeCreate) {
  const normalized = normalizeEmployeeForm(values);
  const nextErrors: EmployeeFormErrors = {};

  if (!normalized.employee_id) {
    nextErrors.employee_id = "Employee ID is required";
  }

  if (!normalized.first_name) {
    nextErrors.first_name = "First name is required";
  }

  if (!normalized.last_name) {
    nextErrors.last_name = "Last name is required";
  }

  if (!normalized.email) {
    nextErrors.email = "Email ID is required";
  } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized.email)) {
    nextErrors.email = "Enter a valid email address";
  }

  if (!normalized.date_of_birth) {
    nextErrors.date_of_birth = "Date of birth is required";
  } else if (new Date(normalized.date_of_birth) > new Date()) {
    nextErrors.date_of_birth = "Date of birth cannot be in the future";
  }

  if (!normalized.designation) {
    nextErrors.designation = "Designation is required.";
  }

  if (!["admin", "view"].includes(normalized.role)) {
    nextErrors.role = "Role is required";
  }

  return nextErrors;
}
