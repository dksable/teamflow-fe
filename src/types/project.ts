export type ProjectStatus = "active" | "completed" | "on_hold" | "cancelled";

export type ProjectAssignee = {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export type Project = {
  id: string;
  project_code: string;
  project_name: string;
  project_status: ProjectStatus;
  assignees: ProjectAssignee[];
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectCreate = {
  project_code: string;
  project_name: string;
  project_status: ProjectStatus;
  assignee_ids: string[];
  start_date: string;
  end_date: string | null;
};

export type ProjectUpdate = Partial<ProjectCreate>;
