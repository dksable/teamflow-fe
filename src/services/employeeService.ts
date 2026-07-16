import { apiDelete, apiGet, apiPatch, apiPost } from "../lib/api";
import {
  Employee,
  EmployeeCreate,
  EmployeeCreateResponse,
  EmployeeUpdate,
  ResendInvitationResponse,
} from "../types/employee";

export function fetchEmployees() {
  return apiGet<Employee[]>("/employees");
}

export function createEmployee(payload: EmployeeCreate) {
  return apiPost<EmployeeCreateResponse>("/employees", payload);
}

export function updateEmployee(id: string, payload: EmployeeUpdate) {
  return apiPatch<Employee>(`/employees/${id}`, payload);
}

export function deleteEmployee(id: string) {
  return apiDelete(`/employees/${id}`);
}

export function resendEmployeeInvitation(id: string) {
  return apiPost<ResendInvitationResponse>(`/employees/${id}/resend-invitation`);
}
