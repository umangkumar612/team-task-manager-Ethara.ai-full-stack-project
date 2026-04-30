import type { backendInterface } from "../backend.d";
import { ProjectRole, TaskStatus, UserRole } from "../backend.d";

const MOCK_PRINCIPAL = {
  toString: () => "aaaaa-aa",
  toText: () => "aaaaa-aa",
  toUint8Array: () => new Uint8Array(29),
  toHex: () => "00",
  compareTo: () => "eq" as const,
  isAnonymous: () => false,
} as unknown as import("@icp-sdk/core/principal").Principal;

const now = BigInt(Date.now()) * BigInt(1_000_000);
const dayMs = BigInt(24 * 60 * 60 * 1_000_000_000);

export const mockBackend: backendInterface = {
  addProjectMember: async () => true,
  assignCallerUserRole: async () => undefined,
  createProject: async () => BigInt(3),
  createTask: async () => BigInt(4),
  deleteProject: async () => true,
  deleteTask: async () => true,
  getCallerUserProfile: async () => ({ displayName: "Alice Johnson" }),
  getCallerUserRole: async () => UserRole.admin,
  getDashboard: async () => ({
    total: BigInt(24),
    pending: BigInt(9),
    completed: BigInt(12),
    overdue: BigInt(3),
  }),
  getProject: async (id) => ({
    id,
    name: "Website Redesign",
    description: "Refresh the marketing website with new brand guidelines",
    createdBy: MOCK_PRINCIPAL,
    members: [
      { userId: MOCK_PRINCIPAL, role: ProjectRole.admin },
    ],
  }),
  getTask: async (id) => ({
    id,
    title: "Update homepage hero section",
    description: "Implement new design tokens and update copy",
    status: TaskStatus.inProgress,
    assignedTo: MOCK_PRINCIPAL,
    createdAt: now - dayMs * BigInt(3),
    createdBy: MOCK_PRINCIPAL,
    dueDate: now + dayMs * BigInt(2),
    projectId: BigInt(1),
    isOverdue: false,
  }),
  getUserProfile: async () => ({ displayName: "Bob Smith" }),
  isCallerAdmin: async () => true,
  listMyProjects: async () => [
    {
      id: BigInt(1),
      name: "Website Redesign",
      description: "Refresh the marketing website with new brand guidelines",
      createdBy: MOCK_PRINCIPAL,
      members: [{ userId: MOCK_PRINCIPAL, role: ProjectRole.admin }],
    },
    {
      id: BigInt(2),
      name: "Mobile App v2",
      description: "Build out the iOS and Android companion app",
      createdBy: MOCK_PRINCIPAL,
      members: [
        { userId: MOCK_PRINCIPAL, role: ProjectRole.admin },
      ],
    },
  ],
  listProjectTasks: async () => [
    {
      id: BigInt(1),
      title: "Update homepage hero section",
      description: "Implement new design tokens and update copy",
      status: TaskStatus.inProgress,
      assignedTo: MOCK_PRINCIPAL,
      createdAt: now - dayMs * BigInt(3),
      createdBy: MOCK_PRINCIPAL,
      dueDate: now + dayMs * BigInt(2),
      projectId: BigInt(1),
      isOverdue: false,
    },
    {
      id: BigInt(2),
      title: "Fix navigation accessibility",
      description: "Ensure all nav elements have proper aria labels",
      status: TaskStatus.toDo,
      assignedTo: MOCK_PRINCIPAL,
      createdAt: now - dayMs * BigInt(5),
      createdBy: MOCK_PRINCIPAL,
      dueDate: now - dayMs * BigInt(1),
      projectId: BigInt(1),
      isOverdue: true,
    },
    {
      id: BigInt(3),
      title: "Write release notes",
      description: "Document all changes for v2 release",
      status: TaskStatus.completed,
      createdAt: now - dayMs * BigInt(7),
      createdBy: MOCK_PRINCIPAL,
      dueDate: now - dayMs * BigInt(2),
      projectId: BigInt(1),
      isOverdue: false,
    },
  ],
  removeProjectMember: async () => true,
  saveCallerUserProfile: async () => undefined,
  updateProject: async () => true,
  updateProjectMemberRole: async () => true,
  updateTask: async () => true,
  updateTaskStatus: async () => true,
};
