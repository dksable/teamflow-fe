import { CalendarDays, CheckCircle2, Clock, FolderKanban, Hourglass, Send, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "../components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/state";
import {
  useDashboardSummary,
  useEmployeeUtilization,
  useMyDashboard,
  useProjectUtilization,
  useRecentEmployees,
  useRecentTimesheets,
  useUpcomingHolidays,
} from "../hooks/useDashboard";
import { usePermissions } from "../hooks/usePermissions";
import { EmployeeUtilization, RecentTimesheet, UpcomingHoliday } from "../types/dashboard";

export function DashboardPage() {
  const permissions = usePermissions();

  if (permissions.role === "admin") {
    return <AdminDashboard />;
  }

  return <EmployeeDashboard />;
}

function AdminDashboard() {
  const summaryQuery = useDashboardSummary();
  const projectUtilizationQuery = useProjectUtilization();
  const employeeUtilizationQuery = useEmployeeUtilization();
  const recentTimesheetsQuery = useRecentTimesheets();
  const recentEmployeesQuery = useRecentEmployees();
  const upcomingHolidaysQuery = useUpcomingHolidays();

  const hasError =
    summaryQuery.isError ||
    projectUtilizationQuery.isError ||
    employeeUtilizationQuery.isError ||
    recentTimesheetsQuery.isError ||
    recentEmployeesQuery.isError ||
    upcomingHolidaysQuery.isError;

  function retryAll() {
    summaryQuery.refetch();
    projectUtilizationQuery.refetch();
    employeeUtilizationQuery.refetch();
    recentTimesheetsQuery.refetch();
    recentEmployeesQuery.refetch();
    upcomingHolidaysQuery.refetch();
  }

  if (hasError) {
    return (
      <DashboardShell>
        <ErrorState onRetry={retryAll} title="We could not load dashboard data." />
      </DashboardShell>
    );
  }

  const summary = summaryQuery.data;
  const kpis = [
    { title: "Total Employees", value: summary?.totalEmployees, icon: Users },
    { title: "Total Projects", value: summary?.totalProjects, icon: FolderKanban },
    { title: "Active Projects", value: summary?.activeProjects, icon: CheckCircle2 },
    { title: "Pending Invitations", value: summary?.pendingInvitations, icon: Send },
    { title: "Pending Timesheets", value: summary?.pendingTimesheets, icon: Hourglass },
    { title: "Approved Timesheets", value: summary?.approvedTimesheets, icon: CheckCircle2 },
    { title: "Rejected Timesheets", value: summary?.rejectedTimesheets, icon: Clock },
  ];

  return (
    <DashboardShell>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard icon={kpi.icon} isLoading={summaryQuery.isLoading} key={kpi.title} title={kpi.title} value={kpi.value ?? 0} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-md border bg-card p-4">
          <SectionTitle title="Project Utilization" />
          {projectUtilizationQuery.isLoading ? (
            <LoadingState className="m-0 min-h-72 border-0" title="Loading chart..." />
          ) : (projectUtilizationQuery.data ?? []).length === 0 ? (
            <EmptyState className="m-0 min-h-72 border-0" title="No Projects" />
          ) : (
            <div className="mt-4 h-80">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={(projectUtilizationQuery.data ?? []).map((item) => ({ ...item, hours: Number(item.hours) }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="project" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#f5821f" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="rounded-md border bg-card p-4">
          <SectionTitle title="Quick Actions" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Button asChild><Link to="/employees">Add Employee</Link></Button>
            <Button asChild><Link to="/projects">Create Project</Link></Button>
            <Button asChild><Link to="/holidays">Upload Holiday</Link></Button>
            <Button asChild><Link to="/timesheet">Review Timesheets</Link></Button>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <EmployeeUtilizationTable data={employeeUtilizationQuery.data ?? []} isLoading={employeeUtilizationQuery.isLoading} />
        <RecentTimesheetsTable data={recentTimesheetsQuery.data ?? []} isLoading={recentTimesheetsQuery.isLoading} />
        <RecentEmployeesTable data={recentEmployeesQuery.data ?? []} isLoading={recentEmployeesQuery.isLoading} />
        <UpcomingHolidaysList data={upcomingHolidaysQuery.data ?? []} isLoading={upcomingHolidaysQuery.isLoading} />
      </div>
    </DashboardShell>
  );
}

function EmployeeDashboard() {
  const dashboardQuery = useMyDashboard();

  if (dashboardQuery.isError) {
    return (
      <DashboardShell>
        <ErrorState onRetry={() => dashboardQuery.refetch()} title="We could not load your dashboard." />
      </DashboardShell>
    );
  }

  const data = dashboardQuery.data;
  const cards = [
    { title: "My Assigned Projects", value: data?.assignedProjects ?? 0, icon: FolderKanban },
    { title: "My Current Week Hours", value: formatHours(data?.currentWeekHours ?? "0"), icon: Clock },
    { title: "My Timesheet Status", value: data?.currentTimesheetStatus ? formatStatus(data.currentTimesheetStatus) : "-", icon: CalendarDays },
  ];

  return (
    <DashboardShell>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <KpiCard icon={card.icon} isLoading={dashboardQuery.isLoading} key={card.title} title={card.title} value={card.value} />
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-md border bg-card p-4">
          <SectionTitle title="Recent Timesheet" />
          {dashboardQuery.isLoading ? (
            <LoadingState className="m-0 min-h-32 border-0" title="Loading timesheet..." />
          ) : data?.recentTimesheet ? (
            <RecentTimesheetsTable data={[data.recentTimesheet]} isLoading={false} />
          ) : (
            <EmptyState className="m-0 min-h-32 border-0" title="No Timesheets" />
          )}
        </section>
        <UpcomingHolidaysList data={data?.upcomingHolidays ?? []} isLoading={dashboardQuery.isLoading} />
      </div>
    </DashboardShell>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back</p>
        </div>
        <p className="text-sm font-medium text-muted-foreground">{formatToday()}</p>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function KpiCard({ icon: Icon, isLoading, title, value }: { icon: typeof Users; isLoading: boolean; title: string; value: number | string }) {
  return (
    <article className="rounded-md border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="h-5 w-5 text-[#f5821f]" />
      </div>
      {isLoading ? (
        <div className="mt-4 h-7 w-20 animate-pulse rounded bg-muted" />
      ) : (
        <p className="mt-3 text-2xl font-semibold">{value}</p>
      )}
    </article>
  );
}

function EmployeeUtilizationTable({ data, isLoading }: { data: EmployeeUtilization[]; isLoading: boolean }) {
  return (
    <section className="rounded-md border bg-card p-4">
      <SectionTitle title="Employee Utilization" />
      {isLoading ? <LoadingState className="m-0 min-h-40 border-0" title="Loading utilization..." /> : null}
      {!isLoading && data.length === 0 ? <EmptyState className="m-0 min-h-40 border-0" title="No Employees" /> : null}
      {!isLoading && data.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b text-muted-foreground">
              <tr>
                <th className="py-2 font-medium">Employee</th>
                <th className="py-2 font-medium">Assigned Projects</th>
                <th className="py-2 font-medium">Logged Hours</th>
                <th className="py-2 font-medium">Expected Hours</th>
                <th className="py-2 font-medium">Utilization %</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr className="border-b last:border-0" key={row.employee}>
                  <td className="py-3 font-medium">{row.employee}</td>
                  <td className="py-3">{row.assignedProjects}</td>
                  <td className="py-3">{formatHours(row.loggedHours)}</td>
                  <td className="py-3">{formatHours(row.expectedHours)}</td>
                  <td className="py-3">{Number(row.utilization).toFixed(0)}%</td>
                  <td className="py-3"><UtilizationBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

function RecentTimesheetsTable({ data, isLoading }: { data: RecentTimesheet[]; isLoading: boolean }) {
  return (
    <section className="rounded-md border bg-card p-4">
      <SectionTitle title="Recent Timesheets" />
      {isLoading ? <LoadingState className="m-0 min-h-40 border-0" title="Loading timesheets..." /> : null}
      {!isLoading && data.length === 0 ? <EmptyState className="m-0 min-h-40 border-0" title="No Timesheets" /> : null}
      {!isLoading && data.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b text-muted-foreground">
              <tr>
                <th className="py-2 font-medium">Employee</th>
                <th className="py-2 font-medium">Week</th>
                <th className="py-2 font-medium">Hours</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((timesheet) => (
                <tr className="border-b last:border-0" key={timesheet.id}>
                  <td className="py-3 font-medium">{timesheet.employee}</td>
                  <td className="py-3">{timesheet.week}</td>
                  <td className="py-3">{formatHours(timesheet.hours)}</td>
                  <td className="py-3">{formatStatus(timesheet.status)}</td>
                  <td className="py-3 text-right"><Button asChild size="sm" variant="outline"><Link to="/timesheet">View</Link></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

function RecentEmployeesTable({ data, isLoading }: { data: Array<{ name: string; role: string; status: string; createdDate: string }>; isLoading: boolean }) {
  return (
    <section className="rounded-md border bg-card p-4">
      <SectionTitle title="Recent Employees" />
      {isLoading ? <LoadingState className="m-0 min-h-40 border-0" title="Loading employees..." /> : null}
      {!isLoading && data.length === 0 ? <EmptyState className="m-0 min-h-40 border-0" title="No Employees" /> : null}
      {!isLoading && data.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b text-muted-foreground">
              <tr>
                <th className="py-2 font-medium">Name</th>
                <th className="py-2 font-medium">Role</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 font-medium">Created Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((employee) => (
                <tr className="border-b last:border-0" key={`${employee.name}-${employee.createdDate}`}>
                  <td className="py-3 font-medium">{employee.name}</td>
                  <td className="py-3">{formatStatus(employee.role)}</td>
                  <td className="py-3">{formatStatus(employee.status)}</td>
                  <td className="py-3">{formatDate(employee.createdDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

function UpcomingHolidaysList({ data, isLoading }: { data: UpcomingHoliday[]; isLoading: boolean }) {
  return (
    <section className="rounded-md border bg-card p-4">
      <SectionTitle title="Upcoming Holidays" />
      {isLoading ? <LoadingState className="m-0 min-h-40 border-0" title="Loading holidays..." /> : null}
      {!isLoading && data.length === 0 ? <EmptyState className="m-0 min-h-40 border-0" title="No Holidays" /> : null}
      {!isLoading && data.length > 0 ? (
        <div className="mt-4 space-y-3">
          {data.map((holiday) => (
            <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm" key={`${holiday.name}-${holiday.date}`}>
              <span className="font-medium">{holiday.name}</span>
              <span className="text-muted-foreground">{formatDate(holiday.date)}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h3 className="text-base font-semibold">{title}</h3>;
}

function UtilizationBadge({ status }: { status: EmployeeUtilization["status"] }) {
  const styles = {
    green: "border-green-200 bg-green-50 text-green-700",
    yellow: "border-yellow-200 bg-yellow-50 text-yellow-700",
    red: "border-red-200 bg-red-50 text-red-700",
  };
  return <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${styles[status]}`}>{formatStatus(status)}</span>;
}

function formatToday() {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(`${value}T00:00:00`));
}

function formatHours(value: string | number) {
  const number = Number(value);
  return Number.isInteger(number) ? String(number) : number.toFixed(1);
}

function formatStatus(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
