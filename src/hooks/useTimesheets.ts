import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  approveTimesheet,
  fetchAssignedTimesheetProjects,
  fetchTimesheetSummary,
  fetchTimesheets,
  rejectTimesheet,
  saveTimesheetWeek,
  submitTimesheet,
} from "../services/timesheetService";
import { TimesheetSavePayload, TimesheetStatus } from "../types/timesheet";

export const timesheetsQueryKey = ["timesheets"];

export function useAssignedActiveProjects(weekStart: string) {
  return useQuery({
    queryKey: ["timesheets", "assigned-projects", weekStart],
    queryFn: () => fetchAssignedTimesheetProjects(weekStart),
  });
}

export function useTimesheetSummary(weekStart: string) {
  return useQuery({
    queryKey: [...timesheetsQueryKey, "summary", weekStart],
    queryFn: () => fetchTimesheetSummary(weekStart),
  });
}

export function useTimesheets(params: { week_start?: string; status?: TimesheetStatus | "" }) {
  return useQuery({
    queryKey: [...timesheetsQueryKey, params],
    queryFn: () => fetchTimesheets(params),
    retry: false,
  });
}

export function useSaveTimesheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TimesheetSavePayload) => saveTimesheetWeek(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: timesheetsQueryKey }),
  });
}

export function useSubmitTimesheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => submitTimesheet(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: timesheetsQueryKey }),
  });
}

export function useApproveTimesheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveTimesheet(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: timesheetsQueryKey }),
  });
}

export function useRejectTimesheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectTimesheet(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: timesheetsQueryKey }),
  });
}
