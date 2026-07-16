import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Calendar, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Info, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Dialog } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { EmptyState, LoadingState } from "../components/ui/state";
import { getApiErrorMessage } from "../lib/api";
import { usePermissions } from "../hooks/usePermissions";
import {
  useApproveTimesheet,
  useAssignedActiveProjects,
  useRejectTimesheet,
  useSaveTimesheet,
  useSubmitTimesheet,
  useTimesheetSummary,
  useTimesheets,
} from "../hooks/useTimesheets";
import {
  Timesheet,
  TimesheetEntryInput,
  TimesheetSavePayload,
  TimesheetStatus,
} from "../types/timesheet";

const statusLabels: Record<TimesheetStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
};

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function TimesheetPage() {
  const permissions = usePermissions();
  const [weekStart, setWeekStart] = useState(() => formatDateInput(getCurrentWeekStart()));

  if (permissions.role === "admin") {
    return <AdminTimesheetShell weekStart={weekStart} onWeekChange={setWeekStart} />;
  }

  return <EmployeeTimesheetPage weekStart={weekStart} onWeekChange={setWeekStart} />;
}

function EmployeeTimesheetPage({
  weekStart,
  onWeekChange,
}: {
  weekStart: string;
  onWeekChange: (value: string) => void;
}) {
  const timesheetsQuery = useTimesheets({ week_start: weekStart });
  const projectsQuery = useAssignedActiveProjects(weekStart);
  const saveTimesheet = useSaveTimesheet();
  const submitTimesheet = useSubmitTimesheet();
  const timesheet = timesheetsQuery.data?.[0] ?? null;
  const [entries, setEntries] = useState<TimesheetEntryInput[]>([]);
  const [projectRows, setProjectRows] = useState<string[]>([]);
  const [dayErrors, setDayErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetched = timesheetsQuery.data?.[0];
    if (!fetched) {
      setEntries([]);
      setProjectRows([]);
      setDayErrors({});
      return;
    }
    const nextEntries = fetched.entries.map((entry) => ({
        local_id: entry.id,
        project_id: entry.project_id,
        work_date: entry.work_date,
        hours: String(entry.hours),
        notes: entry.notes ?? "",
      }));
    setEntries(nextEntries);
    setProjectRows(Array.from(new Set(nextEntries.map((entry) => entry.project_id))));
    setDayErrors({});
  }, [timesheetsQuery.data, weekStart]);

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const workingDates = useMemo(() => weekDates.slice(0, 5), [weekDates]);
  const weekendDates = useMemo(() => weekDates.slice(5), [weekDates]);
  const totals = useMemo(() => calculateDailyTotals(entries), [entries]);
  const weeklyTotal = useMemo(
    () => entries.reduce((sum, entry) => sum + toNumber(entry.hours), 0),
    [entries],
  );
  const availableProjects = projectsQuery.data ?? [];
  const addableProjects = availableProjects.filter((project) => !projectRows.includes(project.id));
  const currentWeekStart = formatDateInput(getCurrentWeekStart());
  const isFutureWeek = weekStart > currentWeekStart;
  const isReadOnly = timesheet?.status === "submitted" || timesheet?.status === "approved";
  const isEditingLocked = isReadOnly || isFutureWeek;
  const hasValidationBlock = hasBlockingValidation(entries, weekDates);
  const isMutating = saveTimesheet.isPending || submitTimesheet.isPending;
  const isInitialLoading = timesheetsQuery.isLoading || projectsQuery.isLoading;

  function getProjectName(projectId: string) {
    return (
      availableProjects.find((project) => project.id === projectId)?.project_name ??
      timesheet?.entries.find((entry) => entry.project_id === projectId)?.project_name ??
      "Unknown project"
    );
  }

  function getEntry(projectId: string, workDate: string) {
    return entries.find((entry) => entry.project_id === projectId && entry.work_date === workDate);
  }

  function updateProjectDay(projectId: string, workDate: string, hours: string) {
    setEntries((current) => {
      const existing = current.find((entry) => entry.project_id === projectId && entry.work_date === workDate);
      if (!hours.trim()) {
        return current.filter((entry) => !(entry.project_id === projectId && entry.work_date === workDate));
      }
      if (existing) {
        return current.map((entry) =>
          entry.local_id === existing.local_id ? { ...entry, hours } : entry,
        );
      }
      return [
        ...current,
        {
          local_id: crypto.randomUUID(),
          project_id: projectId,
          work_date: workDate,
          hours,
          notes: "",
        },
      ];
    });
  }

  function addProjectRow(projectId: string) {
    if (!projectId) {
      return;
    }
    setProjectRows((current) => (current.includes(projectId) ? current : [...current, projectId]));
  }

  function removeProjectRow(projectId: string) {
    setProjectRows((current) => current.filter((id) => id !== projectId));
    setEntries((current) => current.filter((entry) => entry.project_id !== projectId));
  }

  function getProjectTotal(projectId: string) {
    return entries
      .filter((entry) => entry.project_id === projectId)
      .reduce((sum, entry) => sum + toNumber(entry.hours), 0);
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {};
    const seenProjectDates = new Set<string>();
    for (const date of weekDates) {
      if ((totals[date] ?? 0) > 8) {
        nextErrors[date] = "Daily logged hours cannot exceed 8 hours.";
      }
    }
    for (const entry of entries.filter(isPersistableEntry)) {
      if (!entry.project_id || toNumber(entry.hours) <= 0) {
        nextErrors[entry.work_date] = nextErrors[entry.work_date] ?? "Project and hours are required.";
      }
      const key = `${entry.work_date}:${entry.project_id}`;
      if (seenProjectDates.has(key)) {
        nextErrors[entry.work_date] = "This project has already been added for this date.";
      }
      seenProjectDates.add(key);
    }
    setDayErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function buildPayload(): TimesheetSavePayload {
    return {
      week_start: weekStart,
      entries: entries
        .filter(isPersistableEntry)
        .map((entry) => ({
          project_id: entry.project_id,
          work_date: entry.work_date,
          hours: entry.hours,
          notes: entry.notes.trim() || null,
        })),
    };
  }

  async function handleSubmit() {
    if (!validateForm()) {
      return;
    }
    try {
      const saved = await saveTimesheet.mutateAsync(buildPayload());
      await submitTimesheet.mutateAsync(saved.id);
      toast.success("Timesheet submitted successfully.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <section className="text-sm">
      <TimesheetHeader
        description="Track your weekly project hours."
        onWeekChange={onWeekChange}
        weekStart={weekStart}
      />

      {timesheet ? (
        <div className="mt-4 flex items-center gap-3">
          <StatusBadge status={timesheet.status} />
          {timesheet.status === "submitted" ? (
            <span className="text-sm text-muted-foreground">Waiting for approval</span>
          ) : null}
          {timesheet.status === "rejected" && timesheet.rejection_reason ? (
            <span className="text-sm text-red-600">{timesheet.rejection_reason}</span>
          ) : null}
        </div>
      ) : null}
      {isFutureWeek ? (
        <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          Future-week timesheets cannot be created or edited.
        </div>
      ) : null}

      {Object.keys(dayErrors).length > 0 ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {Object.values(dayErrors)[0]}
        </div>
      ) : null}

      {isInitialLoading ? (
        <LoadingState title="Loading timesheet..." />
      ) : null}

      {!isInitialLoading ? (
      <>
      <div className="mt-8 overflow-x-auto rounded-md border bg-card">
        <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="w-56 border-r px-3 py-4 text-sm font-semibold">Project</th>
              {workingDates.map((workDate) => {
                const label = formatDayHeader(workDate);
                return (
                  <th className="w-32 border-r px-3 py-4 text-center font-semibold" key={workDate}>
                    <span className="block">{label.weekday}</span>
                    <span className="mt-1 block font-normal text-muted-foreground">{label.date}</span>
                  </th>
                );
              })}
              {weekendDates.map((workDate) => {
                const label = formatDayHeader(workDate);
                return (
                  <th className="w-32 border-r bg-muted/30 px-3 py-4 text-center font-semibold text-muted-foreground" key={workDate}>
                    <span className="block">{label.weekday}</span>
                    <span className="mt-1 block font-normal">{label.date}</span>
                    <span className="mt-1 block text-xs">(Weekend)</span>
                  </th>
                );
              })}
              <th className="w-32 px-3 py-4 text-center text-sm font-semibold" colSpan={2}>Total</th>
            </tr>
          </thead>
          <tbody>
            {projectRows.map((projectId) => (
              <tr className="border-b last:border-b" key={projectId}>
                <td className="border-r px-3 py-3 text-sm font-semibold">{getProjectName(projectId)}</td>
                {workingDates.map((workDate) => {
                  const entry = getEntry(projectId, workDate);
                  return (
                    <td className="border-r px-3 py-3 text-center" key={workDate}>
                      <input
                        className="mx-auto h-9 w-24 rounded-md border bg-background px-2 text-center text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-muted"
                        disabled={isEditingLocked}
                        min="0"
                        max="8"
                        step="0.5"
                        type="number"
                        onChange={(event) => updateProjectDay(projectId, workDate, event.target.value)}
                        placeholder="-"
                        value={entry?.hours ?? ""}
                      />
                    </td>
                  );
                })}
                {weekendDates.map((workDate) => (
                    <td className="border-r bg-muted/20 px-3 py-3 text-center font-medium text-muted-foreground" key={workDate}>
                    -
                  </td>
                ))}
                <td className="px-3 py-3 text-center text-sm font-semibold">
                  {formatHours(getProjectTotal(projectId))} hrs
                </td>
                <td className="w-14 px-2 py-3 text-center">
                  <Button
                    disabled={isEditingLocked}
                    onClick={() => removeProjectRow(projectId)}
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {projectRows.length === 0 ? (
              <tr className="border-b">
                <td className="px-3 py-6 text-muted-foreground" colSpan={10}>
                  Add a project to start this week's timesheet.
                </td>
              </tr>
            ) : null}
            <tr className="border-b bg-muted/20">
              <td className="border-r px-3 py-3 text-sm font-semibold">
                Daily Total <span className="font-medium text-muted-foreground">(Max 8 hrs)</span>
              </td>
              {workingDates.map((workDate) => {
                const total = totals[workDate] ?? 0;
                const isOver = total > 8;
                return (
                  <td className={`border-r px-3 py-3 text-center font-bold ${isOver ? "text-red-600" : "text-green-600"}`} key={workDate}>
                    {formatHours(total)} / 8
                  </td>
                );
              })}
              {weekendDates.map((workDate) => (
                <td className="border-r bg-muted/20 px-3 py-3 text-center font-semibold text-muted-foreground" key={workDate}>
                  0 / 8
                </td>
              ))}
              <td className="px-3 py-3 text-center font-bold" colSpan={2}>
                {formatHours(weeklyTotal)} hrs
              </td>
            </tr>
            <tr>
              <td className="border-r px-3 py-3 text-sm font-semibold">Status</td>
              {workingDates.map((workDate) => {
                const total = totals[workDate] ?? 0;
                const isOver = total > 8;
                return (
                  <td className="border-r px-3 py-3 text-center" key={workDate}>
                    {isOver ? (
                      <span className="group relative inline-flex">
                        <AlertCircle className="h-5 w-5 text-red-500" aria-label="Daily total exceeds 8 hours" />
                        <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-48 -translate-x-1/2 rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-lg group-hover:block">
                          Daily total exceeds 8 hours.
                        </span>
                      </span>
                    ) : (
                      <span className="group relative inline-flex">
                        <CheckCircle2 className="h-5 w-5 text-green-600" aria-label="Daily total is within 8 hours" />
                        <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-48 -translate-x-1/2 rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-lg group-hover:block">
                          Daily total is within 8 hours.
                        </span>
                      </span>
                    )}
                  </td>
                );
              })}
              {weekendDates.map((workDate) => (
                <td className="border-r bg-muted/20 px-3 py-3 text-center font-medium text-muted-foreground" key={workDate}>
                  -
                </td>
              ))}
              <td className="px-3 py-3 text-center font-medium text-muted-foreground" colSpan={2}>-</td>
            </tr>
          </tbody>
        </table>
      </div>

      {!isEditingLocked ? (
        <div className="mt-4 max-w-sm">
          <label className="relative block">
            <select
              className="h-12 w-full appearance-none rounded-md border bg-background px-4 pr-10 text-sm font-medium shadow-sm"
              disabled={projectsQuery.isLoading || addableProjects.length === 0}
              onChange={(event) => {
                addProjectRow(event.target.value);
                event.target.value = "";
              }}
              defaultValue=""
            >
              <option value="">+ Add a project to this week</option>
              {addableProjects.map((project) => (
                <option key={project.id} value={project.id}>{project.project_name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </label>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-4 rounded-md border bg-card p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
          <Info className="h-5 w-5 rounded-full text-blue-500" />
          <span>Weekends are disabled. You cannot add or log time on Saturday and Sunday.</span>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold">Weekly Total</p>
            <p className={`text-sm font-bold ${(weeklyTotal > 40 || hasValidationBlock) ? "text-red-600" : "text-foreground"}`}>
              {formatHours(weeklyTotal)} / 40 hrs
            </p>
            <p className="text-sm text-muted-foreground">(5 working days)</p>
          </div>
          <Button className="h-12 px-8" disabled={isEditingLocked || isMutating || entries.filter(isPersistableEntry).length === 0 || hasValidationBlock} onClick={handleSubmit} type="button">
            {submitTimesheet.isPending ? "Submitting..." : "Submit Timesheet"}
          </Button>
        </div>
      </div>
      </>
      ) : null}
    </section>
  );
}

function AdminTimesheetShell({
  weekStart,
  onWeekChange,
}: {
  weekStart: string;
  onWeekChange: (value: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"review" | "mine">("review");
  const myProjectsQuery = useAssignedActiveProjects(weekStart);
  const canUseMyTimesheet = myProjectsQuery.isSuccess;

  return (
    <section>
      <div className="mb-6 flex gap-2 border-b">
        <button
          className={`border-b-2 px-3 py-2 text-sm font-medium ${activeTab === "review" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}
          onClick={() => setActiveTab("review")}
          type="button"
        >
          Review Timesheets
        </button>
        {canUseMyTimesheet ? (
          <button
            className={`border-b-2 px-3 py-2 text-sm font-medium ${activeTab === "mine" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}
            onClick={() => setActiveTab("mine")}
            type="button"
          >
            My Timesheet
          </button>
        ) : null}
      </div>
      {activeTab === "mine" && canUseMyTimesheet ? (
        <EmployeeTimesheetPage weekStart={weekStart} onWeekChange={onWeekChange} />
      ) : (
        <AdminTimesheetPage weekStart={weekStart} onWeekChange={onWeekChange} />
      )}
    </section>
  );
}

function AdminTimesheetPage({
  weekStart,
  onWeekChange,
}: {
  weekStart: string;
  onWeekChange: (value: string) => void;
}) {
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);
  const [rejectingTimesheet, setRejectingTimesheet] = useState<Timesheet | null>(null);
  const [statusFilter, setStatusFilter] = useState<TimesheetStatus | "">("");
  const [reason, setReason] = useState("");
  const timesheetsQuery = useTimesheets({ week_start: weekStart, status: statusFilter });
  const summaryQuery = useTimesheetSummary(weekStart);
  const approveTimesheet = useApproveTimesheet();
  const rejectTimesheet = useRejectTimesheet();

  async function handleApprove(timesheet: Timesheet) {
    try {
      await approveTimesheet.mutateAsync(timesheet.id);
      toast.success("Timesheet approved successfully.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function handleReject() {
    if (!rejectingTimesheet || !reason.trim()) {
      return;
    }
    try {
      await rejectTimesheet.mutateAsync({ id: rejectingTimesheet.id, reason });
      toast.success("Timesheet rejected successfully.");
      setRejectingTimesheet(null);
      setReason("");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <section>
      <TimesheetHeader
        description="Review employee timesheets."
        onWeekChange={onWeekChange}
        weekStart={weekStart}
      />
      <div className="mt-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <SummaryCard label="Total Timesheets" value={summaryQuery.data?.total_timesheets ?? 0} />
        <SummaryCard label="Draft" value={summaryQuery.data?.draft ?? 0} />
        <SummaryCard label="Submitted" value={summaryQuery.data?.submitted ?? 0} />
        <SummaryCard label="Approved" value={summaryQuery.data?.approved ?? 0} />
        <SummaryCard label="Rejected" value={summaryQuery.data?.rejected ?? 0} />
        <SummaryCard label="Total Logged Hours" value={summaryQuery.data?.total_logged_hours ?? "0.00"} />
      </div>
      <div className="mt-6 max-w-xs">
        <label className="block text-sm font-medium" htmlFor="timesheet-status-filter">
          Status
          <select
            className="mt-2 h-10 w-full rounded-md border bg-background px-3"
            id="timesheet-status-filter"
            onChange={(event) => setStatusFilter(event.target.value as TimesheetStatus | "")}
            value={statusFilter}
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
      </div>
      <div className="mt-6 overflow-x-auto rounded-md border bg-card">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead className="border-b bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Week</th>
              <th className="px-4 py-3 font-medium">Total Hours</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Approved/Rejected By</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {timesheetsQuery.isLoading ? (
              <tr>
                <td colSpan={6}>
                  <LoadingState className="m-0 min-h-32 border-0" title="Loading timesheets..." />
                </td>
              </tr>
            ) : null}
            {!timesheetsQuery.isLoading ? (timesheetsQuery.data ?? []).map((timesheet) => (
              <tr className="border-b last:border-0" key={timesheet.id}>
                <td className="px-4 py-3">
                  {timesheet.employee.first_name} {timesheet.employee.last_name}
                </td>
                <td className="px-4 py-3">{formatRange(timesheet.week_start)}</td>
                <td className="px-4 py-3">{formatHours(Number(timesheet.weekly_total))}</td>
                <td className="px-4 py-3"><StatusBadge status={timesheet.status} /></td>
                <td className="px-4 py-3">
                  {timesheet.approved_by_name ?? timesheet.rejected_by_name ?? "-"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button onClick={() => setSelectedTimesheet(timesheet)} size="sm" type="button" variant="outline">View</Button>
                    {timesheet.status === "submitted" ? (
                      <>
                        <Button onClick={() => handleApprove(timesheet)} size="sm" type="button">Approve</Button>
                        <Button onClick={() => setRejectingTimesheet(timesheet)} size="sm" type="button" variant="outline">Reject</Button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            )) : null}
            {!timesheetsQuery.isLoading && (timesheetsQuery.data ?? []).length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    className="m-0 min-h-32 border-0"
                    description="Submitted employee timesheets will appear here for review."
                    title="No timesheets found for this week."
                  />
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <TimesheetDetailsModal onClose={() => setSelectedTimesheet(null)} timesheet={selectedTimesheet} />
      <Dialog
        onClose={() => setRejectingTimesheet(null)}
        open={Boolean(rejectingTimesheet)}
        title="Reject Timesheet"
      >
        <div className="mt-4 space-y-4">
          <label className="block text-sm font-medium" htmlFor="reject-reason">
            Reason
            <textarea
              className="mt-2 min-h-24 w-full rounded-md border bg-background px-3 py-2"
              id="reject-reason"
              onChange={(event) => setReason(event.target.value)}
              value={reason}
            />
          </label>
          <div className="flex justify-end gap-3">
            <Button onClick={() => setRejectingTimesheet(null)} type="button" variant="outline">Cancel</Button>
            <Button disabled={!reason.trim() || rejectTimesheet.isPending} onClick={handleReject} type="button">
              {rejectTimesheet.isPending ? "Rejecting..." : "Reject Timesheet"}
            </Button>
          </div>
        </div>
      </Dialog>
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function TimesheetHeader({
  description,
  onWeekChange,
  weekStart,
}: {
  description: string;
  onWeekChange: (value: string) => void;
  weekStart: string;
}) {
  const currentWeek = formatDateInput(getCurrentWeekStart());
  const isCurrentWeek = weekStart >= currentWeek;
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold">Timesheet</h2>
        <p className="mt-2 text-muted-foreground">{description}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            aria-label="Previous week"
            className="h-12 w-12"
            onClick={() => onWeekChange(shiftWeek(weekStart, -1))}
            type="button"
            variant="outline"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-12 items-center gap-3 rounded-md border bg-background px-4 text-sm font-semibold shadow-sm">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            {formatRange(weekStart)}
          </div>
          <Button
            aria-label="Next week"
            className="h-12 w-12"
            disabled={isCurrentWeek}
            onClick={() => onWeekChange(shiftWeek(weekStart, 1))}
            type="button"
            variant="outline"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function TimesheetDetailsModal({ timesheet, onClose }: { timesheet: Timesheet | null; onClose: () => void }) {
  return (
    <Dialog className="max-w-3xl" onClose={onClose} open={Boolean(timesheet)} title="Timesheet Details">
      {timesheet ? (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">{timesheet.employee.first_name} {timesheet.employee.last_name}</p>
            <StatusBadge status={timesheet.status} />
          </div>
          {getWeekDates(timesheet.week_start).map((workDate, index) => {
            const dayEntries = timesheet.entries.filter((entry) => entry.work_date === workDate);
            return (
              <div className="rounded-md border p-3" key={workDate}>
                <div className="flex justify-between text-sm font-medium">
                  <span>{dayNames[index]} - {formatDisplayDate(workDate)}</span>
                  <span>{timesheet.daily_totals[workDate] ?? "0.00"} hrs</span>
                </div>
                <div className="mt-2 space-y-2">
                  {dayEntries.map((entry) => (
                    <div className="grid gap-2 text-sm md:grid-cols-[1fr_80px_1fr]" key={entry.id}>
                      <span>{entry.project_name}</span>
                      <span>{entry.hours} hrs</span>
                      <span className="text-muted-foreground">{entry.notes || "-"}</span>
                    </div>
                  ))}
                  {dayEntries.length === 0 ? <p className="text-sm text-muted-foreground">No entries.</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </Dialog>
  );
}

function StatusBadge({ status }: { status: TimesheetStatus }) {
  const styles: Record<TimesheetStatus, string> = {
    draft: "border-slate-200 bg-slate-50 text-slate-700",
    submitted: "border-blue-200 bg-blue-50 text-blue-700",
    approved: "border-green-200 bg-green-50 text-green-700",
    rejected: "border-red-200 bg-red-50 text-red-700",
  };
  return <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${styles[status]}`}>{statusLabels[status]}</span>;
}

function getCurrentWeekStart() {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getWeekDates(weekStart: string) {
  const start = parseDate(weekStart);
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(start);
    next.setDate(start.getDate() + index);
    return formatDateInput(next);
  });
}

function shiftWeek(weekStart: string, amount: number) {
  const date = parseDate(weekStart);
  date.setDate(date.getDate() + amount * 7);
  return formatDateInput(date);
}

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function formatDateInput(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatRange(weekStart: string) {
  const dates = getWeekDates(weekStart);
  return `${formatDisplayDate(dates[0])} - ${formatDisplayDate(dates[6])}`;
}

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(parseDate(value));
}

function formatDayHeader(value: string) {
  const date = parseDate(value);
  return {
    weekday: new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date),
    date: new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" }).format(date),
  };
}

function calculateDailyTotals(entries: TimesheetEntryInput[]) {
  return entries.reduce<Record<string, number>>((totals, entry) => {
    if (!isPersistableEntry(entry)) {
      return totals;
    }
    totals[entry.work_date] = (totals[entry.work_date] ?? 0) + toNumber(entry.hours);
    return totals;
  }, {});
}

function isPersistableEntry(entry: TimesheetEntryInput) {
  return Boolean(entry.project_id && toNumber(entry.hours) > 0);
}

function hasBlockingValidation(entries: TimesheetEntryInput[], weekDates: string[]) {
  const totals = calculateDailyTotals(entries);
  if (weekDates.some((date) => (totals[date] ?? 0) > 8)) {
    return true;
  }
  const seenProjectDates = new Set<string>();
  for (const entry of entries.filter(isPersistableEntry)) {
    if (!entry.project_id || toNumber(entry.hours) <= 0) {
      return true;
    }
    const key = `${entry.work_date}:${entry.project_id}`;
    if (seenProjectDates.has(key)) {
      return true;
    }
    seenProjectDates.add(key);
  }
  return false;
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatHours(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
