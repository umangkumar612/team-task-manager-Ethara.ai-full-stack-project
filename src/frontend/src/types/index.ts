// Re-export types from backend declaration file
export type {
  TaskView,
  ProjectView,
  ProjectMember,
  DashboardStats,
  UserProfile,
  UserId,
  TaskId,
  ProjectId,
  Timestamp,
} from "../backend";
// Re-export enums (values + types) from backend implementation
export { ProjectRole, TaskStatus, UserRole } from "../backend";

export interface TaskStatusInfo {
  label: string;
  className: string;
}
