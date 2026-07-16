import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createEmployee,
  deleteEmployee,
  fetchEmployees,
  resendEmployeeInvitation,
  updateEmployee,
} from "../services/employeeService";
import { EmployeeCreate, EmployeeUpdate } from "../types/employee";

export const employeesQueryKey = ["employees"];

export function useEmployees() {
  return useQuery({
    queryKey: employeesQueryKey,
    queryFn: fetchEmployees,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EmployeeCreate) => createEmployee(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesQueryKey });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EmployeeUpdate }) =>
      updateEmployee(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesQueryKey });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesQueryKey });
    },
  });
}

export function useResendEmployeeInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resendEmployeeInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesQueryKey });
    },
  });
}
