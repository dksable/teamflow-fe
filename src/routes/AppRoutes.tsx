import { Navigate, Route, Routes } from "react-router-dom";

import { GuestRoute, ProtectedRoute } from "../components/auth/RouteGuards";
import { AppLayout } from "../components/layout/AppLayout";
import { AssistantPage } from "../pages/AssistantPage";
import { DashboardPage } from "../pages/DashboardPage";
import { EmployeesPage } from "../pages/EmployeesPage";
import {
  ForbiddenPage,
  NotFoundPage,
  UnauthorizedPage,
} from "../pages/errors/ErrorPages";
import { HolidaysPage } from "../pages/HolidaysPage";
import { LeavesPage } from "../pages/LeavesPage";
import { LoginPage } from "../pages/LoginPage";
import { ProjectsPage } from "../pages/ProjectsPage";
import { SetPasswordPage } from "../pages/SetPasswordPage";
import { TimesheetPage } from "../pages/TimesheetPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route path="/set-password" element={<SetPasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="timesheet" element={<TimesheetPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="leaves" element={<LeavesPage />} />
          <Route path="holidays" element={<HolidaysPage />} />
          <Route path="assistant" element={<AssistantPage />} />
        </Route>
      </Route>
      <Route path="/401" element={<UnauthorizedPage />} />
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
