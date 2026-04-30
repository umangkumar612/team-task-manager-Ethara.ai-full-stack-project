import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Common "../types/common";
import TaskTypes "../types/task";
import ProjectTypes "../types/project";

module {
  public func isOverdue(task : TaskTypes.Task) : Bool {
    task.status != #completed and Time.now() > task.dueDate;
  };

  public func toView(task : TaskTypes.Task) : TaskTypes.TaskView {
    {
      id = task.id;
      projectId = task.projectId;
      title = task.title;
      description = task.description;
      dueDate = task.dueDate;
      assignedTo = task.assignedTo;
      status = task.status;
      createdBy = task.createdBy;
      createdAt = task.createdAt;
      isOverdue = isOverdue(task);
    };
  };

  public func createTask(
    tasks : Map.Map<Common.TaskId, TaskTypes.Task>,
    nextId : Nat,
    projectId : Common.ProjectId,
    title : Text,
    description : Text,
    dueDate : Common.Timestamp,
    assignedTo : ?Common.UserId,
    caller : Common.UserId,
  ) : Common.TaskId {
    let id = nextId;
    let task : TaskTypes.Task = {
      id;
      projectId;
      var title = title;
      var description = description;
      var dueDate = dueDate;
      var assignedTo = assignedTo;
      var status = #toDo;
      createdBy = caller;
      createdAt = Time.now();
    };
    tasks.add(id, task);
    id;
  };

  public func getTask(
    tasks : Map.Map<Common.TaskId, TaskTypes.Task>,
    id : Common.TaskId,
  ) : ?TaskTypes.TaskView {
    switch (tasks.get(id)) {
      case null null;
      case (?task) ?toView(task);
    };
  };

  public func listTasksForProject(
    tasks : Map.Map<Common.TaskId, TaskTypes.Task>,
    projectId : Common.ProjectId,
  ) : [TaskTypes.TaskView] {
    let results = tasks.entries().filterMap(
      func((_, task) : (Common.TaskId, TaskTypes.Task)) : ?TaskTypes.TaskView {
        if (task.projectId == projectId) ?toView(task) else null
      }
    );
    results.toArray();
  };

  public func updateTask(
    tasks : Map.Map<Common.TaskId, TaskTypes.Task>,
    id : Common.TaskId,
    title : Text,
    description : Text,
    dueDate : Common.Timestamp,
    assignedTo : ?Common.UserId,
    _caller : Common.UserId,
  ) : Bool {
    switch (tasks.get(id)) {
      case null false;
      case (?task) {
        task.title := title;
        task.description := description;
        task.dueDate := dueDate;
        task.assignedTo := assignedTo;
        true;
      };
    };
  };

  public func updateTaskStatus(
    tasks : Map.Map<Common.TaskId, TaskTypes.Task>,
    id : Common.TaskId,
    status : Common.TaskStatus,
    _caller : Common.UserId,
  ) : Bool {
    switch (tasks.get(id)) {
      case null false;
      case (?task) {
        // Caller must be the assigned user or it's handled by the mixin with project-admin check
        task.status := status;
        true;
      };
    };
  };

  public func deleteTask(
    tasks : Map.Map<Common.TaskId, TaskTypes.Task>,
    id : Common.TaskId,
    _caller : Common.UserId,
  ) : Bool {
    switch (tasks.get(id)) {
      case null false;
      case (?_) {
        tasks.remove(id);
        true;
      };
    };
  };

  public func getDashboardStats(
    tasks : Map.Map<Common.TaskId, TaskTypes.Task>,
    projects : Map.Map<Common.ProjectId, ProjectTypes.Project>,
    userId : Common.UserId,
  ) : TaskTypes.DashboardStats {
    // Collect project IDs the user is a member of
    let userProjectIds = projects.entries().filterMap(
      func((projectId, project) : (Common.ProjectId, ProjectTypes.Project)) : ?Common.ProjectId {
        let isMember = project.members.any(func(m : ProjectTypes.ProjectMember) : Bool {
          Principal.equal(m.userId, userId)
        });
        if (isMember) ?projectId else null;
      }
    );

    // Collect all tasks in user's projects
    var total = 0;
    var completed = 0;
    var pending = 0;
    var overdue = 0;

    for (projectId in userProjectIds) {
      for ((_, task) in tasks.entries()) {
        if (task.projectId == projectId) {
          total += 1;
          switch (task.status) {
            case (#completed) { completed += 1 };
            case (#toDo or #inProgress) {
              pending += 1;
              if (isOverdue(task)) { overdue += 1 };
            };
          };
        };
      };
    };

    { total; completed; pending; overdue };
  };
};
