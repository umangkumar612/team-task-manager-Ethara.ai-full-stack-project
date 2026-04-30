import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type UserId = Principal;
export type Timestamp = bigint;
export interface TaskView {
    id: TaskId;
    status: TaskStatus;
    title: string;
    assignedTo?: UserId;
    createdAt: Timestamp;
    createdBy: UserId;
    dueDate: Timestamp;
    description: string;
    projectId: ProjectId;
    isOverdue: boolean;
}
export interface ProjectMember {
    userId: UserId;
    role: ProjectRole;
}
export type TaskId = bigint;
export interface ProjectView {
    id: ProjectId;
    members: Array<ProjectMember>;
    name: string;
    createdBy: UserId;
    description: string;
}
export type ProjectId = bigint;
export interface DashboardStats {
    total: bigint;
    pending: bigint;
    completed: bigint;
    overdue: bigint;
}
export interface UserProfile {
    displayName: string;
}
export enum ProjectRole {
    member = "member",
    admin = "admin"
}
export enum TaskStatus {
    toDo = "toDo",
    completed = "completed",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProjectMember(projectId: ProjectId, userId: UserId, role: ProjectRole): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProject(name: string, description: string): Promise<ProjectId>;
    createTask(projectId: ProjectId, title: string, description: string, dueDate: Timestamp, assignedTo: UserId | null): Promise<TaskId>;
    deleteProject(id: ProjectId): Promise<boolean>;
    deleteTask(id: TaskId): Promise<boolean>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboard(): Promise<DashboardStats>;
    getProject(id: ProjectId): Promise<ProjectView | null>;
    getTask(id: TaskId): Promise<TaskView | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listMyProjects(): Promise<Array<ProjectView>>;
    listProjectTasks(projectId: ProjectId): Promise<Array<TaskView>>;
    removeProjectMember(projectId: ProjectId, userId: UserId): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateProject(id: ProjectId, name: string, description: string): Promise<boolean>;
    updateProjectMemberRole(projectId: ProjectId, userId: UserId, role: ProjectRole): Promise<boolean>;
    updateTask(id: TaskId, title: string, description: string, dueDate: Timestamp, assignedTo: UserId | null): Promise<boolean>;
    updateTaskStatus(id: TaskId, status: TaskStatus): Promise<boolean>;
}
