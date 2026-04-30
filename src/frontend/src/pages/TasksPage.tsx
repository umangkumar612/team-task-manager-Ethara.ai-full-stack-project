import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Principal } from "@icp-sdk/core/principal";
import { useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "../components/ConfirmDialog";
import { TaskStatusBadgeFromTask } from "../components/StatusBadge";
import { useAuth } from "../hooks/use-auth";
import {
  useCreateTask,
  useDeleteTask,
  useProject,
  useProjectTasks,
  useUpdateTask,
  useUpdateTaskStatus,
} from "../hooks/use-backend";
import { ProjectRole, TaskStatus } from "../types";
import type { ProjectId, TaskId, TaskView, UserId } from "../types";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateInput(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toISOString().split("T")[0];
}

function parseDateToBigInt(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime()) * 1_000_000n;
}

// ── Types ──────────────────────────────────────────────────────────────────

interface TaskFormValues {
  title: string;
  description: string;
  dueDate: string;
  assignedTo: string; // principal string or ""
}

// ── Task Form Modal ────────────────────────────────────────────────────────

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  initial?: TaskFormValues & { taskId?: TaskId };
  projectId: ProjectId;
  memberOptions: Array<{ userId: string; displayLabel: string }>;
  loading: boolean;
  onSubmit: (values: TaskFormValues) => void;
  mode: "create" | "edit";
}

function TaskFormModal({
  open,
  onClose,
  initial,
  memberOptions,
  loading,
  onSubmit,
  mode,
}: TaskFormModalProps) {
  const [form, setForm] = useState<TaskFormValues>(
    initial ?? { title: "", description: "", dueDate: "", assignedTo: "" },
  );

  // Reset form on open/close transitions
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
      if (mode === "create")
        setForm({ title: "", description: "", dueDate: "", assignedTo: "" });
    }
  };

  const set = (k: keyof TaskFormValues, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const isValid = form.title.trim().length > 0 && form.dueDate.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md" data-ocid="task_form_modal.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            {mode === "create" ? "Create New Task" : "Edit Task"}
          </DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4 pt-1"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isValid) return;
            onSubmit(form);
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title *</Label>
            <Input
              id="task-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Enter task title..."
              maxLength={120}
              autoFocus
              data-ocid="task_form_modal.title.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional details about this task..."
              rows={3}
              data-ocid="task_form_modal.description.textarea"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-due">Due Date *</Label>
            <Input
              id="task-due"
              type="date"
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
              data-ocid="task_form_modal.due_date.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-assignee">Assign To</Label>
            <Select
              value={form.assignedTo}
              onValueChange={(v) => set("assignedTo", v)}
            >
              <SelectTrigger
                id="task-assignee"
                data-ocid="task_form_modal.assignee.select"
              >
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {memberOptions.map((m) => (
                  <SelectItem key={m.userId} value={m.userId}>
                    {m.displayLabel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="task_form_modal.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || loading}
              data-ocid="task_form_modal.submit_button"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : mode === "create" ? (
                "Create Task"
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Task Row ───────────────────────────────────────────────────────────────

interface TaskRowProps {
  task: TaskView;
  projectId: ProjectId;
  idx: number;
  isAdmin: boolean;
  currentPrincipalId: string | null;
  memberLookup: Map<string, string>;
}

function TaskRow({
  task,
  projectId,
  idx,
  isAdmin,
  currentPrincipalId,
  memberLookup,
}: TaskRowProps) {
  const { mutate: updateStatus, isPending: updatingStatus } =
    useUpdateTaskStatus();
  const { mutate: deleteTask, isPending: deleting } = useDeleteTask();
  const { mutate: updateTask, isPending: updating } = useUpdateTask();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const assigneePrincipal = task.assignedTo?.toString() ?? null;
  const assigneeLabel = assigneePrincipal
    ? (memberLookup.get(assigneePrincipal) ??
      shortenPrincipal(assigneePrincipal))
    : null;

  const isAssignedToMe = assigneePrincipal === currentPrincipalId;
  const canChangeStatus = isAdmin || isAssignedToMe;

  const handleStatusChange = (status: TaskStatus) => {
    updateStatus(
      { id: task.id, status, projectId },
      {
        onSuccess: () => toast.success("Status updated"),
        onError: () => toast.error("Failed to update status"),
      },
    );
  };

  const handleUpdate = (values: TaskFormValues) => {
    const assignedTo: UserId | null = values.assignedTo
      ? Principal.fromText(values.assignedTo)
      : null;
    updateTask(
      {
        id: task.id,
        projectId,
        title: values.title,
        description: values.description,
        dueDate: parseDateToBigInt(values.dueDate),
        assignedTo,
      },
      {
        onSuccess: () => {
          toast.success("Task updated");
          setEditOpen(false);
        },
        onError: () => toast.error("Failed to update task"),
      },
    );
  };

  const handleDelete = () => {
    deleteTask(
      { id: task.id, projectId },
      {
        onSuccess: () => {
          toast.success("Task deleted");
          setDeleteOpen(false);
        },
        onError: () => toast.error("Failed to delete task"),
      },
    );
  };

  const statusIcon =
    task.status === TaskStatus.completed ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
    ) : task.isOverdue ? (
      <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
    ) : task.status === TaskStatus.inProgress ? (
      <Clock3 className="h-4 w-4 text-blue-500 flex-shrink-0" />
    ) : (
      <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    );

  return (
    <>
      <div
        className="group grid grid-cols-[1fr_auto] gap-x-4 items-start px-4 py-3.5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
        data-ocid={`tasks.item.${idx}`}
      >
        {/* Left: icon + title + meta */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5">{statusIcon}</div>
          <div className="min-w-0 flex-1">
            <p
              className={`text-sm font-medium truncate ${
                task.status === TaskStatus.completed
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {/* Status badge */}
              <TaskStatusBadgeFromTask task={task} />

              {/* Due date */}
              <span
                className={`inline-flex items-center gap-1 text-xs ${
                  task.isOverdue && task.status !== TaskStatus.completed
                    ? "text-red-600 font-medium"
                    : "text-muted-foreground"
                }`}
              >
                <CalendarDays className="h-3 w-3" />
                {formatDate(task.dueDate)}
                {task.isOverdue && task.status !== TaskStatus.completed && (
                  <span className="font-semibold">· Overdue</span>
                )}
              </span>

              {/* Assignee */}
              {assigneeLabel && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  {assigneeLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: status selector + actions */}
        <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
          {canChangeStatus && (
            <Select
              value={task.status}
              onValueChange={(v) => handleStatusChange(v as TaskStatus)}
              disabled={updatingStatus}
            >
              <SelectTrigger
                className="h-7 w-[130px] text-xs"
                data-ocid={`tasks.item.${idx}.status.select`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TaskStatus.toDo}>To Do</SelectItem>
                <SelectItem value={TaskStatus.inProgress}>
                  In Progress
                </SelectItem>
                <SelectItem value={TaskStatus.completed}>Completed</SelectItem>
              </SelectContent>
            </Select>
          )}

          {isAdmin && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setEditOpen(true)}
                aria-label="Edit task"
                data-ocid={`tasks.item.${idx}.edit_button`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteOpen(true)}
                aria-label="Delete task"
                disabled={deleting}
                data-ocid={`tasks.item.${idx}.delete_button`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {isAdmin && editOpen && (
        <TaskFormModal
          open
          onClose={() => setEditOpen(false)}
          initial={{
            title: task.title,
            description: task.description,
            dueDate: formatDateInput(task.dueDate),
            assignedTo: task.assignedTo?.toString() ?? "",
          }}
          projectId={task.projectId}
          memberOptions={Array.from(memberLookup.entries()).map(
            ([userId, label]) => ({ userId, displayLabel: label }),
          )}
          loading={updating}
          onSubmit={handleUpdate}
          mode="edit"
        />
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Task"
        description={`Delete "${task.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}

// ── Utils ──────────────────────────────────────────────────────────────────

function shortenPrincipal(p: string): string {
  if (p.length <= 16) return p;
  return `${p.slice(0, 8)}…${p.slice(-5)}`;
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function TasksPage() {
  const { projectId } = useParams({ from: "/projects/$projectId/tasks" });
  const projectIdBig = BigInt(projectId);
  const { currentPrincipalId } = useAuth();

  const { data: project, isLoading: projectLoading } = useProject(projectIdBig);
  const { data: allTasks, isLoading: tasksLoading } =
    useProjectTasks(projectIdBig);
  const { mutate: createTask, isPending: creating } = useCreateTask();

  const [createOpen, setCreateOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    "all" | TaskStatus | "overdue"
  >("all");

  // Determine if current user is admin of this project
  const callerMember = project?.members.find(
    (m) => m.userId.toString() === currentPrincipalId,
  );
  const isAdmin = callerMember?.role === ProjectRole.admin;

  // Build member lookup map: principalId → display label
  const memberLookup = new Map<string, string>(
    (project?.members ?? []).map((m) => [
      m.userId.toString(),
      shortenPrincipal(m.userId.toString()),
    ]),
  );

  const memberOptions = (project?.members ?? []).map((m) => ({
    userId: m.userId.toString(),
    displayLabel: shortenPrincipal(m.userId.toString()),
  }));

  // Filter tasks: non-admins see only their assigned tasks
  const visibleTasks = (allTasks ?? []).filter((t) => {
    if (!isAdmin) {
      return t.assignedTo?.toString() === currentPrincipalId;
    }
    return true;
  });

  const displayedTasks =
    filterStatus === "all"
      ? visibleTasks
      : filterStatus === "overdue"
        ? visibleTasks.filter(
            (t) => t.isOverdue && t.status !== TaskStatus.completed,
          )
        : visibleTasks.filter((t) => t.status === filterStatus);

  const overdueTasks = visibleTasks.filter(
    (t) => t.isOverdue && t.status !== TaskStatus.completed,
  );

  const handleCreate = (values: TaskFormValues) => {
    const assignedTo: UserId | null = values.assignedTo
      ? Principal.fromText(values.assignedTo)
      : null;
    createTask(
      {
        projectId: projectIdBig,
        title: values.title,
        description: values.description,
        dueDate: parseDateToBigInt(values.dueDate),
        assignedTo,
      },
      {
        onSuccess: () => {
          toast.success("Task created successfully");
          setCreateOpen(false);
        },
        onError: () => toast.error("Failed to create task"),
      },
    );
  };

  // ── Loading state ──────────────────────────────────────────────────────

  if (projectLoading || tasksLoading) {
    return (
      <div className="space-y-3" data-ocid="tasks_page.loading_state">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!project) {
    return (
      <div
        className="text-center py-12 text-muted-foreground"
        data-ocid="tasks_page.error_state"
      >
        Project not found.
      </div>
    );
  }

  // ── Stats bar ──────────────────────────────────────────────────────────

  const totalCount = visibleTasks.length;
  const completedCount = visibleTasks.filter(
    (t) => t.status === TaskStatus.completed,
  ).length;
  const inProgressCount = visibleTasks.filter(
    (t) => t.status === TaskStatus.inProgress,
  ).length;
  const overdueCount = overdueTasks.length;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5" data-ocid="tasks_page.page">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-md">Tasks</h2>
          <p className="text-caption mt-0.5">
            {isAdmin
              ? `All tasks for ${project.name}`
              : `Your assigned tasks in ${project.name}`}
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setCreateOpen(true)}
            data-ocid="tasks_page.create_task.button"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Task
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total",
            value: totalCount,
            icon: Circle,
            color: "text-muted-foreground",
            filter: "all" as const,
          },
          {
            label: "In Progress",
            value: inProgressCount,
            icon: Clock3,
            color: "text-blue-500",
            filter: TaskStatus.inProgress,
          },
          {
            label: "Completed",
            value: completedCount,
            icon: CheckCircle2,
            color: "text-emerald-500",
            filter: TaskStatus.completed,
          },
          {
            label: "Overdue",
            value: overdueCount,
            icon: AlertTriangle,
            color: "text-red-500",
            filter: "overdue" as const,
          },
        ].map(({ label, value, icon: Icon, color, filter }) => (
          <button
            type="button"
            key={label}
            onClick={() => setFilterStatus(label === "Total" ? "all" : filter)}
            className={`text-left rounded-lg border p-3 transition-colors hover:bg-muted/50 ${
              filterStatus === (label === "Total" ? "all" : filter)
                ? "border-primary bg-primary/5"
                : "border-border bg-card"
            }`}
            data-ocid={`tasks_page.stat.${label.toLowerCase().replace(" ", "_")}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-xs text-muted-foreground font-medium">
                {label}
              </span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">
              {value}
            </p>
          </button>
        ))}
      </div>

      {/* Filter tabs */}
      <div
        className="flex items-center gap-1.5 flex-wrap"
        data-ocid="tasks_page.filter.tab"
      >
        {(
          [
            { label: "All", value: "all" },
            { label: "To Do", value: TaskStatus.toDo },
            { label: "In Progress", value: TaskStatus.inProgress },
            { label: "Completed", value: TaskStatus.completed },
          ] as const
        ).map(({ label, value }) => (
          <button
            type="button"
            key={value}
            onClick={() => setFilterStatus(value)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filterStatus === value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
            data-ocid={`tasks_page.filter.${value}`}
          >
            {label}
            <span className="ml-1.5 opacity-70">
              {value === "all"
                ? visibleTasks.length
                : visibleTasks.filter((t) => t.status === value).length}
            </span>
          </button>
        ))}
      </div>

      {/* Task list */}
      <Card className="card-flat overflow-hidden">
        {displayedTasks.length === 0 ? (
          <CardContent
            className="flex flex-col items-center gap-3 py-14 text-center"
            data-ocid="tasks_page.empty_state"
          >
            <div className="rounded-full bg-muted p-4">
              <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">
                No tasks found
              </p>
              <p className="text-caption mt-1">
                {filterStatus !== "all"
                  ? "Try selecting a different filter."
                  : isAdmin
                    ? "Create a task to get started."
                    : "No tasks have been assigned to you yet."}
              </p>
            </div>
            {isAdmin && filterStatus === "all" && (
              <Button
                size="sm"
                onClick={() => setCreateOpen(true)}
                data-ocid="tasks_page.empty_create.button"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Create First Task
              </Button>
            )}
          </CardContent>
        ) : (
          <CardContent className="p-0">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto] gap-x-4 px-4 py-2 border-b border-border bg-muted/30">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Task
              </span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Actions
              </span>
            </div>
            {displayedTasks.map((task, idx) => (
              <TaskRow
                key={task.id.toString()}
                task={task}
                projectId={projectIdBig}
                idx={idx + 1}
                isAdmin={isAdmin ?? false}
                currentPrincipalId={currentPrincipalId}
                memberLookup={memberLookup}
              />
            ))}
          </CardContent>
        )}
      </Card>

      {/* Create Task Modal */}
      {isAdmin && (
        <TaskFormModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          projectId={projectIdBig}
          memberOptions={memberOptions}
          loading={creating}
          onSubmit={handleCreate}
          mode="create"
        />
      )}
    </div>
  );
}
