import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  FolderOpen,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "../components/ConfirmDialog";
import { RoleBadge } from "../components/StatusBadge";
import {
  useCreateProject,
  useDeleteProject,
  useMyProjects,
  useUpdateProject,
} from "../hooks/use-backend";
import { type ProjectId, ProjectRole, type ProjectView } from "../types";

// ── Project Form Modal ──────────────────────────────────────────────────────

interface ProjectFormModalProps {
  open: boolean;
  project?: ProjectView | null;
  onClose: () => void;
}

function ProjectFormModal({ open, project, onClose }: ProjectFormModalProps) {
  const isEdit = !!project;
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const isPending = createProject.isPending || updateProject.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    try {
      if (isEdit && project) {
        await updateProject.mutateAsync({
          id: project.id,
          name: trimmedName,
          description: description.trim(),
        });
        toast.success("Project updated successfully");
      } else {
        await createProject.mutateAsync({
          name: trimmedName,
          description: description.trim(),
        });
        toast.success("Project created successfully");
      }
      onClose();
    } catch {
      toast.error(
        isEdit ? "Failed to update project" : "Failed to create project",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-ocid="project_form.dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            {isEdit ? "Edit Project" : "New Project"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              data-ocid="project_form.name.input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Website Redesign"
              maxLength={80}
              required
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-desc">Description</Label>
            <Textarea
              id="project-desc"
              data-ocid="project_form.description.textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={3}
              maxLength={500}
              className="resize-none"
            />
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="project_form.cancel_button"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="project_form.submit_button"
              disabled={isPending || !name.trim()}
            >
              {isPending
                ? isEdit
                  ? "Saving…"
                  : "Creating…"
                : isEdit
                  ? "Save changes"
                  : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Project Card ─────────────────────────────────────────────────────────────

interface ProjectCardProps {
  project: ProjectView;
  index: number;
  onEdit: (p: ProjectView) => void;
  onDelete: (id: ProjectId) => void;
}

function ProjectCard({ project, index, onEdit, onDelete }: ProjectCardProps) {
  const callerMember = project.members[0];
  const memberCount = project.members.length;
  const hasAdminMember = project.members.some(
    (m) => m.role === ProjectRole.admin,
  );

  return (
    <div
      data-ocid={`projects.item.${index}`}
      className="group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-primary/30 transition-smooth"
    >
      {/* Full-card link layer */}
      <Link
        to="/projects/$projectId"
        params={{ projectId: project.id.toString() }}
        className="flex flex-col gap-3 p-5 flex-1"
        data-ocid={`projects.item.${index}.link`}
      >
        {/* Admin actions overlay */}
        {hasAdminMember && (
          <div className="absolute top-3.5 right-3.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-smooth z-10">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
              data-ocid={`projects.edit_button.${index}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(project);
              }}
              aria-label="Edit project"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              data-ocid={`projects.delete_button.${index}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(project.id);
              }}
              aria-label="Delete project"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Card body */}
        <div className="flex items-start gap-3 pr-16 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FolderOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-semibold text-foreground text-sm leading-snug truncate">
              {project.name}
            </h3>
            {callerMember && (
              <div className="mt-1.5">
                <RoleBadge role={callerMember.role} />
              </div>
            )}
          </div>
        </div>

        {project.description && (
          <p className="text-body-sm text-muted-foreground line-clamp-2 min-w-0">
            {project.description}
          </p>
        )}

        {/* Footer stats */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <span className="flex items-center gap-1.5 text-caption">
            <Users className="h-3.5 w-3.5" />
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors duration-200">
            View tasks
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>
    </div>
  );
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

function ProjectCardSkeleton() {
  return (
    <div className="flex flex-col bg-card border border-border rounded-xl p-5 gap-3">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div
      data-ocid="projects.empty_state"
      className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-border bg-card/50 py-20 px-8 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <FolderOpen className="h-8 w-8" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-display font-semibold text-foreground text-lg">
          No projects yet
        </h3>
        <p className="text-body-sm text-muted-foreground max-w-xs">
          Create your first project to start organizing tasks and collaborating
          with your team.
        </p>
      </div>
      <Button
        onClick={onCreateClick}
        data-ocid="projects.empty_state.create_button"
        className="mt-1"
      >
        <Plus className="h-4 w-4 mr-1.5" />
        Create your first project
      </Button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const { data: projects, isLoading } = useMyProjects();
  const { mutate: deleteProject } = useDeleteProject();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectView | null>(
    null,
  );
  const [deleteTargetId, setDeleteTargetId] = useState<ProjectId | null>(null);

  const deleteTargetProject = projects?.find((p) => p.id === deleteTargetId);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormOpen(true);
  };

  const handleEdit = (project: ProjectView) => {
    setEditingProject(project);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingProject(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId === null) return;
    deleteProject(deleteTargetId, {
      onSuccess: () => {
        toast.success("Project deleted");
        setDeleteTargetId(null);
      },
      onError: () => toast.error("Failed to delete project"),
    });
  };

  return (
    <div
      data-ocid="projects.page"
      className="flex flex-col gap-6 p-6 max-w-7xl mx-auto"
    >
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg text-foreground">Projects</h1>
          <p className="text-body-sm text-muted-foreground mt-0.5">
            {isLoading
              ? "Loading your projects…"
              : `${projects?.length ?? 0} ${(projects?.length ?? 0) === 1 ? "project" : "projects"}`}
          </p>
        </div>
        <Button
          data-ocid="projects.create_button"
          onClick={handleOpenCreate}
          className="shrink-0"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New project
        </Button>
      </div>

      {/* Content grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((k) => (
            <ProjectCardSkeleton key={k} />
          ))}
        </div>
      ) : !projects || projects.length === 0 ? (
        <EmptyState onCreateClick={handleOpenCreate} />
      ) : (
        <div
          data-ocid="projects.list"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {projects.map((project, idx) => (
            <ProjectCard
              key={project.id.toString()}
              project={project}
              index={idx + 1}
              onEdit={handleEdit}
              onDelete={setDeleteTargetId}
            />
          ))}
        </div>
      )}

      {/* Create / Edit modal — key forces remount when switching between create/edit */}
      <ProjectFormModal
        key={editingProject ? editingProject.id.toString() : "create"}
        open={formOpen}
        project={editingProject}
        onClose={handleFormClose}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTargetId !== null}
        title="Delete project"
        description={`Are you sure you want to delete "${deleteTargetProject?.name ?? "this project"}"? This cannot be undone and all associated tasks will be removed.`}
        confirmLabel="Delete project"
        destructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
