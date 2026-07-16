import { apiGet } from "../lib/api";
import {
  DashboardSummary,
  EmployeeUtilization,
  MyDashboard,
  ProjectUtilization,
  RecentEmployee,
  RecentTimesheet,
  UpcomingHoliday,
} from "../types/dashboard";

export function fetchDashboardSummary() {
  return apiGet<DashboardSummary>("/dashboard/summary");
}

export function fetchProjectUtilization() {
  return apiGet<ProjectUtilization[]>("/dashboard/project-utilization");
}

export function fetchEmployeeUtilization() {
  return apiGet<EmployeeUtilization[]>("/dashboard/employee-utilization");
}

export function fetchRecentTimesheets() {
  return apiGet<RecentTimesheet[]>("/dashboard/recent-timesheets");
}

export function fetchRecentEmployees() {
  return apiGet<RecentEmployee[]>("/dashboard/recent-employees");
}

export function fetchUpcomingHolidays() {
  return apiGet<UpcomingHoliday[]>("/dashboard/upcoming-holidays");
}

export function fetchMyDashboard() {
  return apiGet<MyDashboard>("/dashboard/me");
}
