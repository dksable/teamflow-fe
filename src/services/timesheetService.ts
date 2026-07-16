import { apiGet, apiPost, apiPut } from "../lib/api";
import {
  AssignedTimesheetProject,
  Timesheet,
  TimesheetSavePayload,
  TimesheetSummary,
  TimesheetStatus,
} from "../types/timesheet";

export function fetchAssignedTimesheetProjects(weekStart: string) {
  return apiGet<AssignedTimesheetProject[]>(
    `/timesheets/assigned-projects?week_start=${encodeURIComponent(weekStart)}`,
  );
}

export function fetchTimesheets(params: {
  week_start?: string;
  status?: TimesheetStatus | "";
}) {
  const searchParams = new URLSearchParams();
  if (params.week_start) {
    searchParams.set("week_start", params.week_start);
  }
  if (params.status) {
    searchParams.set("status", params.status);
  }
  const query = searchParams.toString();
  return apiGet<Timesheet[]>(`/timesheets${query ? `?${query}` : ""}`);
}

export function fetchTimesheetSummary(weekStart: string) {
  return apiGet<TimesheetSummary>(
    `/timesheets/summary?week_start=${encodeURIComponent(weekStart)}`,
  );
}

export function saveTimesheetWeek(payload: TimesheetSavePayload) {
  return apiPut<Timesheet>("/timesheets/week", payload);
}

export function submitTimesheet(id: string) {
  return apiPost<Timesheet>(`/timesheets/${id}/submit`);
}

export function approveTimesheet(id: string) {
  return apiPost<Timesheet>(`/timesheets/${id}/approve`);
}

export function rejectTimesheet(id: string, reason: string) {
  return apiPost<Timesheet>(`/timesheets/${id}/reject`, { reason });
}
