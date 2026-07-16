export type DashboardSummary = {
  totalEmployees: number;
  totalProjects: number;
  activeProjects: number;
  pendingInvitations: number;
  pendingTimesheets: number;
  approvedTimesheets: number;
  rejectedTimesheets: number;
};

export type ProjectUtilization = {
  project: string;
  hours: string;
};

export type EmployeeUtilization = {
  employee: string;
  assignedProjects: number;
  loggedHours: string;
  expectedHours: string;
  utilization: string;
  status: "green" | "yellow" | "red";
};

export type RecentTimesheet = {
  id: string;
  employee: string;
  week: string;
  hours: string;
  status: string;
};

export type RecentEmployee = {
  name: string;
  role: string;
  status: string;
  createdDate: string;
};

export type UpcomingHoliday = {
  name: string;
  date: string;
};

export type MyDashboard = {
  assignedProjects: number;
  currentWeekHours: string;
  currentTimesheetStatus: string | null;
  recentTimesheet: RecentTimesheet | null;
  upcomingHolidays: UpcomingHoliday[];
};
