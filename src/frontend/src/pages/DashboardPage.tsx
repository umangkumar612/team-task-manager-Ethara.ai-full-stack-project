import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FolderKanban,
  ListTodo,
  Plus,
} from "lucide-react";
import { TaskStatusBadgeFromTask } from "../components/StatusBadge";
import {
  useCallerUserProfile,
  useDashboard,
  useMyProjects,
  useProjectTasks,
} from "../hooks/use-backend";
import type { ProjectId, ProjectView, TaskView } from "../types";

// ── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: bigint | undefined;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  badgeLabel?: string;
  loading: boolean;
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  badgeLabel,
  loading,
}: StatCardProps) {
  return (
    <Card
      className="card-elevated"
      data-ocid={`dashboard.stat.${label.toLowerCase().replace(/\s/g, "_")}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-caption mb-1 truncate">{label}</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-3xl font-display font-bold text-foreground">
                {value?.toString() ?? "0"}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className={`rounded-xl p-2.5 ${iconBg}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            {badgeLabel && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {badgeLabel}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Project Progress Card ────────────────────────────────────────────────────

function ProjectProgressBar({ projectId }: { projectId: ProjectId }) {
  const { data: tasks } = useProjectTasks(projectId);
  if (!tasks || tasks.length === 0) return null;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const pct = Math.round((completed / tasks.length) * 100);
  return (
    <div className="mt-3">
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-caption mt-1">{pct}% Complete</p>
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectView }) {
  return (
    <Link
      to="/projects/$projectId"
      params={{ projectId: project.id.toString() }}
      data-ocid="dashboard.project.item"
      className="block"
    >
      <Card className="card-elevated hover:shadow-md transition-shadow cursor-pointer group h-full">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0 group-hover:bg-primary/20 transition-colors">
              <FolderKanban className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display font-semibold text-foreground text-sm truncate">
                {project.name}
              </p>
              <p className="text-caption truncate mt-0.5">
                {project.description || "No description"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {project.members.length}{" "}
                {project.members.length === 1 ? "member" : "members"}
              </p>
            </div>
          </div>
          <ProjectProgressBar projectId={project.id} />
        </CardContent>
      </Card>
    </Link>
  );
}

// ── Task Row ─────────────────────────────────────────────────────────────────

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-muted text-muted-foreground",
};

function getPriority(task: TaskView): "high" | "medium" | "low" {
  if (task.isOverdue) return "high";
  const now = BigInt(Date.now()) * BigInt(1_000_000);
  const diff = task.dueDate - now;
  const sevenDays = BigInt(7 * 24 * 60 * 60) * BigInt(1_000_000_000);
  if (diff < sevenDays) return "medium";
  return "low";
}

function formatDate(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
}

interface TaskRowProps {
  task: TaskView;
  index: number;
}

function TaskRow({ task, index }: TaskRowProps) {
  const priority = getPriority(task);
  const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1);

  return (
    <tr
      className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
      data-ocid={`dashboard.task.item.${index}`}
    >
      <td className="py-3 px-4 text-sm font-medium text-foreground max-w-[240px]">
        <span className="truncate block">{task.title}</span>
      </td>
      <td className="py-3 px-4">
        <TaskStatusBadgeFromTask task={task} />
      </td>
      <td className="py-3 px-4">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[priority]}`}
        >
          {priorityLabel}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {formatDate(task.dueDate)}
      </td>
    </tr>
  );
}

// ── Upcoming Tasks Panel ─────────────────────────────────────────────────────

function UpcomingTasksPanel({ projects }: { projects: ProjectView[] }) {
  const firstProject = projects[0] ?? null;
  const { data: tasks, isLoading } = useProjectTasks(
    firstProject ? firstProject.id : null,
  );

  const upcoming = tasks
    ? [...tasks]
        .sort((a, b) => {
          if (a.isOverdue && !b.isOverdue) return -1;
          if (!a.isOverdue && b.isOverdue) return 1;
          return Number(a.dueDate - b.dueDate);
        })
        .slice(0, 5)
    : [];

  return (
    <Card className="card-elevated" data-ocid="dashboard.upcoming_tasks.panel">
      <CardHeader className="pb-2 pt-5 px-5">
        <CardTitle className="text-headline-md">Upcoming Tasks</CardTitle>
        {firstProject && (
          <p className="text-caption">From: {firstProject.name}</p>
        )}
      </CardHeader>
      <CardContent className="p-0 pb-1">
        {isLoading ? (
          <div className="px-5 pb-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !upcoming.length ? (
          <div
            className="flex flex-col items-center gap-2 py-10 text-center px-5"
            data-ocid="dashboard.upcoming_tasks.empty_state"
          >
            <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              All caught up!
            </p>
            <p className="text-caption">No upcoming tasks in this project.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Task Name
                  </th>
                  <th className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                  <th className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Priority
                  </th>
                  <th className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((task, i) => (
                  <TaskRow key={task.id.toString()} task={task} index={i + 1} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Dashboard Page ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboard();
  const { data: projects, isLoading: projectsLoading } = useMyProjects();
  const { data: profile } = useCallerUserProfile();

  const greeting = profile?.displayName
    ? `Welcome back, ${profile.displayName.split(" ")[0]}!`
    : "Dashboard Overview";

  return (
    <div className="space-y-6" data-ocid="dashboard.page">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-lg">{greeting}</h2>
          <p className="text-caption mt-0.5">
            Here's what's happening with your projects today.
          </p>
        </div>
        <Link to="/projects">
          <Button size="sm" data-ocid="dashboard.new_project.primary_button">
            <Plus className="h-4 w-4 mr-1.5" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stat cards — 2 col mobile, 4 col desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Tasks"
          value={stats?.total}
          icon={ListTodo}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          loading={statsLoading}
        />
        <StatCard
          label="Completed"
          value={stats?.completed}
          icon={CheckCircle2}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
          badgeLabel="Success"
          loading={statsLoading}
        />
        <StatCard
          label="Pending"
          value={stats?.pending}
          icon={Clock}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600 dark:text-amber-400"
          badgeLabel="Pending"
          loading={statsLoading}
        />
        <StatCard
          label="Overdue"
          value={stats?.overdue}
          icon={AlertTriangle}
          iconBg="bg-red-100 dark:bg-red-900/30"
          iconColor="text-red-600 dark:text-red-400"
          badgeLabel="Overdue"
          loading={statsLoading}
        />
      </div>

      {/* Projects section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-headline-md">My Projects</h3>
          <Link to="/projects">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              data-ocid="dashboard.view_all_projects.link"
            >
              View all
            </Button>
          </Link>
        </div>

        {projectsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="card-elevated">
                <CardContent className="p-5 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-2 w-full mt-3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !projects || projects.length === 0 ? (
          <Card
            className="card-flat"
            data-ocid="dashboard.projects.empty_state"
          >
            <CardContent className="p-10 flex flex-col items-center gap-3 text-center">
              <div className="rounded-full bg-muted p-4">
                <FolderKanban className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-display font-semibold text-foreground">
                No projects yet
              </p>
              <p className="text-caption max-w-xs">
                Create your first project to start organizing tasks and
                collaborating with your team.
              </p>
              <Link to="/projects">
                <Button
                  size="sm"
                  className="mt-1"
                  data-ocid="dashboard.create_project.primary_button"
                >
                  <Plus className="h-4 w-4 mr-1.5" /> Create Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((project) => (
              <ProjectCard key={project.id.toString()} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming tasks */}
      {projects && projects.length > 0 && (
        <UpcomingTasksPanel projects={projects} />
      )}
    </div>
  );
}
