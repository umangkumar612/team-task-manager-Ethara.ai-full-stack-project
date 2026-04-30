import { ProjectRole, TaskStatus } from "../types";
import type { TaskView } from "../types";

interface StatusBadgeProps {
  status: TaskStatus;
  isOverdue?: boolean;
}

export function TaskStatusBadge({ status, isOverdue }: StatusBadgeProps) {
  if (isOverdue && status !== TaskStatus.completed) {
    return <span className="badge-overdue">Overdue</span>;
  }
  if (status === TaskStatus.completed) {
    return <span className="badge-complete">Complete</span>;
  }
  if (status === TaskStatus.inProgress) {
    return <span className="badge-admin">In Progress</span>;
  }
  return <span className="badge-pending">To Do</span>;
}

interface RoleBadgeProps {
  role: ProjectRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  if (role === ProjectRole.admin) {
    return <span className="badge-admin">Admin</span>;
  }
  return <span className="badge-member">Member</span>;
}

export function TaskStatusBadgeFromTask({
  task,
}: { task: Pick<TaskView, "status" | "isOverdue"> }) {
  return <TaskStatusBadge status={task.status} isOverdue={task.isOverdue} />;
}
