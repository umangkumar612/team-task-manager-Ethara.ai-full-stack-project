import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Pencil,
  Plus,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "../components/ConfirmDialog";
import { RoleBadge, TaskStatusBadgeFromTask } from "../components/StatusBadge";
import { useAuth } from "../hooks/use-auth";
import {
  useAddProjectMember,
  useCreateTask,
  useDeleteTask,
  useProject,
  useProjectTasks,
  useRemoveProjectMember,
  useUpdateProjectMemberRole,
  useUpdateTask,
  useUpdateTaskStatus,
} from "../hooks/use-backend";
import { ProjectRole, TaskStatus } from "../types";
import type { ProjectMember, TaskId, TaskView, UserId } from "../types";

// ── Helpers ─────────────────────────────────────────────────────────────────

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

function principalShort(id: UserId): string {
  const s = id.toString();
  if (s.length <= 14) return s;
  return `${s.slice(0, 7)}…${s.slice(-5)}`;
}

function principalInitials(id: UserId): string {
  return id.toString().slice(0, 2).toUpperCase();
}

// ── Task types & components ──────────────────────────────────────────────────

interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
}

function TaskModal({
  open,
  onClose,
  initial,
  onSubmit,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  initial?: TaskFormData;
  onSubmit: (data: TaskFormData) => void;
  loading: boolean;
}) {
  const isEdit = !!initial;
  const [form, setForm] = useState<TaskFormData>(
    initial ?? {
      title: "",
      description: "",
      dueDate: "",
      status: TaskStatus.toDo,
    },
  );
  const update = (k: keyof TaskFormData, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-ocid="task_modal.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEdit ? "Edit Task" : "New Task"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.title.trim() || !form.dueDate) return;
            onSubmit(form);
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Task title..."
              maxLength={100}
              data-ocid="task_modal.title.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Optional description..."
              rows={3}
              data-ocid="task_modal.description.textarea"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Due Date</Label>
            <Input
              type="date"
              value={form.dueDate}
              onChange={(e) => update("dueDate", e.target.value)}
              data-ocid="task_modal.due_date.input"
            />
          </div>
          {isEdit && (
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => update("status", v)}
              >
                <SelectTrigger data-ocid="task_modal.status.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskStatus.toDo}>To Do</SelectItem>
                  <SelectItem value={TaskStatus.inProgress}>
                    In Progress
                  </SelectItem>
                  <SelectItem value={TaskStatus.completed}>
                    Completed
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="task_modal.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!form.title.trim() || !form.dueDate || loading}
              data-ocid="task_modal.submit_button"
            >
              {loading ? "Saving..." : isEdit ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TaskRow({
  task,
  projectId,
  idx,
}: { task: TaskView; projectId: bigint; idx: number }) {
  const { mutate: updateStatus } = useUpdateTaskStatus();
  const { mutate: deleteTask } = useDeleteTask();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { mutate: updateTask, isPending: updating } = useUpdateTask();

  const handleStatusChange = (status: TaskStatus) => {
    updateStatus(
      { id: task.id, status, projectId },
      {
        onSuccess: () => toast.success("Status updated!"),
        onError: () => toast.error("Failed to update status."),
      },
    );
  };

  const handleUpdate = (data: TaskFormData) => {
    const dueDate = BigInt(new Date(data.dueDate).getTime()) * 1_000_000n;
    updateTask(
      {
        id: task.id,
        projectId,
        title: data.title,
        description: data.description,
        dueDate,
        assignedTo: task.assignedTo ?? null,
      },
      {
        onSuccess: () => {
          toast.success("Task updated!");
          setEditOpen(false);
        },
        onError: () => toast.error("Failed to update task."),
      },
    );
  };

  const handleDelete = () => {
    deleteTask(
      { id: task.id, projectId },
      {
        onSuccess: () => {
          toast.success("Task deleted.");
          setDeleteOpen(false);
        },
        onError: () => toast.error("Failed to delete task."),
      },
    );
  };

  return (
    <>
      <div
        className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors group"
        data-ocid={`tasks.item.${idx}`}
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {task.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {task.isOverdue && task.status !== TaskStatus.completed && (
            <span className="flex items-center gap-1 text-xs text-destructive font-medium">
              <AlertTriangle className="h-3 w-3" />
              Overdue
            </span>
          )}
          <TaskStatusBadgeFromTask task={task} />
          <span className="text-xs text-muted-foreground hidden sm:block">
            {formatDate(task.dueDate)}
          </span>
          <Select
            value={task.status}
            onValueChange={(v) => handleStatusChange(v as TaskStatus)}
          >
            <SelectTrigger
              className="h-7 w-32 text-xs"
              data-ocid={`tasks.item.${idx}.status.select`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TaskStatus.toDo}>To Do</SelectItem>
              <SelectItem value={TaskStatus.inProgress}>In Progress</SelectItem>
              <SelectItem value={TaskStatus.completed}>Completed</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setEditOpen(true)}
              data-ocid={`tasks.item.${idx}.edit_button`}
              aria-label="Edit task"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteOpen(true)}
              data-ocid={`tasks.item.${idx}.delete_button`}
              aria-label="Delete task"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {editOpen && (
        <TaskModal
          open
          onClose={() => setEditOpen(false)}
          initial={{
            title: task.title,
            description: task.description,
            dueDate: formatDateInput(task.dueDate),
            status: task.status,
          }}
          onSubmit={handleUpdate}
          loading={updating}
        />
      )}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Task"
        description="Are you sure you want to delete this task? This cannot be undone."
        confirmLabel="Delete Task"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}

// ── Members tab ──────────────────────────────────────────────────────────────

function AddMemberForm({ projectId }: { projectId: bigint }) {
  const [principalId, setPrincipalId] = useState("");
  const [role, setRole] = useState<ProjectRole>(ProjectRole.member);
  const { mutate: addMember, isPending } = useAddProjectMember();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = principalId.trim();
    if (!trimmed) return;

    // Dynamically import Principal to parse the input
    import("@icp-sdk/core/principal").then(({ Principal }) => {
      try {
        const userId = Principal.fromText(trimmed);
        addMember(
          { projectId, userId, role },
          {
            onSuccess: (ok) => {
              if (ok) {
                toast.success("Member added successfully.");
                setPrincipalId("");
                setRole(ProjectRole.member);
              } else {
                toast.error(
                  "Could not add member. They may already be a member.",
                );
              }
            },
            onError: () => toast.error("Failed to add member."),
          },
        );
      } catch {
        toast.error("Invalid principal ID. Please check and try again.");
      }
    });
  };

  return (
    <div className="border-t border-border px-4 py-4 bg-muted/20">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <UserPlus className="h-3.5 w-3.5" /> Add Member
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <Input
          className="flex-1 h-8 text-sm"
          placeholder="Principal ID (e.g. aaaaa-aa)"
          value={principalId}
          onChange={(e) => setPrincipalId(e.target.value)}
          data-ocid="members.add.principal.input"
        />
        <Select value={role} onValueChange={(v) => setRole(v as ProjectRole)}>
          <SelectTrigger
            className="h-8 w-32 text-sm"
            data-ocid="members.add.role.select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ProjectRole.member}>Member</SelectItem>
            <SelectItem value={ProjectRole.admin}>Admin</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="submit"
          size="sm"
          className="h-8"
          disabled={!principalId.trim() || isPending}
          data-ocid="members.add.submit_button"
        >
          {isPending ? "Adding…" : "Add"}
        </Button>
      </form>
    </div>
  );
}

function MemberRow({
  member,
  projectId,
  idx,
  isAdmin,
  isSelf,
}: {
  member: ProjectMember;
  projectId: bigint;
  idx: number;
  isAdmin: boolean;
  isSelf: boolean;
}) {
  const [removeOpen, setRemoveOpen] = useState(false);
  const { mutate: updateRole, isPending: updatingRole } =
    useUpdateProjectMemberRole();
  const { mutate: removeMember, isPending: removing } =
    useRemoveProjectMember();

  const handleRoleChange = (newRole: ProjectRole) => {
    updateRole(
      { projectId, userId: member.userId, role: newRole },
      {
        onSuccess: (ok) => {
          if (ok) toast.success("Role updated.");
          else toast.error("Could not update role.");
        },
        onError: () => toast.error("Failed to update role."),
      },
    );
  };

  const handleRemove = () => {
    removeMember(
      { projectId, userId: member.userId },
      {
        onSuccess: (ok) => {
          if (ok) {
            toast.success("Member removed.");
            setRemoveOpen(false);
          } else toast.error("Could not remove member.");
        },
        onError: () => toast.error("Failed to remove member."),
      },
    );
  };

  return (
    <>
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
        data-ocid={`members.item.${idx}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">
              {principalInitials(member.userId)}
            </span>
          </div>
          <div className="min-w-0">
            <p
              className="text-xs font-mono text-foreground truncate max-w-[180px] sm:max-w-[260px]"
              title={member.userId.toString()}
            >
              {principalShort(member.userId)}
            </p>
            {isSelf && <p className="text-xs text-muted-foreground">You</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isAdmin && !isSelf ? (
            <Select
              value={member.role}
              onValueChange={(v) => handleRoleChange(v as ProjectRole)}
              disabled={updatingRole}
            >
              <SelectTrigger
                className="h-7 w-28 text-xs"
                data-ocid={`members.item.${idx}.role.select`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ProjectRole.member}>Member</SelectItem>
                <SelectItem value={ProjectRole.admin}>Admin</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <RoleBadge role={member.role} />
          )}

          {isAdmin && !isSelf && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setRemoveOpen(true)}
              disabled={removing}
              data-ocid={`members.item.${idx}.delete_button`}
              aria-label="Remove member"
            >
              <UserMinus className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={removeOpen}
        title="Remove Member"
        description={`Remove ${principalShort(member.userId)} from this project? They will lose access immediately.`}
        confirmLabel="Remove"
        destructive
        onConfirm={handleRemove}
        onCancel={() => setRemoveOpen(false)}
      />
    </>
  );
}

function MembersTab({
  members,
  projectId,
  isAdmin,
  currentPrincipalId,
}: {
  members: ProjectMember[];
  projectId: bigint;
  isAdmin: boolean;
  currentPrincipalId: string | null;
}) {
  return (
    <Card className="card-flat mt-3" data-ocid="members.panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Users className="h-4 w-4" /> Team Members ({members.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {members.length === 0 ? (
          <div
            className="p-10 flex flex-col items-center gap-3 text-center"
            data-ocid="members.empty_state"
          >
            <div className="rounded-full bg-muted p-3">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No members yet</p>
            <p className="text-caption">
              Add a member below to collaborate on this project.
            </p>
          </div>
        ) : (
          members.map((member, idx) => (
            <MemberRow
              key={member.userId.toString()}
              member={member}
              projectId={projectId}
              idx={idx + 1}
              isAdmin={isAdmin}
              isSelf={currentPrincipalId === member.userId.toString()}
            />
          ))
        )}
        {isAdmin && <AddMemberForm projectId={projectId} />}
      </CardContent>
    </Card>
  );
}

// ── Tasks tab helper ─────────────────────────────────────────────────────────

function TasksTab({
  tasks,
  tasksLoading,
  filter,
  projectId,
  onCreateClick,
}: {
  tasks: TaskView[] | undefined;
  tasksLoading: boolean;
  filter: "all" | "active" | "completed";
  projectId: bigint;
  onCreateClick: () => void;
}) {
  const filtered = (() => {
    if (!tasks) return [];
    if (filter === "completed")
      return tasks.filter((t) => t.status === TaskStatus.completed);
    if (filter === "active")
      return tasks.filter((t) => t.status !== TaskStatus.completed);
    return tasks;
  })();

  return (
    <Card className="card-flat mt-3">
      {tasksLoading ? (
        <CardContent className="p-4 space-y-3" data-ocid="tasks.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      ) : filtered.length === 0 ? (
        <CardContent
          className="p-10 flex flex-col items-center gap-3 text-center"
          data-ocid="tasks.empty_state"
        >
          <div className="rounded-full bg-muted p-3">
            <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">No tasks here</p>
          <p className="text-caption">
            {filter === "completed"
              ? "No completed tasks yet."
              : "Create a task to get started."}
          </p>
          {filter !== "completed" && (
            <Button
              size="sm"
              onClick={onCreateClick}
              data-ocid="tasks.create.button"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add Task
            </Button>
          )}
        </CardContent>
      ) : (
        <CardContent className="p-0">
          {filtered.map((task, idx) => (
            <TaskRow
              key={task.id.toString()}
              task={task}
              projectId={projectId}
              idx={idx + 1}
            />
          ))}
        </CardContent>
      )}
    </Card>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const { projectId } = useParams({ from: "/projects/$projectId" });
  const projectIdBig = BigInt(projectId);
  const { data: project, isLoading: projectLoading } = useProject(projectIdBig);
  const { data: tasks, isLoading: tasksLoading } =
    useProjectTasks(projectIdBig);
  const { mutate: createTask, isPending: creating } = useCreateTask();
  const { currentPrincipalId } = useAuth();

  const [createOpen, setCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");

  const isAdmin =
    project?.members.some(
      (m) =>
        m.userId.toString() === currentPrincipalId &&
        m.role === ProjectRole.admin,
    ) ?? false;

  const handleCreate = (data: TaskFormData) => {
    const dueDate = BigInt(new Date(data.dueDate).getTime()) * 1_000_000n;
    createTask(
      {
        projectId: projectIdBig,
        title: data.title,
        description: data.description,
        dueDate,
        assignedTo: null,
      },
      {
        onSuccess: () => {
          toast.success("Task created!");
          setCreateOpen(false);
        },
        onError: () => toast.error("Failed to create task."),
      },
    );
  };

  const completedCount =
    tasks?.filter((t) => t.status === TaskStatus.completed).length ?? 0;
  const totalCount = tasks?.length ?? 0;
  const overdueCount =
    tasks?.filter((t) => t.isOverdue && t.status !== TaskStatus.completed)
      .length ?? 0;

  if (projectLoading) {
    return (
      <div className="space-y-4 p-1" data-ocid="project_detail.loading_state">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="space-y-2 mt-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20" data-ocid="project_detail.error_state">
        <div className="rounded-full bg-muted p-4 inline-flex mb-4">
          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="font-semibold text-foreground mb-1">Project not found</p>
        <p className="text-caption mb-5">
          This project may have been deleted or you don't have access.
        </p>
        <Link to="/projects">
          <Button variant="outline" data-ocid="project_detail.back.link">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5" data-ocid="project_detail.page">
      {/* Breadcrumb */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          data-ocid="project_detail.back.link"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Projects
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-headline-lg">{project.name}</h2>
            {project.description && (
              <p className="text-body-sm text-muted-foreground mt-0.5 max-w-xl">
                {project.description}
              </p>
            )}
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            data-ocid="project_detail.new_task.button"
          >
            <Plus className="h-4 w-4 mr-1.5" /> New Task
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          {completedCount} completed
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-amber-500" />
          {totalCount - completedCount} remaining
        </span>
        {overdueCount > 0 && (
          <span className="flex items-center gap-1.5 text-destructive font-medium">
            <AlertTriangle className="h-4 w-4" />
            {overdueCount} overdue
          </span>
        )}
        <span className="flex items-center gap-1.5 ml-auto">
          <Users className="h-4 w-4" />
          {project.members.length}{" "}
          {project.members.length === 1 ? "member" : "members"}
        </span>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tasks" data-ocid="project_detail.tasks.tab">
            All Tasks
            {totalCount > 0 && (
              <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                {totalCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="active" data-ocid="project_detail.active.tab">
            Active
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            data-ocid="project_detail.completed.tab"
          >
            Completed
          </TabsTrigger>
          <TabsTrigger value="members" data-ocid="project_detail.members.tab">
            Members
            <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
              {project.members.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <TasksTab
            tasks={tasks}
            tasksLoading={tasksLoading}
            filter="all"
            projectId={projectIdBig}
            onCreateClick={() => setCreateOpen(true)}
          />
        </TabsContent>
        <TabsContent value="active">
          <TasksTab
            tasks={tasks}
            tasksLoading={tasksLoading}
            filter="active"
            projectId={projectIdBig}
            onCreateClick={() => setCreateOpen(true)}
          />
        </TabsContent>
        <TabsContent value="completed">
          <TasksTab
            tasks={tasks}
            tasksLoading={tasksLoading}
            filter="completed"
            projectId={projectIdBig}
            onCreateClick={() => setCreateOpen(true)}
          />
        </TabsContent>
        <TabsContent value="members">
          <MembersTab
            members={project.members}
            projectId={projectIdBig}
            isAdmin={isAdmin}
            currentPrincipalId={currentPrincipalId}
          />
        </TabsContent>
      </Tabs>

      {/* Create Task Modal */}
      <TaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        loading={creating}
      />
    </div>
  );
}
