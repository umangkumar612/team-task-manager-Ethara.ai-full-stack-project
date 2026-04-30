import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import TaskTypes "../types/task";
import ProjectTypes "../types/project";
import TaskLib "../lib/task";
import ProjectLib "../lib/project";

mixin (
  accessControlState : AccessControl.AccessControlState,
  tasks : Map.Map<Common.TaskId, TaskTypes.Task>,
  projects : Map.Map<Common.ProjectId, ProjectTypes.Project>,
  nextTaskId : { var value : Nat },
) {
  public shared ({ caller }) func createTask(
    projectId : Common.ProjectId,
    title : Text,
    description : Text,
    dueDate : Common.Timestamp,
    assignedTo : ?Common.UserId,
  ) : async Common.TaskId {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    // Only project admins can create tasks
    if (not ProjectLib.isProjectAdmin(projects, projectId, caller)) {
      Runtime.trap("Unauthorized: Only project admins can create tasks");
    };
    let id = TaskLib.createTask(tasks, nextTaskId.value, projectId, title, description, dueDate, assignedTo, caller);
    nextTaskId.value += 1;
    id;
  };

  public query ({ caller }) func getTask(id : Common.TaskId) : async ?TaskTypes.TaskView {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    // Must be member of the task's project
    switch (tasks.get(id)) {
      case null null;
      case (?task) {
        if (not ProjectLib.isProjectMember(projects, task.projectId, caller)) {
          Runtime.trap("Unauthorized: Not a member of this project");
        };
        ?TaskLib.toView(task);
      };
    };
  };

  public query ({ caller }) func listProjectTasks(projectId : Common.ProjectId) : async [TaskTypes.TaskView] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    if (not ProjectLib.isProjectMember(projects, projectId, caller)) {
      Runtime.trap("Unauthorized: Not a member of this project");
    };
    TaskLib.listTasksForProject(tasks, projectId);
  };

  public shared ({ caller }) func updateTask(
    id : Common.TaskId,
    title : Text,
    description : Text,
    dueDate : Common.Timestamp,
    assignedTo : ?Common.UserId,
  ) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    // Only project admins can update task fields
    switch (tasks.get(id)) {
      case null false;
      case (?task) {
        if (not ProjectLib.isProjectAdmin(projects, task.projectId, caller)) {
          Runtime.trap("Unauthorized: Only project admins can update task details");
        };
        TaskLib.updateTask(tasks, id, title, description, dueDate, assignedTo, caller);
      };
    };
  };

  public shared ({ caller }) func updateTaskStatus(id : Common.TaskId, status : Common.TaskStatus) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    switch (tasks.get(id)) {
      case null false;
      case (?task) {
        // Assigned member or project admin can update status
        let isAssigned = switch (task.assignedTo) {
          case (?assignee) Principal.equal(assignee, caller);
          case null false;
        };
        let isProjectAdmin = ProjectLib.isProjectAdmin(projects, task.projectId, caller);
        if (not isAssigned and not isProjectAdmin) {
          Runtime.trap("Unauthorized: Only the assigned member or project admin can update task status");
        };
        TaskLib.updateTaskStatus(tasks, id, status, caller);
      };
    };
  };

  public shared ({ caller }) func deleteTask(id : Common.TaskId) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    // Only project admins can delete tasks
    switch (tasks.get(id)) {
      case null false;
      case (?task) {
        if (not ProjectLib.isProjectAdmin(projects, task.projectId, caller)) {
          Runtime.trap("Unauthorized: Only project admins can delete tasks");
        };
        TaskLib.deleteTask(tasks, id, caller);
      };
    };
  };

  public query ({ caller }) func getDashboard() : async TaskTypes.DashboardStats {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    TaskLib.getDashboardStats(tasks, projects, caller);
  };
};
