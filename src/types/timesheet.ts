export type TimesheetStatus = "draft" | "submitted" | "approved" | "rejected";

export type AssignedTimesheetProject = {
  id: string;
  project_code: string;
  project_name: string;
  project_status: string;
  start_date: string;
  end_date: string | null;
};

export type TimesheetEntry = {
  id: string;
  project_id: string;
  project_code: string;
  project_name: string;
  work_date: string;
  hours: string;
  notes: string | null;
};

export type TimesheetEmployee = {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export type Timesheet = {
  id: string;
  employee: TimesheetEmployee;
  week_start: string;
  week_end: string;
  status: TimesheetStatus;
  submitted_at: string | null;
  approved_at: string | null;
  approved_by: number | null;
  approved_by_name: string | null;
  rejected_at: string | null;
  rejected_by: number | null;
  rejected_by_name: string | null;
  rejection_reason: string | null;
  entries: TimesheetEntry[];
  daily_totals: Record<string, string>;
  weekly_total: string;
  created_at: string;
  updated_at: string;
};

export type TimesheetEntryInput = {
  local_id: string;
  project_id: string;
  work_date: string;
  hours: string;
  notes: string;
};

export type TimesheetSavePayload = {
  week_start: string;
  entries: Array<{
    project_id: string;
    work_date: string;
    hours: string;
    notes: string | null;
  }>;
};

export type TimesheetSummary = {
  total_timesheets: number;
  draft: number;
  submitted: number;
  approved: number;
  rejected: number;
  total_logged_hours: string;
};
