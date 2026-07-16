export type Employee = {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
  designation: string;
  role: "admin" | "view";
  account_status: "invited" | "active" | "disabled";
  created_at: string;
  updated_at: string;
};

export type EmployeeCreate = {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
  designation: string;
  role: "admin" | "view";
};

export type EmployeeUpdate = Partial<EmployeeCreate>;

export type EmployeeCreateResponse = {
  employee: Employee;
  invitation_sent: boolean;
};

export type ResendInvitationResponse = {
  message: string;
  invitation_sent: boolean;
};
