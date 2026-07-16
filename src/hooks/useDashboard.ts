import { useQuery } from "@tanstack/react-query";

import {
  fetchDashboardSummary,
  fetchEmployeeUtilization,
  fetchMyDashboard,
  fetchProjectUtilization,
  fetchRecentEmployees,
  fetchRecentTimesheets,
  fetchUpcomingHolidays,
} from "../services/dashboardService";

export function useDashboardSummary(enabled = true) {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: fetchDashboardSummary,
    enabled,
  });
}

export function useProjectUtilization(enabled = true) {
  return useQuery({
    queryKey: ["dashboard", "project-utilization"],
    queryFn: fetchProjectUtilization,
    enabled,
  });
}

export function useEmployeeUtilization(enabled = true) {
  return useQuery({
    queryKey: ["dashboard", "employee-utilization"],
    queryFn: fetchEmployeeUtilization,
    enabled,
  });
}

export function useRecentTimesheets(enabled = true) {
  return useQuery({
    queryKey: ["dashboard", "recent-timesheets"],
    queryFn: fetchRecentTimesheets,
    enabled,
  });
}

export function useRecentEmployees(enabled = true) {
  return useQuery({
    queryKey: ["dashboard", "recent-employees"],
    queryFn: fetchRecentEmployees,
    enabled,
  });
}

export function useUpcomingHolidays(enabled = true) {
  return useQuery({
    queryKey: ["dashboard", "upcoming-holidays"],
    queryFn: fetchUpcomingHolidays,
    enabled,
  });
}

export function useMyDashboard(enabled = true) {
  return useQuery({
    queryKey: ["dashboard", "me"],
    queryFn: fetchMyDashboard,
    enabled,
  });
}
