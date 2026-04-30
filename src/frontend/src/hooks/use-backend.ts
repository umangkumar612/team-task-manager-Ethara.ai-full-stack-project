import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  ProjectId,
  ProjectRole,
  TaskId,
  TaskStatus,
  UserId,
  UserProfile,
} from "../types";

function useBackendActor() {
  return useActor(createActor);
}

// ── Profile ────────────────────────────────────────────────────────────────

export function useCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useBackendActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["callerUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerUserProfile"] });
    },
  });
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export function useDashboard() {
  const { actor, isFetching: actorFetching } = useBackendActor();
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getDashboard();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ── Projects ───────────────────────────────────────────────────────────────

export function useMyProjects() {
  const { actor, isFetching: actorFetching } = useBackendActor();
  return useQuery({
    queryKey: ["myProjects"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.listMyProjects();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useProject(id: ProjectId | null) {
  const { actor, isFetching: actorFetching } = useBackendActor();
  return useQuery({
    queryKey: ["project", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) throw new Error("Actor not available");
      return actor.getProject(id);
    },
    enabled: !!actor && !actorFetching && id !== null,
  });
}

export function useCreateProject() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
    }: { name: string; description: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createProject(name, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProjects"] });
    },
  });
}

export function useUpdateProject() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
    }: { id: ProjectId; name: string; description: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateProject(id, name, description);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["myProjects"] });
      queryClient.invalidateQueries({
        queryKey: ["project", vars.id.toString()],
      });
    },
  });
}

export function useDeleteProject() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: ProjectId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteProject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProjects"] });
    },
  });
}

export function useAddProjectMember() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      userId,
      role,
    }: { projectId: ProjectId; userId: UserId; role: ProjectRole }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addProjectMember(projectId, userId, role);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["project", vars.projectId.toString()],
      });
    },
  });
}

export function useUpdateProjectMemberRole() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      userId,
      role,
    }: { projectId: ProjectId; userId: UserId; role: ProjectRole }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateProjectMemberRole(projectId, userId, role);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["project", vars.projectId.toString()],
      });
    },
  });
}

export function useRemoveProjectMember() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      userId,
    }: { projectId: ProjectId; userId: UserId }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removeProjectMember(projectId, userId);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["project", vars.projectId.toString()],
      });
    },
  });
}

// ── Tasks ──────────────────────────────────────────────────────────────────

export function useProjectTasks(projectId: ProjectId | null) {
  const { actor, isFetching: actorFetching } = useBackendActor();
  return useQuery({
    queryKey: ["projectTasks", projectId?.toString()],
    queryFn: async () => {
      if (!actor || projectId === null) throw new Error("Actor not available");
      return actor.listProjectTasks(projectId);
    },
    enabled: !!actor && !actorFetching && projectId !== null,
  });
}

export function useTask(id: TaskId | null) {
  const { actor, isFetching: actorFetching } = useBackendActor();
  return useQuery({
    queryKey: ["task", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) throw new Error("Actor not available");
      return actor.getTask(id);
    },
    enabled: !!actor && !actorFetching && id !== null,
  });
}

export function useCreateTask() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      title,
      description,
      dueDate,
      assignedTo,
    }: {
      projectId: ProjectId;
      title: string;
      description: string;
      dueDate: bigint;
      assignedTo: UserId | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createTask(
        projectId,
        title,
        description,
        dueDate,
        assignedTo,
      );
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["projectTasks", vars.projectId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTask() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      projectId: _projectId,
      title,
      description,
      dueDate,
      assignedTo,
    }: {
      id: TaskId;
      projectId: ProjectId;
      title: string;
      description: string;
      dueDate: bigint;
      assignedTo: UserId | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateTask(id, title, description, dueDate, assignedTo);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["task", vars.id.toString()] });
      queryClient.invalidateQueries({
        queryKey: ["projectTasks", vars.projectId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTaskStatus() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      projectId: _projectId,
    }: {
      id: TaskId;
      status: TaskStatus;
      projectId: ProjectId;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateTaskStatus(id, status);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["task", vars.id.toString()] });
      queryClient.invalidateQueries({
        queryKey: ["projectTasks", vars.projectId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteTask() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      projectId: _projectId,
    }: { id: TaskId; projectId: ProjectId }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteTask(id);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["projectTasks", vars.projectId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
